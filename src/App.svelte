<script lang="ts">
  import { onMount } from 'svelte';
  import { user, products, orders, initTicker, addFunds, switchMode, purchaseProduct, openPackage } from './lib/store.svelte';
  import { fade, scale } from 'svelte/transition';

  let activeUnboxingOrderId = $state<string | null>(null);
  let unboxingClicks = $state(0);
  let isShaking = $state(false);

  function initiateUnboxing(orderId: string) {
    activeUnboxingOrderId = orderId;
    unboxingClicks = 0;
    isShaking = false;
  }

  function handleBoxClick() {
    if (unboxingClicks >= 3) return;
    unboxingClicks++;
    
    // reset animation
    isShaking = false;
    setTimeout(() => {
      isShaking = true;
      setTimeout(() => {
        isShaking = false;
        if (unboxingClicks === 3 && activeUnboxingOrderId) {
          openPackage(activeUnboxingOrderId);
        }
      }, 300);
    }, 10);
  }

  function closeUnboxing() {
    activeUnboxingOrderId = null;
  }

  onMount(() => {
    initTicker();
  });

  // Helper to format remaining time
  function getRemainingSeconds(eta: number) {
    const remaining = Math.max(0, Math.floor((eta - Date.now()) / 1000));
    return remaining;
  }
</script>

