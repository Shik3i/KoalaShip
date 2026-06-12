<script lang="ts">
  import {
    products, user, properties, getOwnedProductIds, buyProperty, setActiveProperty,
    togglePropertyDecor, toggleOutfit, setFeaturedVehicle, toggleFeaturedElectronics
  } from '../lib/store.svelte';
  import type { InventoryType } from '../lib/types';

  let tab = $state<'HOME' | InventoryType>('HOME');
  let ownedIds = $derived([...new Set(getOwnedProductIds())]);
  let ownedProducts = $derived(ownedIds.map(id => products.find(product => product.id === id)).filter(Boolean));
  let activeProperty = $derived(properties.find(property => property.id === user.activePropertyId) ?? properties[0]);
  let activeDecor = $derived(user.propertyDecor?.[activeProperty.id] ?? []);

  function productsOf(type: InventoryType) {
    return ownedProducts.filter(product => product?.inventoryType === type);
  }
</script>

<div class="space-y-7">
  <header>
    <p class="text-xs font-black uppercase tracking-[.25em] text-indigo-500">Mein Besitz</p>
    <h2 class="text-3xl font-black text-slate-900 dark:text-white">Koala-Living & Inventar</h2>
    <p class="text-slate-500">Richte Immobilien ein, baue Looks und stelle deine liebsten Käufe aus.</p>
  </header>

  <nav class="flex gap-2 overflow-x-auto pb-2">
    {#each [{id:'HOME',label:'Immobilien'},{id:'OUTFIT',label:'Outfits'},{id:'VEHICLE',label:'Garage'},{id:'ELECTRONICS',label:'Elektronik'},{id:'DECOR',label:'Deko'},{id:'COLLECTIBLE',label:'Sammlung'}] as item}
      <button onclick={() => tab = item.id as typeof tab} class="whitespace-nowrap rounded-full px-5 py-3 font-black {tab === item.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800'}">{item.label}</button>
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
              {@const product = products.find(entry => entry.id === productId)}
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

    <section><h3 class="mb-3 text-xl font-black">Verfügbare Einrichtung</h3><div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{#each productsOf('DECOR') as product}{#if product}<button onclick={() => togglePropertyDecor(product.id)} class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"><span class="block text-5xl">{product.imageUrl}</span><b class="mt-2 block text-sm">{product.name}</b><small class={activeDecor.includes(product.id) ? 'text-emerald-500' : 'text-slate-500'}>{activeDecor.includes(product.id) ? 'Aufgestellt' : 'Aufstellen'}</small></button>{/if}{/each}</div></section>
  {:else if tab === 'OUTFIT'}
    <section class="grid gap-5 md:grid-cols-[.7fr_1.3fr]">
      <div class="flex min-h-96 flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-indigo-100 to-fuchsia-100 p-8 dark:from-indigo-950 dark:to-fuchsia-950"><div class="text-9xl">🐨</div><div class="mt-5 flex flex-wrap justify-center gap-3">{#each user.equippedOutfit ?? [] as id}{@const product = products.find(p => p.id === id)}{#if product}<span class="rounded-full bg-white px-4 py-2 text-2xl shadow dark:bg-slate-800">{product.imageUrl} <small class="text-sm font-bold">{product.name}</small></span>{/if}{/each}</div><p class="mt-5 font-black">{user.name}s aktueller Look</p></div>
      <div><h3 class="mb-3 text-xl font-black">Kleiderschrank</h3><div class="grid grid-cols-2 gap-3 sm:grid-cols-3">{#each productsOf('OUTFIT') as product}{#if product}<button onclick={() => toggleOutfit(product.id)} class="rounded-2xl border p-5 {user.equippedOutfit?.includes(product.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'}"><span class="text-6xl">{product.imageUrl}</span><b class="mt-2 block">{product.name}</b><small>{user.equippedOutfit?.includes(product.id) ? 'Ausziehen' : 'Anziehen'}</small></button>{/if}{/each}</div></div>
    </section>
  {:else if tab === 'VEHICLE'}
    <section class="rounded-3xl bg-gradient-to-b from-slate-700 to-slate-950 p-8 text-white"><h3 class="text-2xl font-black">Traumgarage</h3><div class="my-10 flex min-h-52 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-9xl">{products.find(p => p.id === user.featuredVehicleId)?.imageUrl ?? '🚗'}</div><div class="grid gap-3 sm:grid-cols-3">{#each productsOf('VEHICLE') as product}{#if product}<button onclick={() => setFeaturedVehicle(product.id)} class="rounded-2xl border p-4 {user.featuredVehicleId === product.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/20'}"><span class="text-5xl">{product.imageUrl}</span><b class="block">{product.name}</b><small>{user.featuredVehicleId === product.id ? 'Präsentiert' : 'In die Mitte stellen'}</small></button>{/if}{/each}</div></section>
  {:else if tab === 'ELECTRONICS'}
    <section class="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div class="min-h-96 rounded-3xl bg-gradient-to-b from-slate-800 to-black p-8 text-white"><h3 class="text-2xl font-black">Mein Setup</h3><div class="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3">{#each user.featuredElectronics ?? [] as id}{@const product = products.find(p => p.id === id)}{#if product}<button onclick={() => toggleFeaturedElectronics(product.id)} class="aspect-square rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-6xl shadow-[0_0_30px_rgba(34,211,238,.12)]">{product.imageUrl}<small class="mt-2 block text-xs font-bold">{product.name}</small></button>{/if}{/each}</div></div><div><h3 class="mb-3 text-xl font-black">Technik-Regal</h3><div class="space-y-3">{#each productsOf('ELECTRONICS') as product}{#if product}<button onclick={() => toggleFeaturedElectronics(product.id)} class="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left dark:border-slate-700 dark:bg-slate-800"><span class="text-4xl">{product.imageUrl}</span><span><b class="block">{product.name}</b><small>{user.featuredElectronics?.includes(product.id) ? 'Im Setup' : 'Zum Setup hinzufügen'}</small></span></button>{/if}{/each}</div></div></section>
  {:else}
    <section><h3 class="mb-4 text-2xl font-black">{tab === 'DECOR' ? 'Deko-Inventar' : 'Sammlung'}</h3><div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{#each productsOf(tab) as product}{#if product}<article class="rounded-3xl border border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-800"><span class="text-6xl">{product.imageUrl}</span><h4 class="mt-3 font-black">{product.name}</h4><p class="text-xs text-slate-500">{product.brand}</p></article>{/if}{/each}</div></section>
  {/if}

  {#if ownedProducts.length === 0}<p class="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">Öffne gelieferte Pakete, damit Produkte im Inventar erscheinen.</p>{/if}
</div>
