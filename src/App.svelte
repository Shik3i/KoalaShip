<script lang="ts">
  import { onMount } from 'svelte';
  import { user, initTicker } from './lib/store.svelte';
  import { routerState, initRouter, navigateTo } from './lib/router.svelte';
  
  import Onboarding from './views/Onboarding.svelte';
  import Dashboard from './views/Dashboard.svelte';
  import Shop from './views/Shop.svelte';
  import History from './views/History.svelte';
  import LiveTracking from './views/LiveTracking.svelte';

  onMount(() => {
    initTicker();
    initRouter();
  });

  // Force Onboarding if no user data
  $effect(() => {
    if (typeof window !== 'undefined') {
        if (!user.name && routerState.currentRoute !== 'ONBOARDING') {
            navigateTo('ONBOARDING');
        }
    }
  });

  const navItems = [
    { route: 'DASHBOARD', label: 'Terminal', icon: '💻' },
    { route: 'SHOP', label: 'Darknet Shop', icon: '🛒' },
    { route: 'HISTORY', label: 'Historie', icon: '📜' },
    { route: 'MAP', label: 'Live Radar', icon: '🗺️' }
  ];
</script>

<div class="min-h-screen flex flex-col bg-[#050510] text-slate-200 selection:bg-purple-600 selection:text-white font-sans">
  
  {#if routerState.currentRoute === 'ONBOARDING'}
    <Onboarding />
  {:else}
    <!-- Header -->
    <header class="bg-[#0a0a1a]/80 backdrop-blur-md border-b border-purple-500/30 sticky top-0 z-40 shadow-[0_4px_30px_rgba(147,51,234,0.15)]">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 tracking-widest uppercase flex items-center gap-3 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          <span class="text-4xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">🐨</span> KoalaShip
        </h1>
        
        <!-- Desktop Nav -->
        <nav class="hidden md:flex gap-2">
            {#each navItems as item}
                <button 
                    onclick={() => navigateTo(item.route as any)}
                    class="px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2
                        {routerState.currentRoute === item.route 
                            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}"
                >
                    <span class="text-lg">{item.icon}</span> {item.label}
                </button>
            {/each}
        </nav>

        <a href="https://github.com/Shik3i/KoalaShip.git" target="_blank" rel="noopener noreferrer" class="group ml-4">
          <div class="p-2 rounded-full bg-slate-800/50 border border-slate-700 group-hover:border-purple-500 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <img src="/icons/github.svg" alt="GitHub Repo" class="w-6 h-6 filter opacity-70 group-hover:opacity-100 transition-all" />
          </div>
        </a>
      </div>
    </header>

    <main class="flex-1 w-full max-w-6xl mx-auto p-6 mt-4 pb-24 md:pb-6">
      {#if routerState.currentRoute === 'DASHBOARD'}
        <Dashboard />
      {:else if routerState.currentRoute === 'SHOP'}
        <Shop />
      {:else if routerState.currentRoute === 'HISTORY'}
        <History />
      {:else if routerState.currentRoute === 'MAP'}
        <LiveTracking />
      {/if}
    </main>

    <!-- Mobile Nav (Bottom Bar) -->
    <nav class="md:hidden fixed bottom-0 w-full bg-[#0a0a1a]/90 backdrop-blur-xl border-t border-purple-500/30 flex justify-around p-3 z-50 shadow-[0_-4px_30px_rgba(147,51,234,0.15)]">
        {#each navItems as item}
            <button 
                onclick={() => navigateTo(item.route as any)}
                class="flex flex-col items-center gap-1 p-2 transition-colors {routerState.currentRoute === item.route ? 'text-purple-400' : 'text-slate-500'}"
            >
                <span class="text-2xl">{item.icon}</span>
                <span class="text-[10px] font-bold uppercase">{item.label}</span>
            </button>
        {/each}
    </nav>
  {/if}
</div>
