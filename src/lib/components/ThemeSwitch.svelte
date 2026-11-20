<script lang="ts">
  /**
   * System, Light or Dark, in one segmented control.
   *
   * The choice is a setting like any other, so it is remembered on this
   * computer and applied before the first paint by app.html. Icons carry it at
   * small sizes; the words appear where there is room for them.
   */

  import { t, type UiKey } from "$lib/i18n/index.svelte";
  import { settings, type ThemeChoice } from "$lib/settings/settings.svelte";
  import { applyTheme } from "$lib/ui/theme.svelte";

  let { compact = false }: { compact?: boolean } = $props();

  const options: { id: ThemeChoice; key: UiKey }[] = [
    { id: "system", key: "theme.system" },
    { id: "light", key: "theme.light" },
    { id: "dark", key: "theme.dark" },
  ];

  function choose(id: ThemeChoice) {
    settings.theme = id;
    applyTheme();
  }
</script>

<div
  class="inline-flex items-center gap-0.5 rounded-full bg-paper-deep p-0.5"
  role="group"
  aria-label={t("settings.theme")}
>
  {#each options as option (option.id)}
    {@const on = settings.theme === option.id}
    <button
      type="button"
      class="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors duration-200"
      class:bg-paper={on}
      class:text-ink={on}
      class:shadow-lift={on}
      class:text-ink-soft={!on}
      class:hover:text-ink={!on}
      aria-pressed={on}
      aria-label={t(option.key)}
      title={t(option.key)}
      onclick={() => choose(option.id)}
    >
      <svg
        viewBox="0 0 24 24"
        class="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        {#if option.id === "system"}
          <rect x="3" y="4.5" width="18" height="12.5" rx="2" />
          <path d="M8.5 20.5h7M12 17v3.5" />
        {:else if option.id === "light"}
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4"
          />
        {:else}
          <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />
        {/if}
      </svg>
      {#if !compact}
        <span class="hidden sm:inline">{t(option.key)}</span>
      {/if}
    </button>
  {/each}
</div>
