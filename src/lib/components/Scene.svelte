<script lang="ts">
  /**
   * The Scene itself: the only thing the class ever looks at.
   *
   * Nothing here reports a number, shows a meter or displays a "too loud"
   * badge. The single class-facing signal is the Scene clouding over — murky
   * water on the reef, a dusty haze on the savanna, interference breaking up
   * the signal in deep space — which is legible from the back of a room and
   * is not a button a child can press.
   * See docs/adr/0001-nothing-is-taken-away.md.
   */

  import { t } from "$lib/i18n/index.svelte";
  import type { SceneDef } from "$lib/scenes";
  import {
    retrySceneArt,
    sceneArt,
    sceneArtFailed,
    type SceneArt,
  } from "$lib/scenes/art.svelte";
  import type { CreatureInstance } from "$lib/session/session.svelte";
  import { welcomeFor } from "$lib/scenes/welcome";
  import Creature from "./Creature.svelte";
  import HollowSign from "./HollowSign.svelte";

  let {
    scene,
    creatures,
    newestId,
    murky,
    frozen,
    listening,
    scares,
    fleeing,
    ondepart,
    canRetry = true,
  }: {
    scene: SceneDef;
    creatures: CreatureInstance[];
    newestId: number | null;
    murky: boolean;
    /** Too Loud: everyone holds still, except any Creature running away. */
    frozen: boolean;
    /**
     * Paused: the teacher is talking, so every Creature stops and turns to
     * listen, modelling what the class should be doing.
     */
    listening: boolean;
    /**
     * The teacher chose "animals run away". The haze is then only a hint:
     * everyone freezing and bolting is the signal, and must stay sharp.
     */
    scares: boolean;
    /** Ids of the Creatures running away, or fading out. */
    fleeing: number[];
    /** A fleeing Creature has run out of sight, or faded away. */
    ondepart: (id: number) => void;
    /**
     * Whether the stage may offer to fetch its drawings again. False while the
     * start card, or the blocked-microphone card, covers the stage: the button
     * would sit behind it where the teacher cannot press it. Starting the
     * Session brings the offer up.
     */
    canRetry?: boolean;
  } = $props();

  /** One the Scene answers to is here, or has just come. */
  const welcome = $derived(
    welcomeFor(scene.welcomes, creatures, newestId, fleeing),
  );

  /**
   * The Scene's artwork, which is fetched per Scene (`scenes/art.svelte.ts`).
   * Absent for the moment it takes the default Scene's share to arrive, so the
   * stage keeps its own colours and fills in when the drawings land.
   */
  const art = $derived(sceneArt(scene.id));
  /** True when this Scene's art could not be fetched at all, after retries. */
  const failed = $derived(sceneArtFailed(scene.id));

  /**
   * What the stage is actually showing: the last Scene whose art arrived.
   * Keeping it means switching Scene never empties the screen while the new
   * drawings are on their way — the old world stays until the new one is ready
   * to take its place. On the very first load there is nothing to keep, and a
   * quiet placeholder stands in (see below).
   */
  // Read once on purpose: a Scene whose art is already loaded draws on its
  // first frame, instead of flashing the placeholder for one.
  // svelte-ignore state_referenced_locally
  let drawn = $state<SceneArt | null>(art ?? null);
  $effect(() => {
    const ready = art;
    if (ready) drawn = ready;
  });
</script>

<div
  class="scene-stage absolute inset-0 overflow-hidden"
  data-scene={scene.id}
  data-murky={murky}
  data-frozen={frozen}
  data-scares={scares}
  data-welcome={welcome}
>
  <!--
    The whole landscape in one piece of artwork. It sits inside the container
    Too Loud filters, so a loud room clouds the Scene itself rather than
    tinting the animals in it.
  -->
  {#if drawn}
    {@const Ambient = drawn.Ambient}
    <div class="backdrop absolute inset-y-0">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html drawn.ambientArt.backdrop}
    </div>

    <Ambient />
  {:else if !failed}
    <!--
      The very first load, before even the default Scene's drawings have
      arrived: the Scene's own tile, breathing in the middle of the stage,
      rather than a spinner or an empty screen. The stage already carries the
      Scene's colours, so this reads as the world arriving.
    -->
    <div class="absolute inset-0 grid place-items-center" role="status">
      <img src={scene.icon} alt="" class="size-16 animate-pulse opacity-70" />
      <span class="sr-only">{t("scene.loading")}</span>
    </div>
  {/if}

  {#if art}
    <!--
      Keyed by Scene as well: each Scene numbers its animals from 1, so an id
      alone would hand the reef's fish #3 component to the savanna's giraffe #3,
      and the giraffe would carry on with the fish's swimming motion.
    -->
    {#each creatures as creature (`${scene.id}:${creature.id}`)}
      <Creature
        {creature}
        art={art.creatureArt[creature.def.slug]}
        listeningArt={art.listeningArt[creature.def.slug]}
        depthFade={scene.depthFade}
        departure={creature.def.departure ?? scene.departure}
        whilePaused={scene.whilePaused}
        isNewest={creature.id === newestId}
        {frozen}
        {listening}
        fleeing={fleeing.includes(creature.id)}
        ongone={() => ondepart(creature.id)}
      />
    {/each}

    {#if scene.id === "halloween"}
      <HollowSign />
    {/if}
  {/if}

  {#if failed && canRetry}
    <!--
      The drawings never arrived, even after the automatic retries. Above the
      veil, so a loud room cannot dim the one thing that needs reading; the
      teacher is the only one who can do anything about it. Waiting for the
      start card to be out of the way, since it covers this and would swallow
      the button.
    -->
    <div class="absolute inset-0 z-[2500] grid place-items-center p-4">
      <div
        class="w-full max-w-xs rounded-2xl bg-paper px-4 py-3 text-center shadow-panel"
        role="alert"
      >
        <p class="text-sm font-semibold text-ink">{t("scene.failed")}</p>
        <button
          class="mt-2 rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper hover:bg-ink/90"
          onclick={() => void retrySceneArt(scene.id)}
        >
          {t("blocked.tryAgain")}
        </button>
      </div>
    </div>
  {/if}

  <!-- One veil over the whole Scene, never a per-Creature effect. -->
  <div class="too-loud-veil pointer-events-none absolute inset-0"></div>
</div>
