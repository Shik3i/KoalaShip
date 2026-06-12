<script lang="ts">
  import { orders, getProducts, openPackage, returnOrder, user, manualTrackingRefresh, carriers } from '../lib/store.svelte';
  import { t } from '../lib/i18n.svelte';
  import { pickDeterministic, pickRandom, unboxingSteps as unboxingPool, refreshTexts } from '../lib/content';

  // Unboxing Sequence State (Local to History)
  let activeUnboxingOrderId = $state<string | null>(null);
  let unboxingClicks = $state(0);
  let isShaking = $state(false);
  let returnOrderId = $state<string | null>(null);
  let returnPosition = $state(0);
  let returnDirection = 1;
  let returnTimer: number | null = null;
  let unboxingSteps = $derived.by(() => {
    if (!activeUnboxingOrderId) return ['Paket öffnen'];
    const activeOrder = orders.find(o => o.id === activeUnboxingOrderId);
    const activeProduct = getProducts().find(p => p.id === (activeOrder?.revealedProductId || activeOrder?.productId));
    if (!activeProduct) return ['Paket öffnen'];
    
    if (activeProduct.category === 'MYSTERY') {
       return pickDeterministic(unboxingPool.MYSTERY, activeOrder!.id);
    }
    if (activeProduct.inventoryType === 'VEHICLE') {
       return pickDeterministic(unboxingPool.VEHICLE, activeOrder!.id);
    }
    if (activeProduct.inventoryType === 'OUTFIT' || activeProduct.inventoryType === 'COLLECTIBLE') {
       return pickDeterministic(unboxingPool.OUTFIT, activeOrder!.id);
    }
    if (activeProduct.inventoryType === 'ELECTRONICS') {
       return pickDeterministic(unboxingPool.ELECTRONICS, activeOrder!.id);
    }
    return pickDeterministic(unboxingPool.DEFAULT, activeOrder!.id);
  });

  let packageVisual = $derived.by(() => {
    if (!activeUnboxingOrderId) return { icon: '📦', bg: 'bg-[#c08d5d]', border: 'border-[#a06f42]', tape: true };
    const activeOrder = orders.find(o => o.id === activeUnboxingOrderId);
    const activeProduct = getProducts().find(p => p.id === (activeOrder?.revealedProductId || activeOrder?.productId));
    if (!activeProduct) return { icon: '📦', bg: 'bg-[#c08d5d]', border: 'border-[#a06f42]', tape: true };
    
    if (activeProduct.category === 'MYSTERY') return { icon: '❓', bg: 'bg-slate-900', border: 'border-rose-900', tape: false };
    if (activeProduct.inventoryType === 'VEHICLE') return { icon: '🏗️', bg: 'bg-yellow-200', border: 'border-yellow-400', tape: true };
    if (activeProduct.inventoryType === 'OUTFIT' || activeProduct.inventoryType === 'COLLECTIBLE') return { icon: '✉️', bg: 'bg-orange-100', border: 'border-orange-300', tape: false };
    if (activeProduct.inventoryType === 'ELECTRONICS') return { icon: '⬛', bg: 'bg-slate-800', border: 'border-slate-700', tape: false };
    return { icon: '📦', bg: 'bg-[#c08d5d]', border: 'border-[#a06f42]', tape: true };
  });

  let refreshingOrderId = $state<string | null>(null);

  async function handleRefresh(orderId: string) {
      if (refreshingOrderId) return;
      refreshingOrderId = orderId;
      await manualTrackingRefresh(orderId);
      refreshingOrderId = null;
  }

  function downloadDocument(orderId: string, type: 'invoice' | 'delivery') {
    const order = orders.find(item => item.id === orderId);
    const product = getProducts().find(item => item.id === (order?.revealedProductId || order?.productId));
    if (!order || !product) return;
    const title = type === 'invoice' ? 'Rechnung' : 'Lieferschein';
    const lines = [
      `KOALASHIP ${title.toUpperCase()}`,
      `Dokument: ${order.invoiceNumber ?? order.id}`,
      `Datum: ${new Date(order.orderDate).toLocaleString('de-DE')}`,
      `Kunde: ${user.name ?? 'KoalaShip Kunde'}`,
      '',
      `Produkt: ${product.name}`,
      `Variante: ${order.variant ?? 'Standard'}`,
      `Menge: ${order.quantity ?? 1}`,
      type === 'invoice' ? `Einzelpreis: ${(order.unitPrice ?? product.price).toLocaleString('de-DE')} KC` : '',
      type === 'invoice' ? `Gesamt: ${(order.totalPrice ?? product.price).toLocaleString('de-DE')} KC` : '',
      type === 'invoice' && order.discountCode ? `Rabatt: ${order.discountCode} (-${order.discountAmount ?? 0} KC)` : '',
      `Lieferart: ${order.deliveryMethod ?? (order.isExpress ? 'EXPRESS' : 'STANDARD')}`,
      `Lieferziel: ${order.deliveryLabel ?? user.deliveryNote ?? 'Simulierter Lieferpunkt'}`,
      '',
      'Dies ist ein rein fiktives Dokument. Es fand keine echte Bestellung oder Zahlung statt.'
    ].filter(Boolean).join('\n');
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `KoalaShip-${title}-${order.invoiceNumber ?? order.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function startReturn(orderId: string) {
    returnOrderId = orderId;
    returnPosition = 0;
    returnTimer = window.setInterval(() => {
      returnPosition += returnDirection * 4;
      if (returnPosition >= 100 || returnPosition <= 0) returnDirection *= -1;
    }, 30);
  }

  function finishReturn() {
    if (!returnOrderId) return;
    if (returnTimer) clearInterval(returnTimer);
    const score = Math.max(0, 100 - Math.abs(50 - returnPosition) * 2);
    returnOrder(returnOrderId, score);
    returnOrderId = null;
  }

  function initiateUnboxing(orderId: string) {
    activeUnboxingOrderId = orderId;
    unboxingClicks = 0;
    isShaking = false;
  }

  function handleBoxClick() {
    if (unboxingClicks >= unboxingSteps.length) return;
    unboxingClicks++;
    
    isShaking = false;
    setTimeout(() => {
      isShaking = true;
      setTimeout(() => {
        isShaking = false;
        if (unboxingClicks === unboxingSteps.length && activeUnboxingOrderId) {
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
        {@const carrier = carriers.find(c => c.id === order.carrierId) ?? carriers[0]}
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden transition-all duration-500 shadow-sm
          {order.status === 'DELIVERED' ? 'border-yellow-400 dark:border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.1)] bg-yellow-50/50 dark:bg-yellow-900/10' : ''}
          {order.status === 'OPENED' ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50' : ''}
        ">
          <!-- Status Indicator Line -->
          <div class="absolute left-0 top-0 bottom-0 w-1.5
            {order.status === 'TRANSIT' ? 'bg-slate-400' : ''}
            {order.status === 'LOCAL_SORTING' ? 'bg-orange-500' : ''}
            {order.status === 'OUT_FOR_DELIVERY' ? 'bg-indigo-500' : ''}
            {order.status === 'DELIVERED' ? 'bg-yellow-400' : ''}
            {order.status === 'OPENED' ? 'bg-emerald-500' : ''}
          "></div>

          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 pl-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-3xl shadow-inner">
                 {getProducts().find(p => p.id === order.productId)?.imageUrl}
              </div>
              <div>
                <h4 class="font-black text-slate-900 dark:text-white text-xl mb-1">{getProducts().find(p => p.id === order.productId)?.name}</h4>
                <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                  <span>ID: {order.id.split('-')[0]}</span>
                  {#if order.isExpress}
                    <span class="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">EXPRESS</span>
                  {/if}
                  <span>{order.quantity ?? 1}× · {order.variant ?? 'Standard'}</span>
                </div>
                <div class="mt-2 flex items-center gap-2">
                  <span class="text-xs font-bold px-2 py-1 rounded-md" style="background-color: {carrier.color}20; color: {carrier.color}">
                     {carrier.logo} {carrier.name}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <span class="font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-lg
                {order.status === 'TRANSIT' ? 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' : ''}
                {order.status === 'LOCAL_SORTING' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                {order.status === 'OUT_FOR_DELIVERY' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}
                {order.status === 'DELIVERED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                {order.status === 'OPENED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
              ">
                {order.status}
              </span>
            </div>
          </div>

          <div class="ml-4 mt-4 flex flex-wrap gap-2 items-center">
            <button onclick={() => downloadDocument(order.id, 'invoice')} class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800">Rechnung herunterladen</button>
            <button onclick={() => downloadDocument(order.id, 'delivery')} class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800">Lieferschein herunterladen</button>
            <span class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 dark:bg-slate-900">{order.deliveryLabel ?? 'Standardzustellung'}</span>
            
            {#if !['DELIVERED', 'OPENED'].includes(order.status)}
               <button 
                  onclick={() => handleRefresh(order.id)} 
                  disabled={refreshingOrderId === order.id}
                  class="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait transition-colors"
               >
                  {#if refreshingOrderId === order.id}
                     <span class="animate-spin inline-block">↻</span> <span class="hidden sm:inline">{pickRandom(refreshTexts)}</span>
                  {:else}
                     <span>🔄</span> <span class="hidden sm:inline">Tracking aktualisieren</span>
                  {/if}
               </button>
               <span class="text-xs text-slate-400 font-medium ml-auto">Letztes Update: {new Date(order.lastTrackingUpdate ?? order.orderDate).toLocaleTimeString('de-DE')}</span>
            {/if}
          </div>
          {#if order.status === 'OUT_FOR_DELIVERY'}
            <div class="ml-4 mt-4 grid gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-100 sm:grid-cols-3">
              <div><small class="font-bold uppercase">Zeitfenster</small><strong class="block">{new Date(order.deliveryEta - 30 * 60 * 1000).toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'})}–{new Date(order.deliveryEta + 30 * 60 * 1000).toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'})}</strong></div>
              <div><small class="font-bold uppercase">Vor dir</small><strong class="block">{order.estimatedStops === 0 ? 'Kurier in der Nähe' : `ca. ${order.estimatedStops ?? 12} Stopps`}</strong></div>
              <div><small class="font-bold uppercase">Aktualisiert</small><strong class="block">{new Date(order.lastTrackingUpdate ?? Date.now()).toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'})}</strong></div>
            </div>
          {/if}

          <!-- Protokoll -->
          <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-sm space-y-3 border border-slate-100 dark:border-slate-800 shadow-inner ml-4">
            {#each order.trackingSteps as step}
              <div class="flex gap-4 items-start">
                <span 
                    class="text-indigo-500 dark:text-indigo-400 shrink-0 font-mono font-bold text-xs opacity-70 cursor-help"
                    title={new Date(step.timestamp).toLocaleString('de-DE')}
                >
                    [{new Date(step.timestamp).toLocaleTimeString()}]
                </span>
                <span class="text-slate-700 dark:text-slate-300 font-medium {step.message.includes('DOPAMIN') ? 'text-emerald-600 dark:text-emerald-400 font-black' : ''}">
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
          {#if order.status === 'OPENED' && !user.returnedOrderIds?.includes(order.id)}
            <button onclick={() => startReturn(order.id)} class="mt-4 ml-4 rounded-xl bg-slate-200 px-5 py-3 font-bold dark:bg-slate-700">Retoure starten</button>
          {:else if user.returnedOrderIds?.includes(order.id)}
            <span class="ml-4 mt-4 inline-block rounded-lg bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700">RETOURNIERT</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- UNBOXING MODAL (Fullscreen) -->
{#if activeUnboxingOrderId}
  {@const activeOrder = orders.find(o => o.id === activeUnboxingOrderId)}
  {@const activeProduct = getProducts().find(p => p.id === (activeOrder?.revealedProductId || activeOrder?.productId))}
  
  <div 
    class="fixed inset-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6" 
  >
    
    {#if unboxingClicks < unboxingSteps.length}
      <div class="flex flex-col items-center gap-12">
        <h2 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-widest text-center drop-shadow-md">
          Paket auspacken <br/><span class="text-2xl text-slate-500 mt-4 block">{unboxingSteps[unboxingClicks]}</span>
        </h2>
        
        <button 
          onclick={handleBoxClick}
          class="relative w-64 h-64 md:w-80 md:h-80 {packageVisual.bg} border-[12px] {packageVisual.border} rounded-3xl shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group {isShaking ? 'motion-safe:animate-[shake_0.2s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}"
          style={isShaking ? 'animation-name: shake;' : ''}
        >
          {#if packageVisual.tape}
            <div class="absolute w-full h-16 bg-white/20 top-1/2 -translate-y-1/2 shadow-inner mix-blend-overlay"></div>
            <div class="absolute w-16 h-full bg-white/20 left-1/2 -translate-x-1/2 shadow-inner mix-blend-overlay"></div>
          {/if}
          <span class="text-8xl md:text-9xl group-hover:scale-110 transition-transform z-10 drop-shadow-xl">{packageVisual.icon}</span>
        </button>
        <div class="flex flex-col items-center gap-4">
          <div class="flex flex-wrap justify-center gap-2">{#each unboxingSteps as step, index}<span class="rounded-full px-3 py-1 text-xs font-bold {index < unboxingClicks ? 'bg-emerald-100 text-emerald-700' : index === unboxingClicks ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}">{index + 1}. {step}</span>{/each}</div>
          <button onclick={() => { unboxingClicks = unboxingSteps.length; if (activeUnboxingOrderId) openPackage(activeUnboxingOrderId); }} class="text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sofort öffnen (Überspringen)</button>
        </div>
      </div>
      
    {:else if activeProduct}
      <div class="flex flex-col items-center gap-8 max-w-3xl text-center w-full">
        <div class="confetti" aria-hidden="true">
          {#each Array(36) as _, index}
            <i style={`--i:${index}`}></i>
          {/each}
        </div>
        
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
        <div class="grid w-full gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-3"><div><small class="font-bold text-slate-500">Variante</small><strong class="block">{activeOrder?.variant ?? 'Standard'}</strong></div><div><small class="font-bold text-slate-500">Lieferumfang</small><strong class="block">Produkt, Zubehör, Unterlagen</strong></div><div><small class="font-bold text-slate-500">Inventar</small><strong class="block">{activeProduct.inventoryType ?? 'Sammlung'}</strong></div></div>
        
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

{#if returnOrderId}
  <div class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4">
    <div class="w-full max-w-lg rounded-3xl bg-white p-8 text-center dark:bg-slate-800">
      <h2 class="text-3xl font-black">Retouren-Scanner</h2>
      <p class="mb-6 text-slate-500">Stoppe den Marker möglichst nah an der Mitte. Je besser der Treffer, desto höher die Erstattung.</p>
      <div class="relative h-12 rounded-full bg-gradient-to-r from-rose-400 via-emerald-400 to-rose-400">
        <div class="absolute top-0 h-12 w-2 bg-slate-950" style={`left:${returnPosition}%`}></div>
      </div>
      <button onclick={finishReturn} class="mt-8 w-full rounded-xl bg-indigo-600 py-4 font-black text-white">JETZT STOPPEN</button>
    </div>
  </div>
{/if}
