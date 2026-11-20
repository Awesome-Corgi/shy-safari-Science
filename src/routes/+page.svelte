<script lang="ts">
  import { App } from "$lib/app.svelte";
  import { classes } from "$lib/classes/classes.svelte";
  import ClassesPanel from "$lib/components/ClassesPanel.svelte";
  import ClassPicker from "$lib/components/ClassPicker.svelte";
  import ClassSelect from "$lib/components/ClassSelect.svelte";
  import CupCounter from "$lib/components/CupCounter.svelte";
  import CupPanel from "$lib/components/CupPanel.svelte";
  import ScenePicker from "$lib/components/ScenePicker.svelte";
  import SceneSelect from "$lib/components/SceneSelect.svelte";
  import Collection from "$lib/components/Collection.svelte";
  import Dock from "$lib/components/Dock.svelte";
  import MicBlocked from "$lib/components/MicBlocked.svelte";
  import NotesLayer from "$lib/components/notes/NotesLayer.svelte";
  import Scene from "$lib/components/Scene.svelte";
  import ScreenMeter from "$lib/components/ScreenMeter.svelte";
  import SettingsPanel from "$lib/components/SettingsPanel.svelte";
  import Timer from "$lib/components/Timer.svelte";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";
  import PageMeta from "$lib/components/PageMeta.svelte";
  import InfoDrawer, { FAQ_IDS } from "$lib/components/InfoDrawer.svelte";
  import FloatingScene from "$lib/components/FloatingScene.svelte";
  import PausedPill from "$lib/components/PausedPill.svelte";
  import ThemeSwitch from "$lib/components/ThemeSwitch.svelte";
  import { drawFramesFrom } from "$lib/frames";
  import type { SceneDef } from "$lib/scenes";
  import type { CreatureInstance } from "$lib/session/session.svelte";
  import { current, t, tIn, type UiKey } from "$lib/i18n/index.svelte";
  import {
    copyStyles,
    documentPictureInPicture,
  } from "$lib/ui/documentPictureInPicture";
  import { mount, onMount, tick, unmount } from "svelte";
  import { settings } from "$lib/settings/settings.svelte";
  import logoUrl from "$lib/brand/logo.svg";
  import { PREVIEW_IMAGE, absoluteUrl } from "$lib/site";

  const app = new App();

  /**
   * The start card's backdrop: one of every animal the Scene has, scattered
   * through it, so a teacher choosing a place sees what lives there. It is a
   * picture only — nothing here is counted, sighted or saved — and the
   * Session behind the card begins empty and fills as the class earns animals.
   *
   * Built without a random number, because the page is prerendered with this
   * cast and the live one must match what was rendered. Ids are negative so no
   * member of it can share a key with an animal that really arrives, whose
   * component would then carry the cast's motion instead.
   */
  function startCast(scene: SceneDef): CreatureInstance[] {
    return scene.roster.map((def, i) => ({
      id: -(i + 1),
      def,
      // Two incommensurate strides across the Scene, so neighbours in the
      // Roster never land on top of one another.
      depth: 0.15 + ((i * 0.3819660113 + 0.11) % 1) * 0.8,
      spawnX: (i * 0.6180339887 + 0.31) % 1,
      spawnY: (i * 0.7548776662 + 0.19) % 1,
      // Everyone is already at home: no entrance flourish, no glistening.
      restored: true,
    }));
  }

  /**
   * What the Scene draws before the microphone is on: the whole cast, behind
   * the start card. A class coming back to animals it earned sees those
   * instead, so Start never takes one away.
   */
  const onStage = $derived(
    !app.listening && app.session.creatures.length === 0
      ? startCast(app.scene)
      : app.session.creatures,
  );

  /**
   * Tells search engines and AI assistants what kind of thing this page is,
   * and gives them the questions the info drawer answers.
   */
  /** The Scene's own name, in the language the app is speaking. */
  const sceneName = $derived(t(`scene.${app.scene.id}.name` as UiKey));

  const webApplication = $derived({
    "@type": "WebApplication",
    name: "Quiet",
    url: absoluteUrl("/"),
    description: t("app.description"),
    image: PREVIEW_IMAGE,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires a microphone and a modern web browser",
    inLanguage: ["en", "es", "fr"],
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
    publisher: {
      "@type": "Organization",
      name: "teacher.dev",
      url: "https://teacher.dev",
    },
  });

  const faqPage = $derived({
    "@type": "FAQPage",
    url: absoluteUrl("/"),
    mainEntity: FAQ_IDS.map((id) => ({
      "@type": "Question",
      name: t(`guide.faq.${id}.q`),
      acceptedAnswer: { "@type": "Answer", text: t(`guide.faq.${id}.a`) },
    })),
  });

  const jsonLd = $derived({
    "@context": "https://schema.org",
    "@graph": [webApplication, faqPage],
  });

  let settingsOpen = $state(false);
  let collectionOpen = $state(false);
  let infoOpen = $state(false);
  let classesOpen = $state(false);
  let cupOpen = $state(false);
  let classMenuOpen = $state(false);
  let sceneMenuOpen = $state(false);
  let fullScreen = $state(false);
  let controlsVisible = $state(true);
  let idleTimer: ReturnType<typeof setTimeout>;
  let notesLayer = $state<NotesLayer>();

  /** How long the controls linger after the last movement. */
  const IDLE_MS = 3500;

  $effect(() => app.run());

  $effect(() => {
    void app.microphone.refreshDevices();
    // Devices come and go — a headset plugged in, or permission just granted,
    // which is when their names first become readable — and the browser says
    // so here. Without this the list stays empty until the page is reloaded.
    const media = navigator.mediaDevices;
    if (typeof media?.addEventListener !== "function") return;
    const refresh = () => void app.microphone.refreshDevices();
    media.addEventListener("devicechange", refresh);
    return () => media.removeEventListener("devicechange", refresh);
  });

  function wake() {
    controlsVisible = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => (controlsVisible = false), IDLE_MS);
  }

  $effect(() => {
    wake();
    return () => clearTimeout(idleTimer);
  });

  /**
   * Absent on iOS Safari, and it rejects inside a restricted frame. Checked
   * once running, so the prerendered page and the live one agree.
   */
  let canFullScreen = $state(false);
  onMount(() => {
    canFullScreen =
      typeof document.documentElement.requestFullscreen === "function";
  });

  /**
   * The corner buttons fade with the control bar, so the class sees only the
   * Scene; before the Session starts there is nothing to hide them for.
   */
  const topBarVisible = $derived(
    app.listening && (controlsVisible || classMenuOpen || sceneMenuOpen),
  );

  /**
   * Floating the Scene over the teacher's other tabs, in a Document
   * Picture-in-Picture window. Only Chrome and Edge on a computer offer one,
   * so elsewhere the button is left out. See
   * docs/adr/0008-float-over-other-tabs.md.
   */
  let canFloat = $state(false);
  let floatingWindow = $state<Window | null>(null);
  let floatingApp: ReturnType<typeof mount> | null = null;
  let floatError = $state(false);

  onMount(() => {
    canFloat = documentPictureInPicture(window) !== null;
    return () => void closeFloatingWindow();
  });

  /** Put everything back in the tab, however the window came to close. */
  async function restoreToTab() {
    drawFramesFrom(null);
    app.floating = false;
    floatingWindow = null;
    const floated = floatingApp;
    floatingApp = null;
    if (floated) await unmount(floated);
  }

  async function closeFloatingWindow() {
    const floated = floatingWindow;
    await restoreToTab();
    floated?.close();
  }

  async function openFloatingWindow() {
    const controller = documentPictureInPicture(window);
    if (!controller || floatingWindow) return;

    let pip: Window | null = null;
    floatError = false;
    try {
      // 4:3, the Scene's own shape, and small enough to sit beside a slide.
      pip = await controller.requestWindow({ width: 480, height: 360 });
      const page = pip.document;
      page.title = "Quiet";
      page.documentElement.lang = current().locale;
      // Scales the corner controls with the window: see layout.css.
      page.documentElement.classList.add("floating");
      copyStyles(document, page);
      pip.addEventListener("pagehide", () => void restoreToTab(), {
        once: true,
      });

      // Take the Scene out of the tab before drawing it in the window. It
      // is mounted afresh there rather than moved, because a component's
      // events belong to the document it was mounted in.
      floatingWindow = pip;
      app.floating = true;
      drawFramesFrom(pip);
      await tick();
      floatingApp = mount(FloatingScene, {
        target: page.body,
        props: { app },
        intro: false,
      });
    } catch {
      await restoreToTab();
      pip?.close();
      floatError = true;
      setTimeout(() => (floatError = false), 6000);
    }
  }

  // Should the microphone drop out while floating, bring the Scene home: the
  // tab is where the teacher can put it right.
  $effect(() => {
    if (floatingWindow && !app.listening) void closeFloatingWindow();
  });

  async function toggleFullScreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Nothing useful to tell the teacher: the app is perfectly usable in a
      // normal window, and browser chrome is the only thing they lose.
    }
  }
