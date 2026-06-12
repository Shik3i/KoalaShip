<script lang="ts">
  import { user, switchMode, resetUser, orders, products } from '../lib/store.svelte';
  import { navigateTo } from '../lib/router.svelte';
  import { t } from '../lib/i18n.svelte';
  import CoinIcon from '../components/CoinIcon.svelte';
  
  function formatTimeRemaining(ms: number) {
    if (ms <= 0) return 'Jetzt';
    const d = Math.floor(ms / 1000 / 60 / 60 / 24);
    if (d > 0) return `${d} Tag${d > 1 ? 'en' : ''}`;
    
    const h = Math.floor(ms / 1000 / 60 / 60) % 24;
    if (h > 0) return `${h} Stunde${h > 1 ? 'n' : ''}`;

    const m = Math.floor(ms / 1000 / 60) % 60;
    if (m > 0) return `${m} Min`;
    
    const s = Math.floor(ms / 1000) % 60;
    return `${s} Sek`;
  }
  
  let nextSalaryRemaining = $state(0);
  
  $effect(() => {
    const interval = setInterval(() => {
        if (!user.lastSalaryPayment || !user.occupation) {
            nextSalaryRemaining = 0;
            return;
        }
        
        const now = Date.now();
        const isDemo = user.mode === 'DEMO';
        let intervalMs = 0;
        
        if (user.occupation.interval === 'WEEKLY') {
            intervalMs = isDemo ? 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        } else {
            intervalMs = isDemo ? 4 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
        }
        
        const nextPayment = user.lastSalaryPayment + intervalMs;
        nextSalaryRemaining = Math.max(0, nextPayment - now);
    }, 1000);
    
    return () => clearInterval(interval);
  });

  function handleReset() {
    if (confirm("Wirklich alles zurücksetzen? Dein Fortschritt geht verloren!")) {
        resetUser();
        navigateTo('ONBOARDING');
    }
  }

  let recentOrders = $derived([...orders].reverse().slice(0, 3));
</script>

<div class="space-y-8">
  <div class="flex items-center justify-between">
    <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('nav.dashboard')}</h2>
    <div class="flex items-center gap-4">
        <span class="font-bold px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs shadow-sm border border-slate-200 dark:border-slate-700 {user.mode === 'DEMO' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}">Modus: {user.mode}</span>
        <button onclick={switchMode} class="text-xs text-slate-500 hover:text-indigo-500 underline transition-colors">Wechseln</button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Main Wallet Card -->
    <div class="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-3xl p-8 shadow-lg flex flex-col justify-between relative overflow-hidden text-white border border-indigo-500/30">
        <!-- Decoration -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex justify-between items-start mb-12">
            <div class="flex flex-col gap-1">
                <span class="text-indigo-200 font-bold text-sm tracking-widest uppercase">Karteninhaber</span>
                <span class="text-3xl font-black tracking-tight">{user.name || 'Unbekannt'}</span>
                <span class="text-indigo-100 font-medium">{user.occupation?.title || 'Arbeitslos'}</span>
            </div>
            
            <button onclick={handleReset} class="text-xs font-bold text-indigo-200 hover:text-red-400 transition-colors px-3 py-1.5 bg-black/20 hover:bg-black/40 rounded-lg backdrop-blur-sm">
                RESET ACCOUNT
            </button>
        </div>

        <div class="relative z-10 flex flex-col gap-2">
          <span class="text-indigo-200 font-bold text-sm tracking-widest uppercase">Verfügbares Guthaben</span>
          <div class="flex items-end gap-4">
              <CoinIcon class="w-12 h-12 grayscale brightness-200 shadow-sm rounded-full" />
              <div class="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                {Math.floor(user.balance).toLocaleString('de-DE')}
              </div>
          </div>
          
          <div class="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 w-fit">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              <span class="font-bold text-emerald-400">+{user.occupation?.salary?.toLocaleString('de-DE') || 0} KC</span>
              <span class="text-indigo-200 text-sm">(Eingang in: {formatTimeRemaining(nextSalaryRemaining)})</span>
          </div>
        </div>
    </div>

    <!-- Quick Stats & Actions -->
    <div class="flex flex-col gap-6">
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col justify-center items-center text-center gap-2">
            <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-2">
                📦
            </div>
            <span class="text-4xl font-black text-slate-900 dark:text-white">{orders.length}</span>
            <span class="text-slate-500 font-bold text-sm uppercase">Total Orders</span>
        </div>

        <button 
            onclick={() => navigateTo('SHOP')}
            class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between group transition-all"
        >
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    🛒
                </div>
                <span class="font-bold text-slate-900 dark:text-white text-lg">Zum Shop</span>
            </div>
            <svg class="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Letzte Aktivitäten</h3>
        {#if orders.length > 0}
            <button onclick={() => navigateTo('HISTORY')} class="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Alle anzeigen</button>
        {/if}
    </div>

    {#if orders.length === 0}
        <div class="text-center py-8">
            <span class="text-4xl opacity-50 mb-4 block">🏜️</span>
            <p class="text-slate-500">Noch keine Bestellungen getätigt.</p>
        </div>
    {:else}
        <div class="space-y-4">
            {#each recentOrders as order}
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div class="flex items-center gap-4">
                        <div class="text-3xl">{products.find(p => p.id === order.productId)?.imageUrl}</div>
                        <div>
                            <p class="font-bold text-slate-900 dark:text-white">{products.find(p => p.id === order.productId)?.name}</p>
                            <p class="text-xs text-slate-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md
                        {order.status === 'PROCESSING' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : ''}
                        {order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' : ''}
                        {order.status === 'DELIVERED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' : ''}
                        {order.status === 'OPENED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : ''}
                    ">
                        {order.status}
                    </span>
                </div>
            {/each}
        </div>
    {/if}
  </div>
</div>
