<script lang="ts">
  /**
   * The Session's dock: one floating panel along the bottom of the Scene with
   * what the teacher needs while the room is being judged — how the Class
   * stands in the Cup, the room's level against the goal, and Pause / Reset.
   *
   * It sits on the artwork, so it is glass rather than a toolbar: it takes the
   * Scene's own temperature (the same tokens as the rest of the chrome, in
   * `layout.css`), and on the savanna it is matte, opaque dust-paper that hides
   * nothing behind it. See
   * docs/adr/0018-the-dock-is-glass-over-the-scene.md.
   *
   * It fades with the rest of the chrome so the class sees the Scene, which
   * leaves the Noise Meter chip up top for whoever is watching the room from
   * the back. Reset is the only irreversible thing here, so it asks first, in
   * a card above the dock.
   */

  import type { App } from "$lib/app.svelte";
  import { classes } from "$lib/classes/classes.svelte";
  import { placeOf } from "$lib/classes/cup";
  import { cup } from "$lib/classes/cup.svelte";
  import { className, placeLabel, t, tIn } from "$lib/i18n/index.svelte";
  import { settings } from "$lib/settings/settings.svelte";
  import { formatRemaining } from "$lib/timer/countdown";
  import MeterBar from "./MeterBar.svelte";

  let {
    app,
    visible,
    onopensettings,
  }: {
    app: App;
    visible: boolean;
    onopensettings: () => void;
  } = $props();

  let confirmingReset = $state(false);

  function reset() {
    app.resetSession();
    confirmingReset = false;
  }

  const percent = $derived(cup.percent(classes.currentId));
  const place = $derived(
    percent === null
      ? null
      : placeOf(
          percent,
          classes.all.map((info) => cup.percent(info.id)),
        ),
  );
  const placeText = $derived(place === null ? null : placeLabel(place));
  const name = $derived(className(classes.current.name));
  const scoreLabel = $derived(
    percent === null || placeText === null
      ? t("cup.chipNone", { name })
      : t("cup.sceneChip", { name, percent, place: placeText }),
  );
  const count = $derived(app.session.creatures.length);
  /** Rounding up, so the last second reads 0:01 rather than a lie. */
  const remaining = $derived(
    formatRemaining((1 - app.session.progress) * settings.arrivalIntervalMs),
  );

  // Don't leave a confirmation waiting behind a dock that has faded away.
  $effect(() => {
    if (!visible) confirmingReset = false;
  });
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === "Escape") confirmingReset = false;
  }}
/>

<!-- Above the corner chips on a phone, where the dock has no room beside
     them; beside them on a computer, where it is narrower than the screen. -->
<div
  class="safe-edges pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center transition-[opacity,transform] duration-300 max-sm:bottom-[4.5rem]"
  class:translate-y-2={!visible}
  class:opacity-0={!visible}
  aria-hidden={!visible}
  inert={!visible}
