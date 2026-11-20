<script lang="ts">
  /**
   * Which Class the Session is for, on the start card, beside the Scene.
   *
   * A plain list rather than stamps: a teacher may have any number of
   * classes, and the names are the useful part. Choosing one brings back what
   * that Class has earned and leaves the Session waiting for Start, exactly as
   * switching from the bar does. Editing lives in the classes panel, behind
   * the pencil, so it cannot be done by accident on the way to Start.
   */

  import type { App } from "$lib/app.svelte";
  import { classes } from "$lib/classes/classes.svelte";
  import { className, t } from "$lib/i18n/index.svelte";

  let { app, onedit }: { app: App; onedit: () => void } = $props();
</script>

<!-- Hidden until the saved Class is known: the page is prerendered with a
     throwaway one, and a reload should not flash its name first. -->
{#if app.restored}
  <div class="flex items-center gap-1.5">
    <select
      class="min-w-0 flex-1 truncate rounded-xl bg-paper-deep px-3 py-2 text-sm font-semibold text-ink"
      value={classes.currentId}
      aria-label={t("classes.change")}
      title={t("classes.change")}
      onchange={(event) => app.useClass(event.currentTarget.value)}
    >
      {#each classes.all as info (info.id)}
        <option value={info.id}>{className(info.name)}</option>
      {/each}
    </select>
    <button
      type="button"
      class="grid size-9 shrink-0 place-items-center rounded-xl text-ink-soft transition hover:bg-paper-deep hover:text-ink"
      aria-label={t("classes.edit")}
      title={t("classes.edit")}
      onclick={onedit}
    >
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
        <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" />
      </svg>
    </button>
  </div>
{:else}
  <div class="h-10 rounded-xl bg-paper-deep/60" aria-hidden="true"></div>
{/if}
