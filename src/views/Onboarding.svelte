<script lang="ts">
  import { onMount } from 'svelte';
  import { jobPresets, completeOnboarding } from '../lib/store.svelte';
  import { navigateTo } from '../lib/router.svelte';
  import { i18nState, setLocale, t, type Locale } from '../lib/i18n.svelte';
  import CoinIcon from '../components/CoinIcon.svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
  import markerIcon from 'leaflet/dist/images/marker-icon.png';
  import markerShadow from 'leaflet/dist/images/marker-shadow.png';

  let name = $state('');
  let selectedJobId = $state(jobPresets[0].id);
  let mapContainer: HTMLElement | undefined = $state();
  let map: L.Map | undefined;
  let marker: L.Marker | null = null;
  let homeLat = $state<number | null>(null);
  let homeLng = $state<number | null>(null);
  let bio = $state('');
  let jobDescription = $state('');
  let pronouns = $state('');
  let favoriteCategory = $state<'LUXURY' | 'EVERYDAY' | 'ABSURD' | 'MYSTERY'>('EVERYDAY');
  let deliveryNote = $state('');
  let avatarColor = $state('#4f46e5');
  const randomProfiles = [
    { name: 'Mika', pronouns: 'keine Angabe', bio: 'Mag Technik, gemütliche Räume und viel zu lange Produktvergleiche.', job: 'Übersetzt Anforderungen in Tabellen, Calls und gelegentlich funktionierenden Code.', note: 'Bitte am gewählten Ablageort abstellen.' },
    { name: 'Nova', pronouns: 'sie/ihr', bio: 'Baut sich hier das Traum-Setup zusammen, das draußen noch warten muss.', job: 'Plant digitale Kampagnen und nennt spontane Ideen strategische Initiativen.', note: 'Wenn niemand reagiert: bei der simulierten Packstation abgeben.' },
    { name: 'Robin', pronouns: 'they/them', bio: 'Sammelt schöne Dinge, absurde Technik und Möbel für virtuelle Wohnungen.', job: 'Hält Systeme am Laufen und erklärt nebenbei, warum ein Neustart geholfen hat.', note: 'Klingeln ist optional, Zustellen nicht.' }
  ];

  const languages: { locale: Locale; flag: string; label: string }[] = [
    { locale: 'DE', flag: '🇩🇪', label: 'Deutsch' },
    { locale: 'EN', flag: '🇬🇧', label: 'English' },
    { locale: 'ES', flag: '🇪🇸', label: 'Español' }
  ];

  onMount(() => {
    // Fix default marker icon issues in Leaflet with Vite
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });

    map = L.map(mapContainer as HTMLElement).setView([51.165691, 10.451526], 6); // default germany

    L.tileLayer('/api/tiles/light/{z}/{x}/{y}.png', {
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

    completeOnboarding(name, job, homeLat, homeLng, {
      bio, jobDescription, pronouns, favoriteCategory, deliveryNote, avatarColor
    });
    navigateTo('DASHBOARD');
  }

  function randomizeProfile() {
    const profile = randomProfiles[Math.floor(Math.random() * randomProfiles.length)];
    name = profile.name;
    pronouns = profile.pronouns;
    bio = profile.bio;
    jobDescription = profile.job;
    deliveryNote = profile.note;
    selectedJobId = jobPresets[Math.floor(Math.random() * jobPresets.length)].id;
    const categories = ['LUXURY', 'EVERYDAY', 'ABSURD', 'MYSTERY'] as const;
    favoriteCategory = categories[Math.floor(Math.random() * categories.length)];
    const colors = ['#4f46e5', '#0f766e', '#be123c', '#7c3aed', '#c2410c'];
    avatarColor = colors[Math.floor(Math.random() * colors.length)];
    const locations = [{ lat: 52.52, lng: 13.405 }, { lat: 53.551, lng: 9.994 }, { lat: 50.111, lng: 8.682 }, { lat: 48.135, lng: 11.582 }];
    const location = locations[Math.floor(Math.random() * locations.length)];
    homeLat = location.lat + (Math.random() - .5) * .08;
    homeLng = location.lng + (Math.random() - .5) * .08;
    if (map) {
      const latLng = L.latLng(homeLat, homeLng);
      if (marker) marker.setLatLng(latLng);
      else marker = L.marker(latLng).addTo(map);
      map.setView(latLng, 11);
    }
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-6 relative">
  <div class="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-2xl flex flex-col gap-8">
    <button onclick={randomizeProfile} class="self-end rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 font-black text-white shadow-lg">
      Alles zufällig ausfüllen
    </button>
    <div class="flex flex-wrap justify-center gap-2" aria-label="Sprache auswählen">
      {#each languages as language}
        <button
          onclick={() => setLocale(language.locale)}
          class="flex items-center gap-2 rounded-xl border px-4 py-2 font-bold {i18nState.locale === language.locale ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700'}"
          aria-pressed={i18nState.locale === language.locale}
        >
          <span class="country-flag text-xl" aria-hidden="true">{language.flag}</span>{language.label}
        </button>
      {/each}
    </div>
    
    <div class="text-center space-y-2">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        {t('onboarding.title')}
        </h2>
        <p class="text-slate-500 dark:text-slate-400">{t('onboarding.subtitle')} <CoinIcon class="w-4 h-4 inline" /></p>
    </div>

    <div class="space-y-3">
      <label for="profile-name" class="text-slate-700 dark:text-slate-300 font-bold text-sm">{t('onboarding.name')}</label>
      <input 
        id="profile-name"
        type="text" 
        bind:value={name} 
        placeholder={t('onboarding.name_placeholder')}
        class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="space-y-2 text-sm font-bold">
        {t('onboarding.pronouns')} <span class="font-normal text-slate-400">({t('onboarding.optional')})</span>
        <input bind:value={pronouns} maxlength="30" placeholder={t('onboarding.pronouns_placeholder')} class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
      </label>
      <label class="space-y-2 text-sm font-bold">
        {t('onboarding.avatar')}
        <input bind:value={avatarColor} type="color" class="mt-2 h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900" />
      </label>
    </div>

    <label class="space-y-2 text-sm font-bold">
      {t('onboarding.bio')} <span class="font-normal text-slate-400">({t('onboarding.optional')})</span>
      <textarea bind:value={bio} maxlength="180" rows="3" placeholder={t('onboarding.bio_placeholder')} class="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"></textarea>
      <span class="block text-right text-xs font-normal text-slate-400">{bio.length}/180</span>
    </label>

    <div class="space-y-3">
      <div class="text-slate-700 dark:text-slate-300 font-bold text-sm" id="job-label">{t('onboarding.job')}</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-labelledby="job-label">
        {#each jobPresets as preset}
          <label class="cursor-pointer group">
            <input type="radio" name="job" value={preset.id} bind:group={selectedJobId} class="hidden peer" />
            <div class="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 transition-all">
              <h3 class="font-bold text-slate-900 dark:text-white">{preset.title}</h3>
              <div class="flex items-center gap-1 mt-1">
                  <CoinIcon class="w-4 h-4" />
                  <p class="text-indigo-600 dark:text-indigo-400 font-medium text-sm">{preset.salary.toLocaleString()} / {preset.interval === 'WEEKLY' ? t('onboarding.week') : t('onboarding.month')}</p>
              </div>
            </div>
          </label>
        {/each}
      </div>
      <label class="block text-sm font-bold">
        {t('onboarding.job_description')} <span class="font-normal text-slate-400">({t('onboarding.optional')})</span>
        <textarea bind:value={jobDescription} maxlength="160" rows="2" placeholder={t('onboarding.job_placeholder')} class="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"></textarea>
      </label>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="text-sm font-bold">
        {t('onboarding.favorite')}
        <select bind:value={favoriteCategory} class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <option value="EVERYDAY">{t('onboarding.everyday')}</option><option value="LUXURY">{t('onboarding.luxury')}</option><option value="ABSURD">{t('onboarding.absurd')}</option><option value="MYSTERY">{t('onboarding.mystery')}</option>
        </select>
      </label>
      <label class="text-sm font-bold">
        {t('onboarding.delivery_note')} <span class="font-normal text-slate-400">({t('onboarding.optional')})</span>
        <input bind:value={deliveryNote} maxlength="80" placeholder={t('onboarding.delivery_placeholder')} class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
      </label>
    </div>

    <div class="space-y-3">
      <div class="text-slate-700 dark:text-slate-300 font-bold text-sm" id="map-label">{t('onboarding.map')}</div>
      <div bind:this={mapContainer} role="application" aria-labelledby="map-label" class="w-full h-64 rounded-xl border-2 border-slate-200 dark:border-slate-700 z-0 overflow-hidden shadow-inner"></div>
      <p class="rounded-xl bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
        {t('onboarding.map_privacy')}
      </p>
      {#if !homeLat}
        <p class="text-red-500 text-xs font-medium">{t('onboarding.map_required')}</p>
      {/if}
    </div>

    <button 
      onclick={handleComplete}
      disabled={!name || !homeLat}
      class="mt-4 w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl cursor-pointer"
    >
      {t('onboarding.start')}
    </button>

    <div class="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-500">
      <button onclick={() => navigateTo('IMPRINT')} class="hover:text-indigo-500">Imprint / Impressum</button>
      <button onclick={() => navigateTo('PRIVACY')} class="hover:text-indigo-500">Privacy / Datenschutz</button>
    </div>
  </div>
</div>
