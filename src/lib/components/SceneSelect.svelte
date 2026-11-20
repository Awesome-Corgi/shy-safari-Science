<script lang="ts">
  /**
   * Which Scene to start in, on the start card: a row of stamps, one per
   * place, rather than a drop-down. Each stamp warms its own artwork as soon
   * as it is pointed at, and choosing one repaints the Scene behind the card
   * — so the teacher sees the world they are choosing before the Session
   * begins, and the card cannot be mistaken for a form.
   *
   * Tagged with a dot while the list has a Scene the teacher has not seen yet
   * (`newScenes.svelte.ts`).
   */

  import type { App } from "$lib/app.svelte";
  import { t, type UiKey } from "$lib/i18n/index.svelte";
  import { availableScenes, type SceneId } from "$lib/scenes";
  import { loadSceneArt } from "$lib/scenes/art.svelte";
  import { newScenes } from "$lib/scenes/newScenes.svelte";
  import { sceneHint } from "$lib/scenes/halloween/wording";
  import { today } from "$lib/today.svelte";

  let { app }: { app: App } = $props();

  const stamps = $derived(availableScenes(today.day));
  const fresh = $derived(newScenes.unseen(today.day).map((scene) => scene.id));

  function choose(id: SceneId) {
    app.useScene(id);
    // Seen now, so the dot does not follow the teacher into every Session.
    newScenes.markSeen(today.day);
  }
</script>

<div class="grid grid-cols-4 gap-1" role="group" aria-label={t("scene.label")}>
  {#each stamps as stamp (stamp.id)}
    {@const current = stamp.id === app.scene.id}
    {@const hint = sceneHint(stamp.id, today.day)}
    <button
      type="button"
      class="group relative flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 pt-1.5 pb-1 transition {current
        ? 'bg-paper-deep'
        : 'hover:bg-paper-deep/60'}"
      aria-pressed={current}
      title={hint}
      onpointerenter={() => void loadSceneArt(stamp.id)}
      onfocus={() => void loadSceneArt(stamp.id)}
      onclick={() => choose(stamp.id)}
    >
      <img
        src={stamp.icon}
        alt=""
        class="size-9 transition {current
          ? 'drop-shadow-[0_2px_3px_rgb(38_38_51_/_0.18)]'
          : 'opacity-65 group-hover:opacity-100'}"
      />
      <span
        class="flex min-h-7 w-full items-start justify-center text-center text-[0.66rem] leading-[1.15] font-semibold text-balance {current
          ? 'text-ink'
          : 'text-ink-soft'}">{t(`scene.${stamp.id}.name` as UiKey)}</span
      >
      {#if current}
        <span
          class="absolute inset-x-3 bottom-0.5 h-[2px] rounded-full bg-ochre"
          aria-hidden="true"
        ></span>
      {/if}
      {#if fresh.includes(stamp.id) && !current}
        <span
          class="absolute top-1 right-1 size-2 rounded-full bg-ochre-deep ring-2 ring-paper"
          aria-hidden="true"
        ></span>
      {/if}
    </button>
  {/each}
</div>
