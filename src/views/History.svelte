<script lang="ts">
  import { orders, products, openPackage } from '../lib/store.svelte';
  
  // Unboxing Sequence State (Local to History)
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
</script>

<div class="space-y-6">
  <div class="flex items-center gap-4">
    <h2 class="text-2xl font-black uppercase tracking-widest text-slate-200">Bestellhistorie</h2>
    <div class="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
  </div>

  {#if orders.length === 0}
    <div class="p-12 text-center bg-[#101025] border border-slate-800 border-dashed rounded-2xl text-slate-500 font-mono shadow-inner">
      <p class="text-lg">Keine Bestellungen vorhanden.</p>
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
</div>

<!-- UNBOXING MODAL (Fullscreen) -->
{#if activeUnboxingOrderId}
  {@const activeOrder = orders.find(o => o.id === activeUnboxingOrderId)}
  {@const activeProduct = products.find(p => p.id === activeOrder?.productId)}
  
  <div 
    class="fixed inset-0 z-[100] bg-[#050510]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6" 
  >
    
    {#if unboxingClicks < 3}
      <div class="flex flex-col items-center gap-12">
        <h2 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] uppercase tracking-widest text-center">
          Smash to Open! <br/><span class="text-2xl text-white mt-4 block opacity-80">({unboxingClicks}/3 Hits)</span>
        </h2>
        
        <button 
          onclick={handleBoxClick}
          class="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#8B5A2B] to-[#654321] border-8 border-[#3d2711] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group {isShaking ? 'animate-[shake_0.2s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}"
          style={isShaking ? 'animation-name: shake;' : ''}
        >
          <div class="absolute w-full h-16 bg-[#C19A6B]/90 top-1/2 -translate-y-1/2 shadow-inner mix-blend-overlay"></div>
          <div class="absolute w-16 h-full bg-[#C19A6B]/90 left-1/2 -translate-x-1/2 shadow-inner mix-blend-overlay"></div>
          <span class="text-8xl md:text-9xl group-hover:scale-110 transition-transform z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">📦</span>
          <div class="absolute inset-0 bg-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
        </button>
      </div>
      
    {:else if activeProduct}
      <div class="flex flex-col items-center gap-8 max-w-3xl text-center w-full">
        
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
