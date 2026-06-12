<script lang="ts">
  import {
    getProducts, user, properties, orders, buyProperty, setActiveProperty,
    togglePropertyDecor, toggleFavoriteOrder
  } from '../lib/store.svelte';
  import type { InventoryType } from '../lib/types';

  let tab = $state<'HOME' | 'ALL' | 'UNOPENED' | 'RECENT' | 'FAVORITES'>('HOME');
  let inventoryTypeFilter = $state<InventoryType | 'ALL'>('ALL');
  
  let activeProperty = $derived(properties.find(property => property.id === user.activePropertyId) ?? properties[0]);
  let activeDecor = $derived(user.propertyDecor?.[activeProperty.id] ?? []);

  // Compute all purchases (orders that are DELIVERED or OPENED)
  let purchasedOrders = $derived(orders.filter(o => o.status === 'DELIVERED' || o.status === 'OPENED').sort((a, b) => b.orderDate - a.orderDate));
  
  let filteredOrders = $derived.by(() => {
    let result = purchasedOrders;
    
    if (tab === 'UNOPENED') result = result.filter(o => o.status === 'DELIVERED');
    if (tab === 'RECENT') result = result.filter(o => Date.now() - o.orderDate < 7 * 24 * 60 * 60 * 1000);
    if (tab === 'FAVORITES') result = result.filter(o => user.favoriteOrderIds?.includes(o.id));
    
    if (inventoryTypeFilter !== 'ALL') {
      result = result.filter(o => {
        const product = getProducts().find(p => p.id === (o.revealedProductId || o.productId));
        return product?.inventoryType === inventoryTypeFilter;
      });
    }
    
    return result;
  });
</script>

