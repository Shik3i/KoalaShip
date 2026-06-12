<script lang="ts">
  import { navigateTo } from '../lib/router.svelte';
</script>

<div class="mx-auto max-w-3xl space-y-6">
  <button onclick={() => navigateTo('DASHBOARD')} class="rounded-xl bg-slate-200 px-4 py-2 font-bold dark:bg-slate-700">← Zurück</button>
  <article class="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
    <p class="font-black uppercase tracking-widest text-indigo-500">Version 0.2.0</p>
    <h1 class="mt-2 text-4xl font-black">Was ist neu?</h1>
    <p class="mt-2 text-slate-500">Release vom 12. Juni 2026</p>
    <ul class="mt-8 space-y-4">
      <li><strong>Profil:</strong> Sprachen, Bio, Jobbeschreibung, Pronomen und Lieferpräferenzen.</li>
      <li><strong>Mehr Spiel:</strong> Wunschlisten, Achievements, Level, Koala-Zimmer und Retouren.</li>
      <li><strong>Pakete:</strong> Mystery Box, Lieferereignisse, Toasts, Sound und Unboxing.</li>
      <li><strong>Privatsphäre:</strong> lokale Speicherung und Same-Origin-Proxies.</li>
      <li><strong>Release:</strong> PWA, Backup, SEO, Open Source und Rechtstexte.</li>
    </ul>
  </article>
</div>
