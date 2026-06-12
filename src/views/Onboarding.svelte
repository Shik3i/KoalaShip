<script lang="ts">
  import { onMount } from 'svelte';
  import { jobPresets, completeOnboarding } from '../lib/store.svelte';
  import { navigateTo } from '../lib/router.svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  let name = $state('');
  let selectedJobId = $state(jobPresets[0].id);
  let mapContainer: HTMLElement;
  let map: L.Map;
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

    map = L.map(mapContainer).setView([51.165691, 10.451526], 6); // default germany

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
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

<div class="flex flex-col items-center justify-center min-h-screen p-6 bg-[#050510] relative">
  <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-indigo-900/20"></div>

  <div class="relative z-10 w-full max-w-2xl bg-[#0a0a1a] border border-indigo-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(79,70,229,0.15)] flex flex-col gap-6">
    <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 tracking-widest uppercase text-center mb-4">
      System-Initialisierung
    </h2>

    <div class="space-y-2">
      <label class="text-indigo-400 font-mono text-sm uppercase">Alias / Name</label>
      <input 
        type="text" 
        bind:value={name} 
        placeholder="z.B. CyberKoala99"
        class="w-full bg-[#101025] border border-slate-700 text-white p-4 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-mono"
      />
    </div>

    <div class="space-y-2">
      <label class="text-indigo-400 font-mono text-sm uppercase">Berufs-Profil (Einkommen)</label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each jobPresets as preset}
          <label class="cursor-pointer">
            <input type="radio" name="job" value={preset.id} bind:group={selectedJobId} class="hidden peer" />
            <div class="p-4 rounded-xl border border-slate-700 bg-[#101025] peer-checked:border-purple-500 peer-checked:bg-purple-900/20 peer-checked:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
              <h3 class="font-bold text-slate-200">{preset.title}</h3>
              <p class="text-emerald-400 font-mono mt-1">{preset.salary} DC / {preset.interval === 'WEEKLY' ? 'Woche' : 'Monat'}</p>
            </div>
          </label>
        {/each}
      </div>
    </div>

    <div class="space-y-2">
      <label class="text-indigo-400 font-mono text-sm uppercase">Wohnort markieren (Klick auf Karte)</label>
      <div bind:this={mapContainer} class="w-full h-64 rounded-xl border border-slate-700 z-0"></div>
      {#if !homeLat}
        <p class="text-red-400 font-mono text-xs mt-1 animate-pulse">Bitte einen Punkt auf der Karte markieren!</p>
      {/if}
    </div>

    <button 
      onclick={handleComplete}
      disabled={!name || !homeLat}
      class="mt-6 w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] cursor-pointer"
    >
      Simulation Starten 🚀
    </button>
  </div>
</div>