<div class="space-y-7">
  <header>
    <p class="text-xs font-black uppercase tracking-[.25em] text-indigo-500">Meine Sammlung</p>
    <h2 class="text-3xl font-black text-slate-900 dark:text-white">Immobilien & Kaufhistorie</h2>
    <p class="text-slate-500">Stelle deine Immobilien zur Schau und verwalte deine gekauften Errungenschaften.</p>
  </header>

  <nav class="flex gap-2 overflow-x-auto pb-2">
    {#each [{id:'HOME',label:'🏠 Showcase'},{id:'ALL',label:'Alle Käufe'},{id:'UNOPENED',label:'📦 Ungeöffnet'},{id:'RECENT',label:'🕒 Neu'},{id:'FAVORITES',label:'❤️ Favoriten'}] as item}
      <button onclick={() => tab = item.id as typeof tab} class="whitespace-nowrap rounded-full px-5 py-3 font-black transition-colors {tab === item.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'}">{item.label}</button>
    {/each}
  </nav>

  {#if tab === 'HOME'}
    <section class="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div class="relative min-h-[32rem] p-8 {activeProperty.style === 'loft' ? 'bg-gradient-to-b from-sky-300 via-slate-100 to-amber-200' : activeProperty.style === 'nature' ? 'bg-gradient-to-b from-emerald-200 via-lime-50 to-amber-200' : activeProperty.style === 'luxury' ? 'bg-gradient-to-b from-purple-200 via-stone-50 to-yellow-200' : 'bg-gradient-to-b from-sky-200 via-white to-orange-100'}">
          <div class="absolute inset-x-0 bottom-0 h-1/3 bg-amber-900/15"></div>
          <div class="relative flex items-start justify-between"><div><span class="text-5xl">{activeProperty.image}</span><h3 class="text-2xl font-black text-slate-900">{activeProperty.name}</h3><p class="text-slate-600">{activeDecor.length}/{activeProperty.slots} Plätze belegt</p></div><span class="rounded-full bg-white/80 px-3 py-2 text-xs font-black text-slate-700">AKTIV</span></div>
          <div class="relative mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {#each activeDecor as productId}
              {@const product = getProducts().find(entry => entry.id === productId)}
              {#if product}<button onclick={() => togglePropertyDecor(product.id)} class="flex aspect-square flex-col items-center justify-center rounded-3xl bg-white/75 p-3 text-6xl shadow-lg backdrop-blur transition hover:-translate-y-1"><span>{product.imageUrl}</span><small class="mt-2 text-center font-black text-slate-700">{product.name}</small></button>{/if}
            {/each}
          </div>
        </div>
      </div>

      <aside class="space-y-3">
        <h3 class="text-xl font-black">Meine Immobilien</h3>
        {#each properties as property}
          {@const owned = user.ownedPropertyIds?.includes(property.id)}
          <article class="rounded-2xl border p-4 {user.activePropertyId === property.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'}">
            <div class="flex gap-3"><span class="text-4xl">{property.image}</span><div><h4 class="font-black">{property.name}</h4><p class="text-sm text-slate-500">{property.description}</p><p class="mt-1 font-bold">{property.price.toLocaleString('de-DE')} KC · {property.slots} Plätze</p></div></div>
            {#if owned}<button onclick={() => setActiveProperty(property.id)} class="mt-3 w-full rounded-xl bg-slate-900 py-2 font-bold text-white dark:bg-white dark:text-slate-900">{user.activePropertyId === property.id ? 'Aktiv' : 'Auswählen'}</button>{:else}<button onclick={() => buyProperty(property.id)} class="mt-3 w-full rounded-xl bg-yellow-400 py-2 font-black text-slate-950">Immobilie kaufen</button>{/if}
          </article>
        {/each}
      </aside>
    </section>
  {:else}
    <div class="flex items-center justify-between">
       <h3 class="text-xl font-black">{filteredOrders.length} {filteredOrders.length === 1 ? 'Kauf' : 'Käufe'} in dieser Ansicht</h3>
       <select bind:value={inventoryTypeFilter} class="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800">
         <option value="ALL">Alle Kategorien</option>
         <option value="VEHICLE">Fahrzeuge</option>
         <option value="ELECTRONICS">Elektronik</option>
         <option value="OUTFIT">Outfits</option>
         <option value="DECOR">Deko</option>
         <option value="COLLECTIBLE">Sammlung</option>
       </select>
    </div>

    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {#each filteredOrders as order}
        {@const product = getProducts().find(p => p.id === (order.revealedProductId || order.productId))}
        {#if product}
          <article class="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
            {#if order.status === 'DELIVERED'}
               <div class="absolute right-0 top-0 rounded-bl-xl bg-indigo-600 px-3 py-1 text-xs font-black text-white shadow-sm z-10">Ungeöffnet</div>
            {/if}
            
            <div class="p-6">
              <div class="flex items-start justify-between">
                <span class="text-7xl drop-shadow-md">{product.imageUrl}</span>
                <button onclick={() => toggleFavoriteOrder(order.id)} class="text-3xl transition-transform hover:scale-110 active:scale-90 {user.favoriteOrderIds?.includes(order.id) ? 'text-rose-500' : 'text-slate-200 dark:text-slate-700 grayscale'}">
                   {user.favoriteOrderIds?.includes(order.id) ? '❤️' : '🤍'}
                </button>
              </div>
              <h4 class="mt-4 text-xl font-black text-slate-900 dark:text-white leading-tight">{product.name}</h4>
              <p class="text-sm font-bold text-slate-500">{order.variant ?? 'Standard'}</p>
            </div>
            
            <div class="bg-slate-50 p-4 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
              <ul class="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li class="flex justify-between"><span>Kaufdatum:</span> <span class="font-bold text-slate-900 dark:text-slate-200">{new Date(order.orderDate).toLocaleDateString('de-DE')}</span></li>
                <li class="flex justify-between"><span>Lieferart:</span> <span class="font-bold text-slate-900 dark:text-slate-200">{order.deliveryMethod ?? (order.isExpress ? 'EXPRESS' : 'STANDARD')}</span></li>
                {#if order.status === 'OPENED'}
                  <li class="flex justify-between"><span>Ausgestellt:</span> <span class="font-bold text-slate-900 dark:text-slate-200">{activeDecor.includes(product.id) ? 'Ja, in Immobilie' : 'Nein'}</span></li>
                {/if}
              </ul>
              {#if order.status === 'OPENED' && product.inventoryType === 'DECOR'}
                <button onclick={() => togglePropertyDecor(product.id)} class="mt-4 w-full rounded-xl py-2 text-sm font-black transition-colors {activeDecor.includes(product.id) ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}">
                  {activeDecor.includes(product.id) ? 'Aus Immobilie entfernen' : 'In Immobilie aufstellen'}
                </button>
              {/if}
            </div>
          </article>
        {/if}
      {/each}
      
      {#if filteredOrders.length === 0}
        <div class="col-span-full p-16 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
           <span class="text-4xl opacity-50 block mb-3">👻</span>
           <p class="text-slate-500 font-bold">In diesem Bereich gibt es noch nichts zu sehen.</p>
        </div>
      {/if}
    </section>
  {/if}
</div>
