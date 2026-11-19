<script lang="ts">
  /**
   * The microphone is the tool. When it is unavailable the app says so and
   * stops — it never quietly runs on a timer instead, because a Scene filling
   * up beautifully while the room is in chaos would cost the teacher all
   * confidence in it.
   */

  import { t, tIn } from "$lib/i18n/index.svelte";
  import type { App } from "$lib/app.svelte";
  import { settings } from "$lib/settings/settings.svelte";

  let { app }: { app: App } = $props();

  const message = $derived(
    {
      denied: t("blocked.denied"),
      missing: t("blocked.missing"),
      unsupported: t("blocked.unsupported"),
    }[app.microphone.status as "denied" | "missing" | "unsupported"] ?? "",
  );
</script>

<div
  class="safe-edges absolute inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/70"
>
  <div class="rise w-full max-w-lg rounded-panel bg-paper p-6 shadow-panel">
    <h1 class="font-display text-3xl font-extrabold tracking-tight text-ink">
      {tIn(app.scene.id, "blocked.title")}
    </h1>
    <p class="mt-3 text-ink-soft">{message}</p>

    {#if app.microphone.status !== "unsupported"}
      <label class="mt-5 block text-sm font-semibold text-ink">
        {t("settings.microphone")}
        <select
          class="mt-1 w-full rounded-xl bg-paper-deep px-3 py-2 font-normal"
          value={settings.deviceId}
          onchange={(event) => app.selectDevice(event.currentTarget.value)}
        >
          <option value="">{t("mic.default")}</option>
          {#each app.microphone.devices.filter((device) => device.deviceId) as device, index (device.deviceId)}
            <option value={device.deviceId}>
              {device.label || t("mic.numbered", { number: index + 1 })}
            </option>
          {/each}
        </select>
      </label>

      <button
        class="mt-5 w-full rounded-full bg-ink px-6 py-3 font-semibold text-paper shadow-lift transition hover:bg-ink/90"
        onclick={() => app.connect()}
      >
        {t("blocked.tryAgain")}
      </button>
    {/if}
  </div>
</div>
