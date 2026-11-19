<script lang="ts">
  import { asset } from "$app/paths";
  import DocPage from "$lib/components/DocPage.svelte";
  import PageMeta from "$lib/components/PageMeta.svelte";
  import { t } from "$lib/i18n/index.svelte";

  const card = "mt-10 border-t border-ink/10 pt-8";
  const link =
    "font-semibold text-teal-deep underline-offset-4 hover:underline";
</script>

<PageMeta
  path="/about"
  title={t("about.pageTitle")}
  description={t("about.meta")}
/>

<DocPage title={t("about.title")} lede={t("about.lede")}>
  <section class={card}>
    <div class="mb-3 flex items-center gap-3">
      <img
        src={asset("/edtechathon-logo.svg")}
        alt=""
        class="size-10 shrink-0"
      />
      <h2 class="font-display text-2xl font-semibold">
        {t("about.originTitle")}
      </h2>
    </div>
    <p class="leading-relaxed text-ink-soft">
      {t("about.origin.beforeEvent")}<a
        href="https://edtechathon.com"
        target="_blank"
        rel="noopener noreferrer"
        class={link}>EdTech-a-thon</a
      >{t("about.origin.afterEvent")}<a
        href="https://teacher.dev"
        target="_blank"
        rel="noopener noreferrer"
        class={link}>teacher.dev</a
      >{t("about.origin.afterTeacher")}
    </p>

    <figure
      class="mx-auto mt-8 w-full max-w-lg -rotate-1 rounded-sm bg-paper p-3 pb-6 shadow-lift"
    >
      <img
        src={asset("/edtechathon-2026.jpg")}
        alt={t("about.photoAlt")}
        class="w-full bg-paper-deep"
      />
      <figcaption class="handwriting pt-5 text-center text-lg text-ink-soft">
        EdTech-a-thon 2026
      </figcaption>
    </figure>
  </section>

  <section class={card}>
    <h2 class="mb-3 font-display text-2xl font-semibold">
      {t("about.purposeTitle")}
    </h2>
    <p class="leading-relaxed text-ink-soft">{t("about.purpose")}</p>
  </section>

  <section class={card}>
    <h2 class="mb-3 font-display text-2xl font-semibold">
      {t("about.promiseTitle")}
    </h2>
    <p class="leading-relaxed text-ink-soft">{t("about.promise")}</p>
  </section>

  <section class={card}>
    <h2 class="mb-3 font-display text-2xl font-semibold">
      {t("about.feedbackTitle")}
    </h2>
    <p class="mb-4 leading-relaxed text-ink-soft">{t("about.feedback")}</p>
    <a
      href="mailto:support@teacher.dev?subject=Shy%20Safari%20feedback"
      class="inline-block rounded-full bg-ink px-5 py-2 font-semibold text-paper shadow-lift transition hover:bg-ink/90"
      >{t("about.email")}</a
    >
  </section>
</DocPage>
