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
   *
   * A sheet, not a stack of cards: one hairline between places, sub-two-pixel
   * rules, and figures in the mono face so a score never shifts as it counts.
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
  class="safe-edges absolute inset-0 z-50 flex justify-center overflow-y-auto bg-ink/40 sm:items-start sm:p-6"
  role="presentation"
  onclick={(event) => event.target === event.currentTarget && onclose()}
>
  <div
    class="rise flex min-h-full w-full max-w-3xl flex-col bg-paper shadow-panel sm:min-h-0 sm:rounded-panel"
    role="dialog"
    aria-modal="true"
    aria-label={t("cup.title")}
  >
    <header class="px-5 pt-6 sm:px-9 sm:pt-8">
      <div class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <h1
            class="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl"
          >
            {t("cup.title")}
          </h1>
          <p class="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            {t("cup.hint")}
          </p>
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
    </header>

    <div class="min-h-0 flex-1 px-5 pt-6 sm:px-9">
      <!-- Column labels, on a wide screen only: on a phone the row reads as a
           sentence, place then class then score. Nothing to label until a
           class has been monitored. -->
      {#if board.ranked.length > 0}
        <div
          class="hidden grid-cols-[2.75rem_minmax(0,1fr)_8rem_4.5rem_11rem] gap-x-4 border-b border-line pb-2 text-[0.65rem] font-bold tracking-[0.16em] text-ink-soft uppercase sm:grid"
        >
          <span>{t("cup.columnPlace")}</span>
          <span>{t("class.label")}</span>
          <span></span>
          <span class="text-right">{t("cup.columnScore")}</span>
          <span class="text-right">{t("cup.columnTake")}</span>
        </div>
      {/if}

      <ol>
        {#each board.ranked as row, index (row.info.id)}
          {@const leading = index === 0}
          {@const current = row.info.id === classes.currentId}
          <li
            class="relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-line py-4 sm:grid-cols-[2.75rem_minmax(0,1fr)_8rem_4.5rem_11rem] sm:items-center sm:gap-x-4"
          >
            {#if leading}
              <span
                class="absolute inset-y-3 left-0 w-0.5 rounded-full bg-ochre"
                aria-hidden="true"
              ></span>
            {/if}
            <span class="font-mono text-sm font-medium text-ink-soft"
              >{placeLabel(row.place)}</span
            >
            <span class="min-w-0">
              <span class="flex items-center gap-2">
                <span class="truncate font-semibold text-ink"
                  >{className(row.info.name)}</span
                >
                {#if current}
                  <span
                    class="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[0.65rem] font-semibold text-paper"
                    >{t("classes.current")}</span
                  >
                {/if}
              </span>
              <span class="mt-1 block text-xs text-ink-soft sm:hidden"
                >{leading ? t("cup.leader") : catchUpText(row)}</span
              >
            </span>
            <span class="hidden sm:block">
              <span class="block h-0.5 overflow-hidden rounded-full bg-ink/10">
                <span
                  class="block h-full rounded-full {leading
                    ? 'bg-ochre'
                    : 'bg-ink/35'}"
                  style="width:{row.percent}%"
                ></span>
              </span>
            </span>
            <span
              class="text-right font-mono text-lg font-medium text-ink tabular-nums"
              >{row.percent}%</span
            >
            <span
              class="hidden text-right text-xs leading-snug {leading
                ? 'font-semibold text-ink'
                : 'text-ink-soft'} sm:block"
            >
              {leading ? t("cup.leader") : catchUpText(row)}
            </span>
          </li>
        {/each}
      </ol>

      {#if board.waiting.length > 0}
        <div class="border-b border-line py-4">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2
              class="text-[0.65rem] font-bold tracking-[0.16em] text-ink-soft uppercase"
            >
              {t("cup.waiting")}
            </h2>
            {#each board.waiting as row (row.info.id)}
              <span class="text-sm text-ink">{className(row.info.name)}</span>
            {/each}
            <span class="ml-auto text-xs text-ink-soft">{t("cup.noTime")}</span>
          </div>
        </div>
      {/if}
    </div>

    <footer
      class="mt-6 flex items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-9"
    >
      <p class="text-xs text-ink-soft">{t("cup.local")}</p>
      <button
        class="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-paper-deep hover:text-ink"
        onclick={onclose}
      >
        {t("common.close")}
      </button>
    </footer>
  </div>
</div>