<div class="min-h-screen flex flex-col bg-[#050510] text-slate-200 selection:bg-purple-600 selection:text-white font-sans">
  
  <!-- Header -->
  <header class="bg-[#0a0a1a]/80 backdrop-blur-md border-b border-purple-500/30 sticky top-0 z-40 shadow-[0_4px_30px_rgba(147,51,234,0.15)]">
    <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
      <h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 tracking-widest uppercase flex items-center gap-3 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
        <span class="text-4xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">🐨</span> KoalaShip
      </h1>
      <a href="https://github.com/Shik3i/KoalaShip.git" target="_blank" rel="noopener noreferrer" class="group">
        <div class="p-2 rounded-full bg-slate-800/50 border border-slate-700 group-hover:border-purple-500 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          <img src="/icons/github.svg" alt="GitHub Repo" class="w-6 h-6 filter opacity-70 group-hover:opacity-100 transition-all" />
        </div>
      </a>
    </div>
  </header>

  <main class="flex-1 w-full max-w-6xl mx-auto p-6 flex flex-col gap-12 mt-4">
    
    <!-- Dashboard / Profile -->
    <section>
      <div class="relative bg-gradient-to-br from-[#101025] to-[#0a0a15] border border-indigo-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(79,70,229,0.15)] overflow-hidden group">
        <!-- Glowing background orb -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/30 transition-colors duration-700"></div>

        <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          
          <div class="flex flex-col gap-1">
            <span class="text-indigo-400 font-mono text-sm tracking-widest uppercase opacity-80">Aktueller Modus</span>
            <div class="flex items-center gap-3">
              <span class="text-2xl font-black tracking-wider {user.mode === 'DEMO' ? 'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' : 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'}">
                {user.mode}
              </span>
              <button 
                onclick={switchMode}
                class="ml-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-indigo-400 rounded-md text-xs font-bold uppercase transition-all shadow-md hover:shadow-[0_0_10px_rgba(99,102,241,0.4)] cursor-pointer"
              >
                Switch
              </button>
            </div>
          </div>
          
          <div class="flex flex-col gap-1">
            <span class="text-indigo-400 font-mono text-sm tracking-widest uppercase opacity-80">Liquidität (DC)</span>
            <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
              {user.balance.toLocaleString('de-DE')}
            </div>
          </div>

          <button 
            onclick={() => addFunds(1000)}
            class="relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest overflow-hidden group/btn shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite]"></div>
            <span class="relative z-10 flex items-center gap-2">
              <span class="text-xl">💰</span> +1000 Inject
            </span>
          </button>

        </div>
      </div>
    </section>

    <!-- Shop Grid -->
    <section class="space-y-6">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-black uppercase tracking-widest text-slate-200">Darknet Market</h2>
        <div class="flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each products as product}
          <div class="group relative bg-[#101025] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 flex flex-col
            {user.balance >= product.price ? 'shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.2)]' : 'opacity-80 grayscale-[20%]'}
          ">
            
            <div class="w-full h-40 bg-slate-900/50 border border-slate-800 rounded-xl mb-6 flex items-center justify-center text-7xl shadow-inner group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span class="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{product.imageUrl}</span>
            </div>
            
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-white leading-tight">{product.name}</h3>
              <span class="text-[10px] font-mono font-bold tracking-widest px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700">{product.category}</span>
            </div>
            
            <p class="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] mb-8">
              {product.price.toLocaleString('de-DE')} DC
            </p>
            
            <button 
              onclick={() => purchaseProduct(product.id)}
              disabled={user.balance < product.price}
              class="mt-auto w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:cursor-not-allowed
                {user.balance >= product.price 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-95' 
                  : 'bg-slate-800 text-slate-500 border border-slate-700'}"
            >
              {user.balance >= product.price ? 'Kaufen 🛒' : 'Broke 💀'}
            </button>
          </div>
        {/each}
      </div>
    </section>

    <!-- Orders Log -->
    <section class="space-y-6">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-black uppercase tracking-widest text-slate-200">Logistik-Terminal</h2>
        <div class="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </div>

      {#if orders.length === 0}
        <div class="p-12 text-center bg-[#101025] border border-slate-800 border-dashed rounded-2xl text-slate-500 font-mono shadow-inner">
          <p class="text-lg">System idle. Keine aktiven Lieferungen.</p>
        </div>
      {:else}
        <div class="flex flex-col gap-6">
          {#each [...orders].reverse() as order}
            <div class="bg-[#101025] border border-slate-800 rounded-2xl p-6 relative overflow-hidden transition-all duration-500
              {order.status === 'DELIVERED' ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)] bg-yellow-900/10' : ''}
              {order.status === 'OPENED' ? 'opacity-50 border-slate-800 bg-slate-950' : ''}
            ">
              <!-- Glow Line Left -->
              <div class="absolute left-0 top-0 bottom-0 w-2
                {order.status === 'PROCESSING' ? 'bg-orange-500 shadow-[0_0_15px_#f97316]' : ''}
                {order.status === 'SHIPPED' ? 'bg-blue-500 shadow-[0_0_15px_#3b82f6]' : ''}
                {order.status === 'DELIVERED' ? 'bg-yellow-400 shadow-[0_0_15px_#facc15]' : ''}
                {order.status === 'OPENED' ? 'bg-emerald-500' : ''}
              "></div>

              <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 pl-4">
                <div>
                  <h4 class="font-black text-white text-xl mb-1">{products.find(p => p.id === order.productId)?.name}</h4>
                  <p class="text-xs text-slate-500 font-mono tracking-wider">Tracking-ID: {order.id.split('-')[0]}</p>
                </div>
                
                <div class="flex items-center gap-4">
                  {#if order.status === 'PROCESSING' || order.status === 'SHIPPED'}
                    <div class="font-mono text-sm bg-red-950/50 px-4 py-2 rounded-lg text-red-400 border border-red-900/50 flex items-center gap-3 shadow-[0_0_10px_rgba(248,113,113,0.1)]">
                      <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"></span>
                      <span class="font-bold">ETA: {getRemainingSeconds(order.deliveryEta)}s</span>
                    </div>
                  {/if}
                  
                  <span class="font-mono text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg border
                    {order.status === 'PROCESSING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : ''}
                    {order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : ''}
                    {order.status === 'DELIVERED' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : ''}
                    {order.status === 'OPENED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : ''}
                  ">
                    {order.status}
                  </span>
                </div>
              </div>

              <!-- Protokoll -->
              <div class="bg-[#050510] rounded-xl p-4 font-mono text-sm space-y-3 border border-slate-800/50 shadow-inner ml-4">
                {#each order.trackingSteps as step}
                  <div class="flex gap-4 items-start">
                    <span class="text-indigo-400 shrink-0 opacity-70">[{new Date(step.timestamp).toLocaleTimeString()}]</span>
                    <span class="text-slate-300 {step.message.includes('DOPAMIN') ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] font-bold' : ''}">
                      > {step.message}
                    </span>
                  </div>
                {/each}
              </div>

              {#if order.status === 'DELIVERED'}
                <button 
                  onclick={() => initiateUnboxing(order.id)}
                  class="mt-6 ml-4 w-[calc(100%-1rem)] py-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-500 hover:from-yellow-500 hover:via-yellow-400 hover:to-orange-400 text-slate-950 rounded-xl font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_40px_rgba(234,179,8,0.7)] cursor-pointer hover:scale-[1.01] active:scale-[0.99] animate-pulse"
                >
                  Initiate Unboxing Sequence 🚀🎁
                </button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </main>

  <!-- UNBOXING MODAL (Fullscreen) -->
  {#if activeUnboxingOrderId}
    {@const activeOrder = orders.find(o => o.id === activeUnboxingOrderId)}
    {@const activeProduct = products.find(p => p.id === activeOrder?.productId)}
    
    <div 
      class="fixed inset-0 z-[100] bg-[#050510]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6" 
      transition:fade={{ duration: 400 }}
    >
      
      {#if unboxingClicks < 3}
        <!-- The Box Phase -->
        <div class="flex flex-col items-center gap-12">
          <h2 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] uppercase tracking-widest text-center">
            Smash to Open! <br/><span class="text-2xl text-white mt-4 block opacity-80">({unboxingClicks}/3 Hits)</span>
          </h2>
          
          <button 
            onclick={handleBoxClick}
            class="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#8B5A2B] to-[#654321] border-8 border-[#3d2711] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group {isShaking ? 'animate-[shake_0.2s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}"
            style={isShaking ? 'animation-name: shake;' : ''}
          >
            <!-- Tape styling -->
            <div class="absolute w-full h-16 bg-[#C19A6B]/90 top-1/2 -translate-y-1/2 shadow-inner mix-blend-overlay"></div>
            <div class="absolute w-16 h-full bg-[#C19A6B]/90 left-1/2 -translate-x-1/2 shadow-inner mix-blend-overlay"></div>
            
            <span class="text-8xl md:text-9xl group-hover:scale-110 transition-transform z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">📦</span>
            
            <!-- Glow on hover -->
            <div class="absolute inset-0 bg-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>
        </div>
        
      {:else if activeProduct}
        <!-- The Epic Reveal Phase -->
        <div class="flex flex-col items-center gap-8 max-w-3xl text-center w-full" in:scale={{ duration: 1000, start: 0.3, opacity: 0 }}>
          
          <!-- Epic Glowing Orb for Product -->
          <div class="relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center mb-6">
            <div class="absolute inset-0 bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 rounded-full animate-spin" style="animation-duration: 3s;"></div>
            <div class="absolute inset-2 bg-[#050510] rounded-full"></div>
            <div class="absolute inset-0 rounded-full shadow-[0_0_100px_rgba(168,85,247,0.8)] animate-pulse"></div>
            
            <span class="text-9xl relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:scale-110 transition-transform duration-500">
              {activeProduct.imageUrl}
            </span>
          </div>
          
          <h2 class="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-emerald-400 to-cyan-500 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)] uppercase tracking-tighter leading-tight">
            {activeProduct.name}
          </h2>
          
          <div class="mt-4 px-8 py-4 bg-emerald-900/30 border-2 border-emerald-500/50 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-sm">
            <p class="text-2xl md:text-3xl font-mono text-emerald-400 font-bold uppercase tracking-widest">
              Flex-Faktor: <span class="text-white">+{Math.floor(Math.random() * 800 + 200)}%</span> 🚀
            </p>
          </div>
          
          <button 
            onclick={closeUnboxing}
            class="mt-12 px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-700 hover:border-emerald-500 rounded-2xl uppercase font-black tracking-widest transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] cursor-pointer text-lg hover:text-emerald-400"
          >
            Dopamin eingesackt (Schließen)
          </button>
        </div>
      {/if}
      
    </div>
  {/if}
</div>

<style>
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
</style>
