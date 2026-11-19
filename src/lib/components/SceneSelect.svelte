<script lang="ts">
  /**
   * Which Scene to start in, on the start card. A drop-down rather than a
   * row of buttons, now that there are too many Scenes to take in at a
   * glance; it opens the same list as the menu in the bottom right.
   *
   * Tagged "New" while the list has a new Scene in it that the teacher has
   * not seen yet (`newScenes.svelte.ts`).
   */

  import type { App } from "$lib/app.svelte";
  import { t, type UiKey } from "$lib/i18n/index.svelte";
  import type { SceneId } from "$lib/scenes";
  import { newScenes } from "$lib/scenes/newScenes.svelte";
  import SceneMenu from "./SceneMenu.svelte";
  import { sceneHint } from "$lib/scenes/halloween/wording";
  import { today } from "$lib/today.svelte";

  let { app }: { app: App } = $props();

  let open = $state(false);
  let container: HTMLElement;
  let flagged = $derived(newScenes.unseen(today.day).length > 0);

  /**
   * The start card sits mid-screen, so the list opens whichever way has
   * more room, and is never taller than that room: on a projector the
   * screen is short, and the last Scenes must not end up below its edge.
   */
  let upward = $state(false);
  let room = $state<number>();

  function toggle() {
    if (!open) {
      const box = container.getBoundingClientRect();
      const below = window.innerHeight - box.bottom;
      upward = box.top > below;
      room = Math.max(160, (upward ? box.top : below) - 24);
    }
    open = !open;
  }

  function choose(id: SceneId) {
    app.useScene(id);
    open = false;
  }
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === "Escape") open = false;
  }}
  onpointerdown={(event) => {
    if (open && !container.contains(event.target as Node)) open = false;
  }}
/>

<div class="relative w-full" bind:this={container}>
  <!-- A Scene is always shown, even before the saved one is known. The page
       is prerendered with the default, and hiding it until hydration left a
       blank pill that looked broken and could not be opened. -->
  <button
    type="button"
    class={[
      "relative flex w-full items-center gap-3 rounded-2xl bg-paper-deep/70 py-2 pr-3 pl-2.5 text-left transition hover:bg-paper-deep",
      open && "bg-paper-deep ring-1 ring-ink/35",
    ]}
    aria-expanded={open}
    aria-controls="start-scene-menu"
    aria-label="{t('scene.change')}: {t(
      `scene.${app.scene.id}.name` as UiKey,
    )}{flagged ? ` (${t('scene.newScenes')})` : ''}"
    onclick={toggle}
  >
    <span class="flex min-w-0 flex-1 items-center gap-3">
      <img src={app.scene.icon} alt="" class="size-10 shrink-0" />
      <span class="min-w-0 flex-1">
        <span class="block text-[0.95rem] font-semibold text-ink"
          >{t(`scene.${app.scene.id}.name` as UiKey)}</span
        >
        <span class="block truncate text-xs text-ink-soft"
          >{sceneHint(app.scene.id, today.day)}</span
        >
      </span>
    </span>
    <svg
      viewBox="0 0 24 24"
      class={[
        "size-4 shrink-0 text-ochre-deep transition",
        open && "rotate-180",
      ]}
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
    {#if flagged && !open}
      <span
        class="pointer-events-none absolute -top-2 -right-2 rounded-full bg-ochre px-1.5 py-px text-[0.65rem] font-semibold tracking-wide text-paper uppercase shadow-lift ring-2 ring-paper"
        aria-hidden="true">{t("scene.new")}</span
      >
    {/if}
  </button>

  {#if open}
    <div
      class={[
        "absolute inset-x-0 z-10",
        upward ? "bottom-full pb-2" : "top-full pt-2",
      ]}
    >
      <SceneMenu
        id="start-scene-menu"
        class="w-full"
        maxHeight={room}
        chosen={app.restored ? app.scene.id : null}
        onchoose={choose}
      />
    </div>
  {/if}
</div>
