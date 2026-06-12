<script lang="ts">
  import { onMount } from 'svelte';
  import { user, initTicker } from './lib/store.svelte';
  import { routerState, initRouter, navigateTo } from './lib/router.svelte';
  import { themeState, initTheme, toggleTheme } from './lib/theme.svelte';
  import { i18nState, initI18n, setLocale, t } from './lib/i18n.svelte';
  import CoinIcon from './components/CoinIcon.svelte';
  import ToastHost from './components/ToastHost.svelte';
  import NewsTicker from './components/NewsTicker.svelte';
  import { getSoundEnabled, setSoundEnabled } from './lib/sound';
  
  import Onboarding from './views/Onboarding.svelte';
  import Dashboard from './views/Dashboard.svelte';
  import Shop from './views/Shop.svelte';
  import History from './views/History.svelte';
  import LiveTracking from './views/LiveTracking.svelte';
  import Room from './views/Room.svelte';
  import Profile from './views/Profile.svelte';
  import Legal from './views/Legal.svelte';
  import Changelog from './views/Changelog.svelte';
  import InboxModal from './components/InboxModal.svelte';
  let soundEnabled = $state(true);
  let inboxOpen = $state(false);
  let unreadMessages = $derived(user.messages?.filter(m => !m.read).length ?? 0);

  onMount(() => {
    initTheme();
    initI18n();
    initTicker();
    initRouter();
    soundEnabled = getSoundEnabled();
  });

  // Force Onboarding if no user data
  $effect(() => {
    if (typeof window !== 'undefined') {
        const publicRoutes = ['ONBOARDING', 'IMPRINT', 'PRIVACY', 'CHANGELOG'];
        if (!user.name && !publicRoutes.includes(routerState.currentRoute)) {
            navigateTo('ONBOARDING');
        }
    }
  });

  const navItems = [
    { route: 'DASHBOARD', labelKey: 'nav.dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { route: 'SHOP', labelKey: 'nav.shop', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { route: 'HISTORY', labelKey: 'nav.history', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { route: 'ROOM', labelKey: 'nav.inventory', icon: 'M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6' },
    { route: 'MAP', labelKey: 'nav.map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' }
  ];
</script>

<!-- Global App Container with Dynamic Theme Classes -->
<div class="min-h-screen flex flex-col font-sans transition-colors duration-500
  bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
  
  <!-- Mesh Gradient Background (Subtle & Premium) -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-[-1] opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen">
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-900 blur-[100px] animate-pulse" style="animation-duration: 15s;"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-sky-200 to-emerald-200 dark:from-sky-900 dark:to-emerald-900 blur-[120px] animate-pulse" style="animation-duration: 20s;"></div>
  </div>
  
  {#if routerState.currentRoute === 'ONBOARDING'}
    <Onboarding />
  {:else if routerState.currentRoute === 'IMPRINT'}
    <main class="flex-1 w-full px-4 py-10 sm:px-6"><Legal page="IMPRINT" /></main>
  {:else if routerState.currentRoute === 'PRIVACY'}
    <main class="flex-1 w-full px-4 py-10 sm:px-6"><Legal page="PRIVACY" /></main>
  {:else if routerState.currentRoute === 'CHANGELOG'}
    <main class="flex-1 w-full px-4 py-10 sm:px-6"><Changelog /></main>
  {:else}
    <!-- Premium Header / Navbar -->
    <header class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        
        <!-- Logo -->
        <button class="flex items-center gap-3 cursor-pointer" onclick={() => navigateTo('SHOP')} aria-label="KoalaShip Marktplatz öffnen">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md transform transition hover:rotate-12">
            <span class="text-white text-xl font-bold">K</span>
          </div>
          <span class="text-xl font-black tracking-tight text-slate-900 dark:text-white hidden sm:block">
            KoalaShip
          </span>
        </button>
        
        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
            {#each navItems as item}
                <button 
                    onclick={() => navigateTo(item.route as any)}
                    class="px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2
                        {routerState.currentRoute === item.route 
                            ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}/></svg>
                    {t(item.labelKey)}
                </button>
            {/each}
        </nav>

        <!-- Right Side Tools -->
        <div class="flex items-center gap-4">
            <!-- Balance -->
            <div class="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors">
                <CoinIcon class="w-5 h-5" />
                <span class="font-bold text-slate-800 dark:text-slate-200 font-mono">{Math.floor(user.balance).toLocaleString('de-DE')}</span>
            </div>

            <!-- Inbox -->
            <button 
                onclick={() => inboxOpen = true}
                class="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                aria-label="Postfach öffnen"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                {#if unreadMessages > 0}
                    <span class="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">{unreadMessages}</span>
                {/if}
            </button>

            <!-- Language Toggle -->
            <div class="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm overflow-hidden">
                <select 
                    bind:value={i18nState.locale}
                    onchange={(e) => setLocale(e.currentTarget.value as any)}
                    class="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-2 outline-none cursor-pointer appearance-none text-center"
                >
                    <option value="DE" class="country-flag text-slate-900">🇩🇪 DE</option>
                    <option value="EN" class="country-flag text-slate-900">🇬🇧 EN</option>
                    <option value="ES" class="country-flag text-slate-900">🇪🇸 ES</option>
                </select>
            </div>

            <!-- Theme Toggle -->
            <button onclick={() => navigateTo('PROFILE')} class="flex h-9 w-9 items-center justify-center rounded-xl font-black text-white shadow" style={`background:${user.avatarColor ?? '#4f46e5'}`} aria-label="Profil öffnen">
                {user.name?.slice(0, 1).toUpperCase()}
            </button>

            <button
                onclick={() => { soundEnabled = !soundEnabled; setSoundEnabled(soundEnabled); }}
                class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                aria-label={soundEnabled ? 'Sounds ausschalten' : 'Sounds einschalten'}
                title={soundEnabled ? 'Sounds an' : 'Sounds aus'}
            >
                {soundEnabled ? '🔊' : '🔇'}
            </button>

            <button 
                onclick={toggleTheme}
                class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                aria-label="Toggle Theme"
            >
                {#if themeState.current === 'light'}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                {:else}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                {/if}
            </button>
        </div>
      </div>
    </header>
    <NewsTicker />

    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      {#if routerState.currentRoute === 'DASHBOARD'}
        <Dashboard />
      {:else if routerState.currentRoute === 'SHOP'}
        <Shop />
      {:else if routerState.currentRoute === 'HISTORY'}
        <History />
      {:else if routerState.currentRoute === 'MAP'}
        <LiveTracking />
      {:else if routerState.currentRoute === 'ROOM'}
        <Room />
      {:else if routerState.currentRoute === 'PROFILE'}
        <Profile />
      {/if}
    </main>

    <footer class="border-t border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/70">
      <button onclick={() => navigateTo('IMPRINT')} class="mx-3 font-bold hover:text-indigo-500">Imprint / Impressum</button>
      <button onclick={() => navigateTo('PRIVACY')} class="mx-3 font-bold hover:text-indigo-500">Privacy / Datenschutz</button>
      <a href="https://github.com/Shik3i/KoalaShip" target="_blank" rel="noopener noreferrer" class="mx-3 inline-flex items-center gap-1 font-bold hover:text-indigo-500">
        <img src="/icons/github.svg" alt="" class="h-4 w-4" />GitHub
      </a>
      <button onclick={() => navigateTo('CHANGELOG')} class="mx-3 font-bold hover:text-indigo-500">v0.4.0 · Changelog</button>
      <span class="mx-3">KoalaShip · fiktive Shopping-Simulation</span>
    </footer>

    <!-- Mobile Nav (Bottom Bar) -->
    <nav class="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-[200] transition-colors duration-500">
        {#each navItems as item}
            <button 
                onclick={() => navigateTo(item.route as any)}
                class="flex flex-col items-center gap-1 p-2 transition-colors {routerState.currentRoute === item.route ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}/></svg>
                <span class="text-[10px] font-bold">{t(item.labelKey)}</span>
            </button>
        {/each}
    </nav>
  {/if}
  {#if inboxOpen}
    <InboxModal close={() => inboxOpen = false} />
  {/if}
  <ToastHost />
</div>
