<script lang="ts">
  /**
   * The frame the about and privacy pages share. Unlike the Scene these are
   * ordinary scrolling pages, so here a footer really can sit at the bottom.
   * The page itself never scrolls (the Scene must not), so this frame does.
   */

  import { asset, resolve } from "$app/paths";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";
  import { t } from "$lib/i18n/index.svelte";
  import logoUrl from "$lib/brand/logo.svg";
  import type { Snippet } from "svelte";

  let {
    title,
    lede,
    children,
  }: { title: string; lede: string; children: Snippet } = $props();
</script>

<div
  class="fixed inset-0 flex flex-col overflow-y-auto bg-gradient-to-b from-paper to-paper-deep text-ink"
>
  <header class="border-b border-ink/10 bg-paper/85">
    <div
      class="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3"
    >
      <a
        href={resolve("/")}
        class="font-display flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink hover:text-ink-soft"
      >
        <img src={logoUrl} alt="" class="size-9" />
        Shy Safari
      </a>
      <div class="flex items-center gap-2">
        <a
          href={resolve("/")}
          class="rounded-lg px-2 py-1 text-sm font-medium text-ink-soft hover:text-ink"
          >{t("common.back")}</a
        >
        <LanguagePicker />
      </div>
    </div>
  </header>

  <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
    <h1
      class="font-display mb-2 text-3xl font-extrabold tracking-tight text-ink"
    >
      {title}
    </h1>
    <p class="mb-8 text-ink-soft">{lede}</p>
    {@render children()}
  </main>

  <footer
    class="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 pb-6 text-center text-sm text-ink-soft"
  >
    <a
      href="https://teacher.dev"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2 hover:text-ink"
    >
      <img src={asset("/edtechathon-logo.svg")} alt="" class="size-6" />
      {t("common.builtBy")}
    </a>
    <a href={resolve("/#how-it-works")} class="hover:text-ink"
      >{t("common.howItWorks")}</a
    >
    <a href={resolve("/about")} class="hover:text-ink">{t("common.about")}</a>
    <a href={resolve("/privacy")} class="hover:text-ink"
      >{t("common.privacy")}</a
    >
  </footer>
</div>
