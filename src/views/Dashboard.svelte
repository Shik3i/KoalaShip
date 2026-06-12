<script lang="ts">
  import { user, addFunds, switchMode, resetUser } from '../lib/store.svelte';
  import { navigateTo } from '../lib/router.svelte';
  
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
  <div class="flex items-center gap-4">
    <h2 class="text-2xl font-black uppercase tracking-widest text-slate-200">Terminal</h2>
    <div class="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- User Card -->
    <div class="relative bg-gradient-to-br from-[#101025] to-[#0a0a15] border border-indigo-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(79,70,229,0.15)] overflow-hidden group">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700"></div>

      <div class="relative z-10 flex flex-col gap-6">
        <div class="flex justify-between items-start">
            <div class="flex flex-col gap-1">
                <span class="text-indigo-400 font-mono text-sm tracking-widest uppercase opacity-80">Profil</span>
                <span class="text-2xl font-black text-white tracking-wider">{user.name || 'Unbekannt'}</span>
                <span class="text-emerald-400 font-mono text-sm">{user.occupation?.title || 'Arbeitslos'}</span>
            </div>
            
            <button onclick={handleReset} class="text-xs font-mono text-slate-500 hover:text-red-400 transition-colors">
                [RESET]
            </button>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-indigo-400 font-mono text-sm tracking-widest uppercase opacity-80">Liquidität (DC)</span>
          <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
            {Math.floor(user.balance).toLocaleString('de-DE')}
          </div>
        </div>

        <!-- Mode Toggles -->
        <div class="flex flex-col gap-1 mt-2 border-t border-slate-800 pt-4">
            <div class="flex justify-between items-center">
                <span class="text-slate-400 font-mono text-sm uppercase">Simulationsmodus</span>
                <span class="font-black {user.mode === 'DEMO' ? 'text-pink-500' : 'text-yellow-400'}">{user.mode}</span>
            </div>
            <button onclick={switchMode} class="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md text-xs font-bold uppercase transition-all shadow-md">
                Modus wechseln
            </button>
        </div>
      </div>
    </div>

    <!-- Income Tracker -->
    <div class="relative bg-gradient-to-br from-[#101025] to-[#0a0a15] border border-emerald-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden group">
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyan-500/30 transition-colors duration-700"></div>

        <div class="relative z-10 flex flex-col gap-6 h-full justify-between">
            <div class="flex flex-col gap-1">
                <span class="text-emerald-400 font-mono text-sm tracking-widest uppercase opacity-80">Nächste Gehaltszahlung</span>
                <div class="text-4xl font-black text-white mt-2">
                    In {formatTimeRemaining(nextSalaryRemaining)}
                </div>
            </div>

            <div class="flex flex-col gap-1 border-l-2 border-emerald-500/50 pl-4 mt-auto">
                <span class="text-slate-400 font-mono text-sm uppercase">Erwarteter Eingang</span>
                <span class="text-2xl font-black text-emerald-400">+{user.occupation?.salary?.toLocaleString('de-DE') || 0} DC</span>
            </div>
        </div>
    </div>
  </div>
</div>
