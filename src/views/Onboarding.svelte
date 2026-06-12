<script lang="ts">
  import { onMount } from 'svelte';
  import { jobPresets, completeOnboarding } from '../lib/store.svelte';
  import { navigateTo } from '../lib/router.svelte';
  import { t } from '../lib/i18n.svelte';
  import CoinIcon from '../components/CoinIcon.svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  let name = $state('');
  let selectedJobId = $state(jobPresets[0].id);
  let mapContainer: HTMLElement | undefined = $state();
  let map: L.Map | undefined;
  let marker: L.Marker | null = null;
  let homeLat = $state<number | null>(null);
  let homeLng = $state<number | null>(null);

  onMount(() => {
    // Fix default marker icon issues in Leaflet with Vite
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    map = L.map(mapContainer as HTMLElement).setView([51.165691, 10.451526], 6); // default germany

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (marker) {
        marker.setLatLng(e.latlng);
      } else if (map) {
        marker = L.marker(e.latlng).addTo(map);
      }
      homeLat = e.latlng.lat;
      homeLng = e.latlng.lng;
    });
  });

  function handleComplete() {
    if (!name || !homeLat || !homeLng) return;
    const job = jobPresets.find(j => j.id === selectedJobId);
    if (!job) return;

    completeOnboarding(name, job, homeLat, homeLng);
    navigateTo('DASHBOARD');
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-6 relative">
  <div class="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-2xl flex flex-col gap-8">
    
    <div class="text-center space-y-2">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        {t('onboarding.title')}
        </h2>
        <p class="text-slate-500 dark:text-slate-400">Erstelle deinen Account und erhalte 5.000 <CoinIcon class="w-4 h-4 inline" /> Startbonus.</p>
    </div>

    <div class="space-y-3">
      <label for="profile-name" class="text-slate-700 dark:text-slate-300 font-bold text-sm">Vorname / Alias</label>
      <input 
        id="profile-name"
        type="text" 
        bind:value={name} 
        placeholder="z.B. Max Mustermann"
        class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
      />
    </div>

    <div class="space-y-3">
      <div class="text-slate-700 dark:text-slate-300 font-bold text-sm" id="job-label">Berufs-Profil (Einkommen)</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-labelledby="job-label">
        {#each jobPresets as preset}
          <label class="cursor-pointer group">
            <input type="radio" name="job" value={preset.id} bind:group={selectedJobId} class="hidden peer" />
            <div class="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 transition-all">
              <h3 class="font-bold text-slate-900 dark:text-white">{preset.title}</h3>
              <div class="flex items-center gap-1 mt-1">
                  <CoinIcon class="w-4 h-4" />
                  <p class="text-indigo-600 dark:text-indigo-400 font-medium text-sm">{preset.salary.toLocaleString('de-DE')} / {preset.interval === 'WEEKLY' ? 'Woche' : 'Monat'}</p>
              </div>
            </div>
          </label>
        {/each}
      </div>
    </div>

    <div class="space-y-3">
      <div class="text-slate-700 dark:text-slate-300 font-bold text-sm" id="map-label">Lieferadresse markieren (Klick auf Karte)</div>
      <div bind:this={mapContainer} role="application" aria-labelledby="map-label" class="w-full h-64 rounded-xl border-2 border-slate-200 dark:border-slate-700 z-0 overflow-hidden shadow-inner"></div>
      {#if !homeLat}
        <p class="text-red-500 text-xs font-medium">Bitte eine Lieferadresse auf der Karte markieren.</p>
      {/if}
    </div>

    <button 
      onclick={handleComplete}
      disabled={!name || !homeLat}
      class="mt-4 w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl cursor-pointer"
    >
      {t('onboarding.start')}
    </button>
  </div>
</div>
