<script lang="ts">
  /**
   * The Class on screen's Cup percentage, in the corner opposite the arrival
   * counter, and like it staying up when the controls fade.
   *
   * Read-only: it shows what the Session's own loop (`App.step`) has counted
   * and never writes a score itself.
   */

  import { classes } from "$lib/classes/classes.svelte";
  import { cup } from "$lib/classes/cup.svelte";
  import { placeOf } from "$lib/classes/cup";
  import { className, placeLabel, t } from "$lib/i18n/index.svelte";
  import { scale } from "svelte/transition";

  const percent = $derived(cup.percent(classes.currentId));
  const place = $derived.by(() => {
    if (percent === null) return null;
    return placeOf(
      percent,
      classes.all.map((info) => cup.percent(info.id)),
    );
  });
  const placeText = $derived(place === null ? null : placeLabel(place));
  const name = $derived(className(classes.current.name));
  const label = $derived(
    percent === null || placeText === null
      ? t("cup.chipNone", { name })
      : t("cup.sceneChip", { name, percent, place: placeText }),
  );
</script>

<div
  class="flex h-11 items-center gap-2 rounded-full bg-paper/95 pr-4 pl-3 text-ink shadow-lift"
  role="group"
  aria-label={label}
>
  <svg
    viewBox="0 0 24 24"
    class="size-5 shrink-0 text-ochre-deep"
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
  <!-- Keyed so each whole percent gives the number a small pop. -->
  {#key percent}
    <span
      class="text-xl font-semibold tabular-nums"
      in:scale={{ start: 0.75, duration: 220 }}
      >{percent === null ? "—" : `${percent}%`}</span
    >
  {/key}
  <!-- Where the Class stands, so the corner says more than one number. -->
  {#if placeText !== null}
    <span class="text-xs font-semibold text-ink-soft">· {placeText}</span>
  {/if}
</div>
