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

<div class="min-h-screen flex flex-col bg-slate-950 text-slate-300 selection:bg-neon-purple selection:text-white">
  <!-- Header -->
  <header class="bg-slate-900 border-b border-neon-purple/30 sticky top-0 z-50 shadow-[0_0_15px_rgba(176,38,255,0.15)]">
    <div class="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green tracking-wider uppercase flex items-center gap-2 drop-shadow-[0_0_8px_rgba(176,38,255,0.3)]">
        <span class="text-3xl">🐨</span> KoalaShip
      </h1>
      <a href="https://github.com/Shik3i/KoalaShip.git" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-neon-green transition-colors duration-300">
        <img src="/icons/github.svg" alt="GitHub Repo" class="w-7 h-7 filter hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.6)] transition-all" />
      </a>
    </div>
  </header>

  <main class="flex-1 w-full max-w-5xl mx-auto p-6 flex flex-col gap-10">
    
    <!-- Dashboard / Profile -->
    <section class="space-y-4">
      <h2 class="text-xl font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Terminal / Profil</h2>
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden group">
        <!-- Decorative neon line -->
        <div class="absolute top-0 left-0 w-1 h-full bg-neon-green/70 shadow-[0_0_10px_#39ff14] group-hover:bg-neon-purple transition-colors duration-500"></div>
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="space-y-2 font-mono">
            <p class="text-slate-400 text-sm">System-Modus</p>
            <p class="text-lg font-bold {user.mode === 'DEMO' ? 'text-neon-purple' : 'text-cyber-gold'}">[{user.mode}]</p>
          </div>
          
          <div class="space-y-2 font-mono">
            <p class="text-slate-400 text-sm">Liquidität</p>
            <p class="text-3xl font-bold text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">
              {user.balance.toLocaleString('de-DE')} <span class="text-sm text-slate-500">DC</span>
            </p>
          </div>

          <div class="flex gap-4">
            <button 
              onclick={switchMode} 
              class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-md uppercase text-xs font-bold tracking-wider transition-all hover:border-neon-purple hover:shadow-[0_0_10px_rgba(176,38,255,0.2)]">
              Toggle Modus
            </button>
            <button 
              onclick={() => addFunds(1000)} 
              class="px-5 py-2.5 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple border border-neon-purple/50 rounded-md uppercase text-xs font-bold tracking-wider transition-all shadow-[0_0_10px_rgba(176,38,255,0.1)] hover:shadow-[0_0_15px_rgba(176,38,255,0.4)]">
              Inject Funds (+1k)
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Shop -->
    <section class="space-y-4">
      <h2 class="text-xl font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Darknet Market</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each products as product}
          <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-neon-purple/50 transition-all duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(176,38,255,0.15)] relative">
            <div class="h-40 bg-slate-800 overflow-hidden relative">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
              <img src={product.imageUrl} alt={product.name} class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" />
            </div>
            
            <div class="p-5 flex flex-col flex-1 z-20 -mt-8">
              <span class="text-xs font-mono font-bold tracking-widest px-2 py-1 bg-slate-950 text-slate-400 rounded w-max mb-3 border border-slate-800">{product.category}</span>
              <h3 class="text-lg font-bold text-white mb-2 leading-tight">{product.name}</h3>
              <p class="text-neon-green font-mono font-bold text-xl drop-shadow-[0_0_5px_rgba(57,255,20,0.3)] mb-6">{product.price} DC</p>
              
              <button 
                onclick={() => purchaseProduct(product.id)}
                disabled={user.balance < product.price}
                class="mt-auto w-full py-3 rounded-md uppercase text-sm font-bold tracking-wider transition-all duration-300
                  {user.balance >= product.price 
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/50 hover:bg-neon-green hover:text-slate-950 shadow-[0_0_10px_rgba(57,255,20,0.1)] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}"
              >
                {user.balance >= product.price ? 'Kaufen' : 'Insufficient Funds'}
              </button>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Orders -->
    <section class="space-y-4">
      <h2 class="text-xl font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Logistik-Feed</h2>
      {#if orders.length === 0}
        <div class="p-8 text-center bg-slate-900 border border-slate-800 border-dashed rounded-xl text-slate-500 font-mono">
          No active shipments found. Waiting for input...
        </div>
      {:else}
        <div class="flex flex-col gap-4">
          {#each [...orders].reverse() as order}
            <div class="bg-slate-900 border border-slate-800 rounded-lg p-5 relative overflow-hidden transition-all
              {order.status === 'DELIVERED' ? 'border-cyber-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.1)]' : ''}
              {order.status === 'OPENED' ? 'opacity-60 grayscale hover:grayscale-0' : ''}
            ">
              <!-- Left status indicator line -->
              <div class="absolute left-0 top-0 bottom-0 w-1
                {order.status === 'PROCESSING' ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : ''}
                {order.status === 'SHIPPED' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : ''}
                {order.status === 'DELIVERED' ? 'bg-cyber-gold shadow-[0_0_8px_#ffd700]' : ''}
                {order.status === 'OPENED' ? 'bg-neon-green' : ''}
              "></div>

              <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                  <h4 class="font-bold text-white text-lg">{products.find(p => p.id === order.productId)?.name}</h4>
                  <p class="text-xs text-slate-500 font-mono">ID: {order.id.split('-')[0]}</p>
                </div>
                
                <div class="flex items-center gap-3">
                  {#if order.status === 'PROCESSING' || order.status === 'SHIPPED'}
                    <span class="font-mono text-sm bg-slate-950 px-3 py-1 rounded text-red-400 border border-red-900/50 flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      ETA: {getRemainingSeconds(order.deliveryEta)}s
                    </span>
                  {/if}
                  
                  <span class="font-mono text-xs uppercase tracking-wider px-3 py-1 rounded-full border
                    {order.status === 'PROCESSING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : ''}
                    {order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : ''}
                    {order.status === 'DELIVERED' ? 'bg-cyber-gold/10 text-cyber-gold border-cyber-gold/30' : ''}
                    {order.status === 'OPENED' ? 'bg-neon-green/10 text-neon-green border-neon-green/30' : ''}
                  ">
                    {order.status}
                  </span>
                </div>
              </div>

              <!-- Tracking Log -->
              <div class="bg-slate-950 rounded p-3 font-mono text-xs space-y-2 border border-slate-800">
                {#each order.trackingSteps as step}
                  <div class="flex gap-3 items-start text-slate-400">
                    <span class="text-neon-purple shrink-0">[{new Date(step.timestamp).toLocaleTimeString()}]</span>
                    <span class="{step.message.includes('DOPAMIN') ? 'text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.5)] font-bold text-sm' : ''}">{step.message}</span>
                  </div>
                {/each}
              </div>

              {#if order.status === 'DELIVERED'}
                <button 
                  onclick={() => initiateUnboxing(order.id)}
                  class="mt-4 w-full py-3 bg-gradient-to-r from-cyber-gold/20 to-orange-500/20 hover:from-cyber-gold hover:to-orange-500 hover:text-slate-900 text-cyber-gold border border-cyber-gold/50 rounded-md font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                >
                  Initiate Unboxing Sequence 🎁
                </button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </main>

  <footer class="bg-slate-900 border-t border-slate-800 py-8 text-center mt-auto">
    <p class="text-slate-500 font-mono text-sm">
      KoalaShip OS v1.0 // <a href="https://github.com/Shik3i/KoalaShip.git" target="_blank" class="text-neon-purple hover:text-neon-green transition-colors">GitHub Repository</a>
    </p>
  </footer>

  <!-- UNBOXING MODAL -->
  {#if activeUnboxingOrderId}
    {@const activeOrder = orders.find(o => o.id === activeUnboxingOrderId)}
    {@const activeProduct = products.find(p => p.id === activeOrder?.productId)}
    <div class="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4" transition:fade={{ duration: 300 }}>
      
      {#if unboxingClicks < 3}
        <!-- The Box -->
        <div class="flex flex-col items-center gap-8">
          <h2 class="text-3xl font-bold text-cyber-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] uppercase tracking-widest">
            Klicke zum Öffnen! ({unboxingClicks}/3)
          </h2>
          
          <button 
            onclick={handleBoxClick}
            class="relative w-64 h-64 bg-[#8B5A2B] border-4 border-[#654321] rounded-lg shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group {isShaking ? 'animate-[shake_0.3s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}"
            style={isShaking ? 'animation-name: shake;' : ''}
          >
            <!-- Tape styling -->
            <div class="absolute w-full h-12 bg-[#C19A6B]/80 top-1/2 -translate-y-1/2 shadow-inner"></div>
            <div class="absolute w-12 h-full bg-[#C19A6B]/80 left-1/2 -translate-x-1/2 shadow-inner"></div>
            
            <span class="text-6xl group-hover:scale-110 transition-transform z-10 drop-shadow-md">📦</span>
          </button>
        </div>
      {:else if activeProduct}
        <!-- The Reveal -->
        <div class="flex flex-col items-center gap-6 max-w-2xl text-center" in:scale={{ duration: 800, start: 0.5, opacity: 0 }}>
          <div class="relative w-64 h-64 rounded-full bg-neon-purple/20 flex items-center justify-center shadow-[0_0_100px_rgba(176,38,255,0.6)] animate-pulse mb-4 border-2 border-neon-purple">
            <img src={activeProduct.imageUrl} alt={activeProduct.name} class="w-48 h-48 object-contain drop-shadow-[0_0_20px_rgba(57,255,20,0.8)] z-10" />
            <div class="absolute inset-0 bg-gradient-to-tr from-neon-green/20 to-neon-purple/20 rounded-full mix-blend-overlay"></div>
          </div>
          
          <h2 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-gold via-neon-green to-neon-purple drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] uppercase tracking-tighter">
            {activeProduct.name}
          </h2>
          
          <p class="text-xl font-mono text-neon-green font-bold bg-slate-900/80 px-6 py-2 rounded border border-neon-green/50 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
            Virtueller Flex-Faktor: +{Math.floor(Math.random() * 500 + 100)}% 🚀
          </p>
          
          <button 
            onclick={closeUnboxing}
            class="mt-10 px-10 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-600 hover:border-cyber-gold rounded-xl uppercase font-bold tracking-widest transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]"
          >
            Dopamin eingesackt (Schließen)
          </button>
        </div>
      {/if}
      
    </div>
  {/if}
</div>
