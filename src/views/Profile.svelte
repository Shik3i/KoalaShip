<script lang="ts">
  import { user, updateProfile, exportGameState, importGameState } from '../lib/store.svelte';

  let bio = $state(user.bio ?? '');
  let jobDescription = $state(user.jobDescription ?? '');
  let pronouns = $state(user.pronouns ?? '');
  let favoriteCategory = $state(user.favoriteCategory ?? 'EVERYDAY');
  let deliveryNote = $state(user.deliveryNote ?? '');
  let avatarColor = $state(user.avatarColor ?? '#4f46e5');

  function save() {
    updateProfile({ bio, jobDescription, pronouns, favoriteCategory, deliveryNote, avatarColor });
  }

  function downloadBackup() {
    const blob = new Blob([exportGameState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `koalaship-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      importGameState(await file.text());
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Import fehlgeschlagen.');
    } finally {
      input.value = '';
    }
  }
</script>

<div class="mx-auto max-w-4xl space-y-8">
  <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div class="h-32" style={`background:linear-gradient(135deg,${avatarColor},#a855f7)`}></div>
    <div class="px-8 pb-8">
      <div class="-mt-14 mb-4 flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white text-5xl font-black text-white shadow-xl dark:border-slate-800" style={`background:${avatarColor}`}>
        {user.name?.slice(0, 1).toUpperCase()}
      </div>
      <h2 class="text-3xl font-black">{user.name}</h2>
      <p class="text-slate-500">{pronouns || 'Keine Pronomen angegeben'} · {user.occupation?.title}</p>
      {#if jobDescription}<p class="mt-2 font-medium">{jobDescription}</p>{/if}
    </div>
  </section>

  <section class="grid gap-5 rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-2">
    <label class="sm:col-span-2 font-bold">Bio<textarea bind:value={bio} maxlength="180" rows="4" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"></textarea></label>
    <label class="font-bold">Pronomen<input bind:value={pronouns} maxlength="30" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900" /></label>
    <label class="font-bold">Avatarfarbe<input bind:value={avatarColor} type="color" class="mt-2 h-12 w-full rounded-xl border p-1" /></label>
    <label class="sm:col-span-2 font-bold">Jobbeschreibung<textarea bind:value={jobDescription} maxlength="160" rows="3" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"></textarea></label>
    <label class="font-bold">Lieblingskategorie<select bind:value={favoriteCategory} class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900"><option value="EVERYDAY">Alltag</option><option value="LUXURY">Luxus</option><option value="ABSURD">Absurd</option><option value="MYSTERY">Mystery</option></select></label>
    <label class="font-bold">Lieferhinweis<input bind:value={deliveryNote} maxlength="80" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900" /></label>
    <button onclick={save} class="sm:col-span-2 rounded-xl bg-indigo-600 py-4 font-black text-white">Profil speichern</button>
  </section>

  <section class="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
    <h3 class="text-xl font-black">Spielstand sichern</h3>
    <p class="mt-1 text-sm text-slate-500">Exportiere Profil, Bestellungen und Einstellungen als lokale JSON-Datei oder stelle sie auf einem anderen Gerät wieder her.</p>
    <div class="mt-5 flex flex-wrap gap-3">
      <button onclick={downloadBackup} class="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">Daten exportieren</button>
      <label class="cursor-pointer rounded-xl bg-slate-200 px-5 py-3 font-bold dark:bg-slate-700">
        Daten importieren
        <input type="file" accept="application/json,.json" onchange={importBackup} class="sr-only" />
      </label>
    </div>
  </section>
</div>
