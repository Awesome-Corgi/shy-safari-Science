<script lang="ts">
  /**
   * The Class Cup: every Class ranked by the share of its monitored time the
   * room spent under the line.
   *
   * A leader is a class, not a moment, so the board is open to the whole room
   * and tells everyone else how far behind they are in the only currency that
   * matters here: time under the line. The figures are read from each Class's
   * own record as the board moves, so a class watching its own score climb
   * sees what it still needs shrink with it.
   */

  import { classes } from "$lib/classes/classes.svelte";
  import { cup } from "$lib/classes/cup.svelte";
  import { catchUpMs, formatQuiet, percent, placeOf } from "$lib/classes/cup";
  import type { ClassInfo } from "$lib/classes/classList";
  import { className, placeLabel, t } from "$lib/i18n/index.svelte";

  let { onclose }: { onclose: () => void } = $props();

  interface Row {
    info: ClassInfo;
    percent: number | null;
  }

  /** A Class that has been monitored, so it has a share to rank. */
  type RankedRow = Row & { percent: number };

  function hasScore(row: Row): row is RankedRow {
    return row.percent !== null;
  }

  const rows = $derived(
    classes.all.map((info) => ({ info, percent: cup.percent(info.id) })),
  );
  const board = $derived.by(() => {
    const ranked = rows.filter(hasScore).sort((a, b) => b.percent - a.percent);
    const shares = ranked.map((row) => row.percent);
    return {
      ranked: ranked.map((row) => ({
        ...row,
        place: placeOf(row.percent, shares),
      })),
      waiting: rows.filter((row) => row.percent === null),
    };
  });
  const lead = $derived(board.ranked[0]?.percent ?? null);

  /**
   * The leader's unrounded share. The board's share is rounded, which is what
   * lets two equal numbers be a tie, but a lead that rounds up to 100% still
   * has a number behind it: only a Class that has never been over the line is
   * truly out of reach.
   */
  const leadShare = $derived.by(() => {
    const first = board.ranked[0];
    return first ? percent(cup.score(first.info.id)) : null;
  });

  /** The lead is the bar to clear, in a currency the class can still earn. */
  function catchUpText(row: RankedRow) {
    if (lead === null) return t("cup.waiting");
    if (row.percent === lead) return t("cup.level");
    const target = lead >= 100 ? (leadShare ?? lead) : lead;
    const needed = catchUpMs(cup.score(row.info.id), target);
    if (needed === null) return t("cup.needsPerfect");
    return t("cup.catchUp", { time: formatQuiet(needed) });
  }
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === "Escape") onclose();
  }}
/>

<div
  class="safe-edges absolute inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
  role="presentation"
  onclick={(event) => event.target === event.currentTarget && onclose()}
>
  <div
    class="rise flex max-h-full w-full max-w-lg flex-col rounded-panel bg-paper shadow-panel"
    role="dialog"
    aria-modal="true"
    aria-label={t("cup.title")}
  >
    <div class="flex items-start justify-between gap-4 p-4 pb-2 sm:p-6 sm:pb-3">
      <div class="min-w-0">
        <h1
          class="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-ink"
        >
          <svg
            viewBox="0 0 24 24"
            class="size-6 shrink-0 text-ochre-deep"
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
          {t("cup.title")}
        </h1>
        <p class="mt-1 text-sm text-ink-soft">{t("cup.hint")}</p>
      </div>
      <button
        class="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-paper-deep hover:text-ink"
        aria-label={t("common.close")}
        title={t("common.close")}
        onclick={onclose}
      >
        <svg
          viewBox="0 0 24 24"
          class="size-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
      <ol class="space-y-2">
        {#each board.ranked as row, index (row.info.id)}
          {@const leading = index === 0}
          {@const current = row.info.id === classes.currentId}
          <li
            class="rounded-2xl p-3 {leading
              ? 'bg-ochre/12 ring-1 ring-ochre/40'
              : 'bg-paper-deep/40'}"
          >
            <div class="flex items-baseline gap-2">
              <span
                class="w-6 shrink-0 text-sm font-semibold text-ink-soft tabular-nums"
                >{placeLabel(row.place)}</span
              >
              <span class="min-w-0 flex-1 truncate font-semibold text-ink"
                >{className(row.info.name)}</span
              >
              {#if current}
                <span
                  class="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[0.7rem] text-paper"
                  >{t("classes.current")}</span
                >
              {/if}
              <span class="shrink-0 text-lg font-semibold text-ink tabular-nums"
                >{row.percent}%</span
              >
            </div>
            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div
                class="h-full rounded-full {leading
                  ? 'bg-ochre-deep'
                  : 'bg-accent-teal'}"
                style="width:{row.percent}%"
              ></div>
            </div>
            <p
              class="mt-2 text-xs {leading
                ? 'font-semibold text-ochre-deep'
                : 'text-ink-soft'}"
            >
              {leading ? t("cup.leader") : catchUpText(row)}
            </p>
          </li>
        {/each}
      </ol>

      {#if board.waiting.length > 0}
        <h2
          class="mt-5 text-[0.7rem] font-bold tracking-[0.16em] text-ink-soft uppercase"
        >
          {t("cup.waiting")}
        </h2>
        <ul class="mt-2 space-y-1.5">
          {#each board.waiting as row (row.info.id)}
            <li
              class="flex items-center gap-2 rounded-xl bg-paper-deep/25 px-3 py-2 text-sm"
            >
              <span class="min-w-0 flex-1 truncate text-ink"
                >{className(row.info.name)}</span
              >
              <span class="shrink-0 text-ink-soft">{t("cup.noTime")}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>