</script>

<!-- Pointer events too: a Smartboard pen drawing on a Note sends no mouse
     or touch events of its own, and must not let the controls fade. -->
<svelte:window
  onmousemove={wake}
  onkeydown={wake}
  ontouchstart={wake}
  onpointerdown={wake}
  onpointermove={wake}
  onfullscreenchange={() => (fullScreen = Boolean(document.fullscreenElement))}
/>

<PageMeta
  path="/"
  title={t("app.pageTitle")}
  description={t("app.description")}
  {jsonLd}
/>

{#if floatingWindow}
  <!-- The Scene is in the floating window, so nothing is drawn here twice.
       The page behind still listens to the room and keeps every animal. -->
  <main class="grid h-dvh place-items-center overflow-y-auto bg-ink/55 p-4">
    <div
      class="rise max-w-md rounded-panel bg-paper p-6 text-center shadow-panel"
    >
      <img src={logoUrl} alt="" class="mx-auto mb-3 size-20" />
      <h1 class="font-display text-2xl font-semibold tracking-tight text-ink">
        {t("floating.title")}
      </h1>
      <p class="mt-3 text-balance text-ink-soft">
        {t("floating.instructions")}
      </p>
      <button
        class="mt-5 rounded-full bg-ink px-6 py-2.5 font-semibold text-paper shadow-lift transition hover:bg-ink/90"
        onclick={closeFloatingWindow}
      >
        {t("floating.return")}
      </button>
    </div>
  </main>
{:else}
  <!-- dvh, not vh: on a phone, vh is the height with the browser toolbars
     hidden, which would tuck the control bar underneath them. -->
  <main class="relative h-dvh w-full overflow-hidden">
    {#if app.restored}
      <Scene
        scene={app.scene}
        creatures={onStage}
        newestId={app.session.newestId}
        murky={app.monitor.state === "too-loud"}
        frozen={app.monitor.state === "too-loud"}
        listening={app.paused}
        scares={settings.loudResponse === "flee"}
        fleeing={app.session.fleeing}
        ondepart={(id) => app.session.depart(id)}
        canRetry={app.listening}
      />
      <!-- Over the Scene, so the animals pass behind the words. Keyed by
         Class, so nothing stays chosen from the last class's Notes. -->
      {#key classes.currentId}
        <NotesLayer
          bind:this={notesLayer}
          scene={app.scene}
          chrome={controlsVisible && app.listening}
        />
      {/key}
    {/if}

    {#if !app.listening && !app.blocked}
      <!-- The start screen is a panel, not a card: the plan for the lesson on
           the left, the place it will happen on the right. Browsers only hand
           over a microphone after a real gesture, so the Session begins with
           the one button either way. -->
      <div class="absolute inset-0 z-40 overflow-y-auto">
        <div class="flex min-h-full flex-col md:flex-row">
          <section
            class="relative flex min-h-dvh w-full flex-col bg-canvas px-6 pt-6 pb-8 text-left md:w-[46%] md:max-w-[640px] md:shrink-0 md:px-11 md:pt-8 md:pb-9 md:shadow-panel short:px-8 short:py-3"
          >
            <header class="flex items-center gap-3">
              <img src={logoUrl} alt="" class="size-8 short:size-6" />
              <span class="font-display text-xl font-semibold tracking-tight"
                >Quiet</span
              >
              <div class="ml-auto flex items-center gap-2">
                <!-- Always available, session or not: the whole point of the
                     Cup is to see where the classes stand before the lesson. -->
                <button
                  class="grid size-9 place-items-center rounded-full text-ink-soft transition hover:bg-paper-deep hover:text-ink"
                  aria-label={t("cup.title")}
                  title={t("cup.title")}
                  onclick={() => (cupOpen = true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="size-[1.15rem]"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z" />
                    <path
                      d="M8 5.5H5V7a3 3 0 0 0 3 3M16 5.5h3V7a3 3 0 0 1-3 3"
                    />
                    <path d="M12 12.5V16M8.5 20h7M10 16h4l.5 4h-5Z" />
                  </svg>
                </button>
                <ThemeSwitch compact />
                <LanguagePicker />
              </div>
            </header>

            <div class="mt-12 md:mt-20 short:mt-4">
              <p
                class="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] text-ink-soft uppercase"
              >
                <span class="size-1.5 rounded-full bg-ochre" aria-hidden="true"
                ></span>
                {sceneName}
              </p>
              <h1
                class="mt-4 max-w-[34rem] font-display text-[2.4rem] leading-[1.02] font-semibold tracking-[-0.025em] text-balance text-ink sm:text-[3rem] short:mt-2 short:text-[1.6rem]"
              >
                {tIn(app.scene.id, "start.shy")}
              </h1>
              <p
                class="mt-5 max-w-[30rem] text-lg leading-relaxed text-ink-soft short:mt-2 short:text-sm"
              >
                <!-- Checked after mount: the page is prerendered with the default. -->
                {#if app.restored && settings.loudResponse === "pause"}
                  {tIn(app.scene.id, "start.explain")}
                {:else}
                  {tIn(app.scene.id, "start.explainFlee")}
                {/if}
              </p>
              <div class="mt-8 flex flex-wrap items-center gap-2 short:mt-4">
                <button
                  class="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-base font-semibold text-paper shadow-lift transition hover:bg-ink/90 active:translate-y-px short:py-2.5"
                  onclick={async () => {
                    if (await app.connect()) app.startSession();
                  }}
                >
                  {t("start.button")}
                  <svg
                    viewBox="0 0 24 24"
                    class="size-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h13M12.5 6l6 6-6 6" />
                  </svg>
                </button>
                <button
                  class="rounded-full px-4 py-3 text-sm font-medium text-ink-soft transition hover:bg-paper-deep hover:text-ink"
                  onclick={() => (infoOpen = true)}
                >
                  {t("guide.title")}
                </button>
              </div>
              <p
                class="mt-4 max-w-[26rem] text-xs leading-relaxed text-ink-soft"
              >
                {t("start.micNote")}
              </p>
            </div>

            <div class="mt-auto pt-10 short:pt-4">
              <div class="border-t border-line pt-5">
                <p
                  class="mb-2 text-[0.7rem] font-bold tracking-[0.16em] text-ink-soft uppercase"
                >
                  {t("scene.label")}
                </p>
                <SceneSelect {app} />
                <!-- Which Class the Session is for, chosen before Start so the
                     Cup knows whose quiet time it is counting. -->
                <div class="mt-5 max-w-sm">
                  <p
                    class="mb-2 text-[0.7rem] font-bold tracking-[0.16em] text-ink-soft uppercase"
                  >
                    {t("class.label")}
                  </p>
                  <ClassSelect {app} onedit={() => (classesOpen = true)} />
                </div>
              </div>
            </div>
          </section>

          <!-- What lives here, framed by the panel rather than covered by it. -->
          <aside class="relative hidden flex-1 md:block">
            <div
              class="chrome absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 rounded-panel px-4 py-3 lg:inset-x-7 lg:bottom-7"
            >
              <div class="min-w-0">
                <p class="truncate font-display text-lg font-semibold text-ink">
                  {sceneName}
                </p>
                <p class="text-xs text-ink-soft">
                  {app.scene.roster.length} · {tIn(
                    app.scene.id,
                    "controls.animals",
                  )}
                </p>
              </div>
              <CupCounter />
            </div>
          </aside>
        </div>
      </div>
    {/if}

    <!-- Top left: who made this, and which Class is on screen. Top right: the
       tools that change how the page looks — the Timer and Notes over the
       Scene, floating it, and whether it fills the screen. Later than the
       start card so it sits above it; Settings, Animals and the blocked-
       microphone screen cover it. -->
    <div
      class="safe-edges pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-2 p-4 transition-opacity duration-300"
      class:opacity-0={!topBarVisible}
      aria-hidden={!topBarVisible}
      inert={!topBarVisible}
    >
      <div class="pointer-events-auto flex min-w-0 gap-2">
        <ClassPicker
          {app}
          bind:open={classMenuOpen}
          onedit={() => (classesOpen = true)}
        />
      </div>
      <div class="pointer-events-auto flex shrink-0 gap-2">
        <!-- Always available, session or not: the whole point of the Cup is
           to see where the classes stand before the lesson starts. -->
        <button
          class="chrome grid size-11 place-items-center rounded-full text-ink-soft transition hover:text-ink"
          aria-label={t("cup.title")}
          title={t("cup.title")}
          onclick={() => (cupOpen = true)}
        >
          <svg
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z" />
            <path d="M8 5.5H5V7a3 3 0 0 0 3 3M16 5.5h3V7a3 3 0 0 1-3 3" />
            <path d="M12 12.5V16M8.5 20h7M10 16h4l.5 4h-5Z" />
          </svg>
        </button>
        <!-- Only once listening: neither the Timer nor a Note is shown over
           the start card. -->
        {#if app.listening}
          <button
            class={[
              "grid size-11 place-items-center rounded-full transition",
              app.timer.open
                ? "bg-ink text-paper shadow-lift"
                : "chrome text-ink-soft hover:text-ink",
            ]}
            aria-pressed={app.timer.open}
            aria-label={t("controls.timer")}
            title={t("controls.timer")}
            onclick={() =>
              app.timer.open ? app.timer.hide() : app.timer.show()}
          >
            <svg
              viewBox="0 0 24 24"
              class="size-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="13.5" r="7.5" />
              <path d="M12 13.5V9.5M10 2.5h4M18.5 6.5l1.5-1.5" />
            </svg>
          </button>
          <button
            class="chrome grid size-11 place-items-center rounded-full text-ink-soft transition hover:text-ink"
            aria-label={t("controls.addText")}
            title={t("controls.addTextHint")}
            onclick={() => notesLayer?.add()}
          >
            <svg
              viewBox="0 0 24 24"
              class="size-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 7V4h12v3M9 4v15M6.5 19h5M19 12v8M15 16h8" />
            </svg>
          </button>
          {#if canFloat}
            <button
              class="chrome grid size-11 place-items-center rounded-full text-ink-soft transition hover:text-ink"
              aria-label={t("float.open")}
              title={t("float.openHint")}
              onclick={openFloatingWindow}
            >
              <svg
                viewBox="0 0 24 24"
                class="size-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="2.5" y="4" width="19" height="15" rx="2.5" />
                <rect
                  x="12"
                  y="11"
                  width="6.5"
                  height="5"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
            </button>
          {/if}
        {/if}
        {#if canFullScreen}
          <button
            class="chrome grid size-11 place-items-center rounded-full text-ink-soft transition hover:text-ink"
            aria-label={fullScreen
              ? t("fullScreen.exit")
              : t("fullScreen.enter")}
            title={fullScreen ? t("fullScreen.exit") : t("fullScreen.enter")}
            onclick={toggleFullScreen}
          >
            <svg
              viewBox="0 0 24 24"
              class="size-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              {#if fullScreen}
                <path
                  d="M9 4v3a2 2 0 0 1-2 2H4M15 4v3a2 2 0 0 0 2 2h3M9 20v-3a2 2 0 0 0-2-2H4M15 20v-3a2 2 0 0 1 2-2h3"
                />
              {:else}
                <path
                  d="M4 9V6a2 2 0 0 1 2-2h3M20 9V6a2 2 0 0 0-2-2h-3M4 15v3a2 2 0 0 0 2 2h3M20 15v3a2 2 0 0 1-2 2h-3"
                />
              {/if}
            </svg>
          </button>
        {/if}
      </div>
    </div>

    {#if app.listening && app.timer.open}
      <!-- Keyed by Class, so the length typed in is the new class's own. -->
      {#key classes.currentId}
        <Timer
          timer={app.timer}
          controlsVisible={controlsVisible || settingsOpen || collectionOpen}
        />
      {/key}
    {/if}

    {#if app.listening && !controlsVisible && (app.paused || settings.showMeter)}
      <!-- Top centre, only once the dock has faded: the Scene is for the class
         then, and this is for whoever is watching the room from the back. The
         Noise Meter, if the teacher turned it on in Settings; or, once Paused
         for an announcement, a reminder in its place that the room isn't being
         judged, to resume from right here. While the dock is up it carries the
         meter itself, so there is only ever one of them on screen. -->
      <div
        class="safe-edges pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center p-4 max-sm:top-12"
      >
        {#if !app.paused}
          <ScreenMeter
            sceneId={app.scene.id}
            level={app.monitor.level}
            goal={settings.volumeGoal}
            tooLoud={app.monitor.state === "too-loud"}
          />
        {:else}
          <PausedPill onresume={() => app.setPaused(false)} />
        {/if}
      </div>
    {/if}

    <!-- Bottom left: help for the teacher and the page's language, fading
       with the rest of the chrome. On a phone the dock floats above them. -->
    <div
      class="safe-edges pointer-events-none absolute bottom-0 left-0 z-40 flex gap-2 p-4"
      class:hidden={!app.listening}
    >
      <div
        class="pointer-events-auto flex gap-2 transition-opacity duration-300"
        class:opacity-0={!topBarVisible}
        aria-hidden={!topBarVisible}
        inert={!topBarVisible}
      >
        <button
          class="chrome grid size-11 place-items-center rounded-full text-ink-soft transition hover:text-ink"
          aria-label={t("guide.title")}
          title={t("guide.title")}
          aria-expanded={infoOpen}
          aria-controls="how-it-works-panel"
          onclick={() => (infoOpen = true)}
        >
          <svg
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
            <path d="M12 17.5h.01" />
          </svg>
        </button>
        <LanguagePicker />
      </div>
    </div>

    {#if app.blocked}
      <MicBlocked {app} />
    {/if}

    {#if app.listening}
      <Dock
        {app}
        visible={controlsVisible || settingsOpen || collectionOpen}
        onopensettings={() => (settingsOpen = true)}
      />

      <!-- Bottom right: which Scene is on screen and every animal the class
         has spotted. The Cup is in the dock, opposite them. -->
      <div
        class="safe-edges pointer-events-none absolute right-0 bottom-0 z-40 p-4"
      >
        <div class="flex items-center gap-2">
          <div
            class="pointer-events-auto flex gap-2 transition-opacity duration-300"
            class:opacity-0={!topBarVisible}
            aria-hidden={!topBarVisible}
            inert={!topBarVisible}
          >
            <ScenePicker {app} bind:open={sceneMenuOpen} />
            <button
              class="chrome grid size-11 place-items-center rounded-full text-ink-soft transition hover:text-ink"
              aria-label={tIn(app.scene.id, "controls.animals")}
              title={tIn(app.scene.id, "controls.animals")}
              onclick={() => (collectionOpen = true)}
            >
              <svg
                viewBox="0 0 24 24"
                class="size-5"
                fill="currentColor"
                aria-hidden="true"
              >
                <ellipse cx="5.4" cy="10.6" rx="1.9" ry="2.3" />
                <ellipse cx="9.4" cy="6.3" rx="2" ry="2.5" />
                <ellipse cx="14.6" cy="6.3" rx="2" ry="2.5" />
                <ellipse cx="18.6" cy="10.6" rx="1.9" ry="2.3" />
                <path
                  d="M12 11.2c-2.6 0-5.6 3.3-5.6 5.8 0 1.7 1.3 2.7 2.8 2.7 1.2 0 1.9-.6 2.8-.6s1.6.6 2.8.6c1.5 0 2.8-1 2.8-2.7 0-2.5-3-5.8-5.6-5.8Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    {/if}

    {#if floatError}
      <p
        class="absolute top-18 right-4 z-40 max-w-xs rounded-2xl bg-paper px-4 py-2 text-sm text-ink shadow-lift"
        role="alert"
      >
        {t("float.failed")}
      </p>
    {/if}

    {#if settingsOpen}
      <SettingsPanel {app} onclose={() => (settingsOpen = false)} />
    {/if}

    {#if collectionOpen}
      <Collection {app} onclose={() => (collectionOpen = false)} />
    {/if}

    <InfoDrawer bind:open={infoOpen} />
    {#if classesOpen}
      <ClassesPanel {app} onclose={() => (classesOpen = false)} />
    {/if}
    {#if cupOpen}
      <CupPanel onclose={() => (cupOpen = false)} />
    {/if}
  </main>
{/if}