>
  <div class="relative w-full max-w-2xl">
    {#if confirmingReset && app.session.running}
      <div
        class="rise absolute bottom-full left-1/2 mb-3 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-[22px] border border-line bg-paper px-4 py-3 text-center shadow-panel"
        role="alertdialog"
        aria-label={t("controls.confirmReset")}
      >
        <span class="px-1 text-sm text-ink-soft">
          {t("controls.resetQuestion")}
        </span>
        <button
          class="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-paper transition hover:brightness-110"
          onclick={reset}
        >
          {t("controls.resetYes")}
        </button>
        <button
          class="rounded-full px-4 py-2 text-sm text-ink-soft transition hover:bg-paper-deep hover:text-ink"
          onclick={() => (confirmingReset = false)}
        >
          {t("controls.keepGoing")}
        </button>
      </div>
    {/if}

    <div
      class="chrome flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[26px] px-4 py-3 sm:flex-nowrap sm:rounded-[30px] sm:px-5 sm:py-4"
      class:pointer-events-auto={visible}
    >
      <!-- Where the Class stands: one soft blob of the Scene's accent, and a
           line telling the teacher what it is. -->
      <div class="flex min-w-0 items-center gap-3">
        <span
          class="dock-score grid h-11 min-w-14 shrink-0 place-items-center rounded-full px-3 font-mono text-[1.05rem] leading-none font-medium text-ink tabular-nums"
          role="img"
          aria-label={scoreLabel}
        >
          {percent === null ? "—" : `${percent}%`}
        </span>
        <span class="min-w-0">
          <span
            class="block text-[0.6rem] font-semibold tracking-[0.16em] text-ink-soft uppercase"
          >
            {t("dock.underLine")}
          </span>
          <span class="block truncate text-xs font-medium text-ink-soft">
            {#if placeText === null}
              {name}
            {:else}
              {t("dock.place", {
                place: placeText,
                count: classes.all.length,
              })}
            {/if}
          </span>
        </span>
      </div>

      <!-- The room, live, and how long until the next animal dares to come
           out. Order-last on a phone, where it takes the full width. -->
      <div class="order-2 w-full min-w-0 flex-1 sm:order-none">
        <MeterBar
          level={app.monitor.level}
          goal={settings.volumeGoal}
          tooLoud={app.monitor.state === "too-loud"}
          class="h-2 rounded-full"
        />
        <div
          class="mt-2 flex items-baseline justify-between gap-3 text-[0.68rem] font-medium text-ink-soft max-sm:justify-end"
        >
          <span class="hidden truncate sm:inline"
            >{t("dock.goal", { goal: settings.volumeGoal })}</span
          >
          <span class="shrink-0 tabular-nums">
            {#if app.paused}
              {t("paused.status")}
            {:else if app.session.running}
              {t("dock.nextIn", { time: remaining })}
            {/if}
          </span>
        </div>
      </div>

      <div
        class="order-3 flex shrink-0 items-center gap-1 sm:order-none sm:gap-1.5"
      >
        {#if settings.showCounter}
          <div
            class="order-last ml-1 flex flex-col items-end sm:order-none sm:mr-2 sm:ml-0"
            role="status"
            aria-label={tIn(app.scene.id, "counter.label", { count })}
          >
            <span
              class="font-mono text-base leading-none font-medium text-ink tabular-nums"
              >{count}</span
            >
            <span
              class="mt-1 text-[0.58rem] font-semibold tracking-[0.14em] text-ink-soft uppercase"
              >{tIn(app.scene.id, "controls.animals")}</span
            >
          </div>
        {/if}

        {#if !app.session.running}
          <button
            class="dock-action rounded-full px-6 py-2.5 text-sm font-semibold text-ink"
            onclick={() => app.startSession()}
          >
            {t("start.button")}
          </button>
        {:else}
          <button
            class="dock-action flex h-11 items-center gap-2 rounded-full pr-4 pl-3.5 text-sm font-semibold text-ink"
            aria-label={app.paused ? t("controls.resume") : t("controls.pause")}
            title={app.paused ? t("controls.resume") : t("controls.pauseHint")}
            onclick={() => app.setPaused(!app.paused)}
          >
            <svg
              viewBox="0 0 24 24"
              class="size-4 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              {#if app.paused}
                <path
                  d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"
                />
              {:else}
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              {/if}
            </svg>
            <span
              >{app.paused ? t("controls.resume") : t("controls.pause")}</span
            >
          </button>
          <button
            class={[
              "rounded-full px-3 py-2.5 text-sm font-medium transition",
              confirmingReset
                ? "bg-ink/10 text-ink"
                : "text-ink-soft hover:bg-ink/[0.06] hover:text-ink",
            ]}
            aria-expanded={confirmingReset}
            onclick={() => (confirmingReset = !confirmingReset)}
          >
            {t("controls.reset")}
          </button>
        {/if}

        <button
          class="grid size-10 place-items-center rounded-full text-ink-soft transition hover:bg-ink/[0.06] hover:text-ink"
          aria-label={t("controls.settings")}
          title={t("controls.settings")}
          onclick={onopensettings}
        >
          <svg
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
            <circle cx="15" cy="7" r="2" />
            <circle cx="9" cy="17" r="2" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
