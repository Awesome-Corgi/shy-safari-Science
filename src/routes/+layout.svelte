<script lang="ts">
  import "./layout.css";
  import { current, initializeLanguage } from "$lib/i18n/index.svelte";
  import { settings } from "$lib/settings/settings.svelte";
  import { applyTheme, watchSystemTheme } from "$lib/ui/theme.svelte";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(initializeLanguage);
  onMount(watchSystemTheme);

  $effect(() => {
    document.documentElement.lang = current().locale;
  });

  // app.html has already set the saved theme before the first paint; this
  // keeps the page in step when the teacher changes it, or the computer does.
  $effect(() => {
    if (settings.theme) applyTheme();
  });

  // Cloudflare Web Analytics beacon. The token is set only in Vercel's
  // production environment, so dev servers and local builds don't count visits.
  const beacon = import.meta.env.CF_BEACON_TOKEN;
</script>

<svelte:head>
  {#if beacon}
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: beacon })}
    ></script>
  {/if}
</svelte:head>

{@render children()}
