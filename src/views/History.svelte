<script lang="ts">
  import { orders, products, openPackage } from '../lib/store.svelte';
  import { t } from '../lib/i18n.svelte';
  
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
  <div class="flex items-center justify-between mb-8">
    <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('nav.history')}</h2>
  </div>

  {#if orders.length === 0}
    <div class="p-16 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl shadow-sm">
      <div class="text-5xl mb-4 opacity-50">📦</div>
      <p class="text-lg font-bold text-slate-500 dark:text-slate-400">Keine Bestellungen vorhanden.</p>
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      {#each [...orders].reverse() as order}
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden transition-all duration-500 shadow-sm
          {order.status === 'DELIVERED' ? 'border-yellow-400 dark:border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.1)] bg-yellow-50/50 dark:bg-yellow-900/10' : ''}
          {order.status === 'OPENED' ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50' : ''}
        ">
          <!-- Status Indicator Line -->
          <div class="absolute left-0 top-0 bottom-0 w-1.5
            {order.status === 'PROCESSING' ? 'bg-orange-500' : ''}
            {order.status === 'SHIPPED' ? 'bg-indigo-500' : ''}
            {order.status === 'DELIVERED' ? 'bg-yellow-400' : ''}
            {order.status === 'OPENED' ? 'bg-emerald-500' : ''}
          "></div>

          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 pl-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-3xl shadow-inner">
                 {products.find(p => p.id === order.productId)?.imageUrl}
              </div>
              <div>
                <h4 class="font-black text-slate-900 dark:text-white text-xl mb-1">{products.find(p => p.id === order.productId)?.name}</h4>
                <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                  <span>ID: {order.id.split('-')[0]}</span>
                  {#if order.isExpress}
                    <span class="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">EXPRESS</span>
                  {/if}
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <span class="font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-lg
                {order.status === 'PROCESSING' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                {order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}
                {order.status === 'DELIVERED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                {order.status === 'OPENED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
              ">
                {order.status}
              </span>
            </div>
          </div>

          <!-- Protokoll -->
          <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-sm space-y-3 border border-slate-100 dark:border-slate-800 shadow-inner ml-4">
            {#each order.trackingSteps as step}
              <div class="flex gap-4 items-start">
                <span class="text-indigo-500 dark:text-indigo-400 shrink-0 font-mono font-bold text-xs opacity-70">[{new Date(step.timestamp).toLocaleTimeString()}]</span>
                <span class="text-slate-700 dark:text-slate-300 font-medium {step.message.includes('DOPAMINE') ? 'text-emerald-600 dark:text-emerald-400 font-black' : ''}">
                  {step.message}
                </span>
              </div>
            {/each}
          </div>

          {#if order.status === 'DELIVERED'}
            <button 
              onclick={() => initiateUnboxing(order.id)}
              class="mt-6 ml-4 w-[calc(100%-1rem)] py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2"
            >
              <span>🎁</span> Paket öffnen
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
    class="fixed inset-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6" 
  >
    
    {#if unboxingClicks < 3}
      <div class="flex flex-col items-center gap-12">
        <h2 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-widest text-center drop-shadow-md">
          Zum Öffnen klicken! <br/><span class="text-2xl text-slate-500 mt-4 block">({unboxingClicks}/3 Hits)</span>
        </h2>
        
        <button 
          onclick={handleBoxClick}
          class="relative w-64 h-64 md:w-80 md:h-80 bg-[#c08d5d] border-[12px] border-[#a06f42] rounded-3xl shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group {isShaking ? 'animate-[shake_0.2s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}"
          style={isShaking ? 'animation-name: shake;' : ''}
        >
          <div class="absolute w-full h-16 bg-[#e0b080]/90 top-1/2 -translate-y-1/2 shadow-inner mix-blend-multiply"></div>
          <div class="absolute w-16 h-full bg-[#e0b080]/90 left-1/2 -translate-x-1/2 shadow-inner mix-blend-multiply"></div>
          <span class="text-8xl md:text-9xl group-hover:scale-110 transition-transform z-10 drop-shadow-xl">📦</span>
        </button>
      </div>
      
    {:else if activeProduct}
      <div class="flex flex-col items-center gap-8 max-w-3xl text-center w-full">
        
        <div class="relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center mb-6">
          <div class="absolute inset-0 bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-full animate-spin" style="animation-duration: 4s;"></div>
          <div class="absolute inset-2 bg-white dark:bg-slate-900 rounded-full"></div>
          <span class="text-9xl relative z-10 drop-shadow-2xl transform hover:scale-110 transition-transform duration-500">
            {activeProduct.imageUrl}
          </span>
        </div>
        
        <h2 class="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
          {activeProduct.name}
        </h2>
        
        <button 
          onclick={closeUnboxing}
          class="mt-12 px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl uppercase font-black tracking-widest transition-all duration-300 hover:shadow-xl cursor-pointer text-lg"
        >
          {t('common.close')}
        </button>
      </div>
    {/if}
    
  </div>
{/if}
