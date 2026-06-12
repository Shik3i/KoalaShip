<script lang="ts">
  import { user, switchMode, resetUser } from '../lib/store.svelte';
  import { navigateTo } from '../lib/router.svelte';
  import { t } from '../lib/i18n.svelte';
  import CoinIcon from '../components/CoinIcon.svelte';
  
  function formatTimeRemaining(ms: number) {
    if (ms <= 0) return '0s';
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 1000 / 60) % 60;
    const h = Math.floor(ms / 1000 / 60 / 60) % 24;
    const d = Math.floor(ms / 1000 / 60 / 60 / 24);
    
    let parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
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
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between mb-8">
    <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('nav.dashboard')}</h2>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- User Card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-6 relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -z-0"></div>

        <div class="relative z-10 flex justify-between items-start">
            <div class="flex flex-col gap-1">
                <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-widest uppercase">Profil</span>
                <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user.name || 'Unbekannt'}</span>
                <span class="text-slate-500 dark:text-slate-400 font-medium">{user.occupation?.title || 'Arbeitslos'}</span>
            </div>
            
            <button onclick={handleReset} class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-md">
                RESET
            </button>
        </div>

        <div class="relative z-10 flex flex-col gap-2 mt-4">
          <span class="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase">{t('dashboard.balance')}</span>
          <div class="flex items-center gap-3">
              <CoinIcon class="w-10 h-10" />
              <div class="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {Math.floor(user.balance).toLocaleString('de-DE')}
              </div>
          </div>
        </div>

        <!-- Mode Toggles -->
        <div class="relative z-10 flex flex-col gap-1 mt-auto border-t border-slate-100 dark:border-slate-700 pt-6">
            <div class="flex justify-between items-center mb-2">
                <span class="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">Simulationsmodus</span>
                <span class="font-black px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-xs {user.mode === 'DEMO' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}">{user.mode}</span>
            </div>
            <button onclick={switchMode} class="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold transition-all shadow-sm text-slate-700 dark:text-slate-300">
                Modus wechseln
            </button>
        </div>
    </div>

    <!-- Income Tracker -->
    <div class="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-2xl p-8 shadow-md flex flex-col gap-6 relative overflow-hidden text-white">
        <!-- Decoration -->
        <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col gap-2 h-full justify-center">
            <span class="text-indigo-200 font-bold text-sm tracking-widest uppercase">{t('dashboard.next_salary')}</span>
            <div class="text-5xl md:text-6xl font-black mt-2 tracking-tight">
                {formatTimeRemaining(nextSalaryRemaining)}
            </div>
        </div>

        <div class="relative z-10 flex flex-col gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-auto border border-white/20">
            <span class="text-indigo-200 font-bold text-xs uppercase">Erwarteter Eingang</span>
            <div class="flex items-center gap-2">
                <CoinIcon class="w-6 h-6 grayscale brightness-200" />
                <span class="text-3xl font-black">+{user.occupation?.salary?.toLocaleString('de-DE') || 0}</span>
            </div>
        </div>
    </div>
  </div>
</div>
