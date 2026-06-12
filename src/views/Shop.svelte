<script lang="ts">
  import {
    user, products, getProductPrice, getActiveShopEvent, addToCart, updateCartQuantity,
    getCartTotal, checkoutCart, toggleCompare, createDreamList, toggleDreamListProduct,
    getPriceHistory, validateDiscountCode
  } from '../lib/store.svelte';
  import type { DeliveryMethod, Product, ProductCategory } from '../lib/types';
  import CoinIcon from '../components/CoinIcon.svelte';

  let query = $state('');
  let category = $state<'ALL' | ProductCategory>('ALL');
  let sort = $state('recommended');
  let selectedProduct = $state<Product | null>(null);
  let selectedVariant = $state('Standard');
  let cartOpen = $state(false);
  let compareOpen = $state(false);
  let dreamsOpen = $state(false);
  let newDreamName = $state('');
  let deliveryMethod = $state<DeliveryMethod>('STANDARD');
  let discountCode = $state('');
  let reviewSort = $state<'helpful' | 'positive' | 'critical'>('helpful');
  const event = getActiveShopEvent();

  let filteredProducts = $derived(products
    .filter(product => category === 'ALL' || product.category === category)
    .filter(product => `${product.name} ${product.brand ?? ''} ${product.description ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'priceAsc') return getProductPrice(a) - getProductPrice(b);
      if (sort === 'priceDesc') return getProductPrice(b) - getProductPrice(a);
      if (sort === 'rating') return b.rating - a.rating;
      return Number(b.category === user.favoriteCategory) - Number(a.category === user.favoriteCategory);
    }));

  let comparedProducts = $derived(user.compareIds?.map(id => products.find(product => product.id === id)).filter(Boolean) as Product[]);
  let cartCount = $derived(user.cart?.reduce((sum, item) => sum + item.quantity, 0) ?? 0);

  function openProduct(product: Product) {
    selectedProduct = product;
    selectedVariant = product.variants?.[0]?.values[0] ?? 'Standard';
  }

  function addSelected() {
    if (!selectedProduct) return;
    addToCart(selectedProduct.id, selectedVariant);
    selectedProduct = null;
  }

  function finishCheckout() {
    if (checkoutCart(deliveryMethod, discountCode)) cartOpen = false;
  }

  function sortedReviews(product: Product) {
    if (reviewSort === 'positive') return [...product.reviews].sort((a, b) => b.rating - a.rating);
    if (reviewSort === 'critical') return [...product.reviews].sort((a, b) => a.rating - b.rating);
    return product.reviews;
  }

  function getSubtotal() {
    return (user.cart ?? []).reduce((sum, item) => {
      const product = products.find(entry => entry.id === item.productId);
      return sum + (product ? getProductPrice(product) * item.quantity : 0);
    }, 0);
  }

  function averagePrice(product: Product) {
    const history = getPriceHistory(product);
    return Math.round(history.reduce((sum, point) => sum + point.price, 0) / history.length);
  }

  function priceBarHeight(product: Product, price: number) {
    return Math.max(12, price / Math.max(...getPriceHistory(product).map(entry => entry.price)) * 100);
  }
</script>

<div class="space-y-6">
  <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p class="text-xs font-black uppercase tracking-[.25em] text-indigo-500">KoalaShip Marketplace</p>
      <h2 class="text-3xl font-black text-slate-900 dark:text-white">Finde Dinge, die du dir hier leisten kannst.</h2>
      <p class="text-slate-500">Alles fiktiv, alles lokal, keine Schulden.</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button onclick={() => dreamsOpen = true} class="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold dark:border-slate-700 dark:bg-slate-800">Traumlisten</button>
      <button onclick={() => compareOpen = true} class="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold dark:border-slate-700 dark:bg-slate-800">Vergleich ({user.compareIds?.length ?? 0})</button>
      <button onclick={() => cartOpen = true} class="rounded-xl bg-indigo-600 px-5 py-3 font-black text-white shadow-lg">Warenkorb ({cartCount})</button>
    </div>
  </section>

  <section class="rounded-3xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 p-5 text-white shadow-lg">
    <p class="text-xs font-black uppercase tracking-widest">Aktuelles Shop-Event</p>
    <h3 class="text-2xl font-black">{event.name}</h3>
    <p>{Math.round(event.discount * 100)}% auf {event.category}, ohne künstlichen Countdown.</p>
  </section>

  <section class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:grid-cols-[1fr_auto_auto]">
    <input bind:value={query} placeholder="Produkte, Marken oder Eigenschaften suchen..." class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
    <select bind:value={category} class="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold dark:border-slate-700 dark:bg-slate-900">
      <option value="ALL">Alle Kategorien</option><option value="EVERYDAY">Alltag</option><option value="LUXURY">Luxus</option><option value="ABSURD">Absurd</option><option value="MYSTERY">Mystery</option>
    </select>
    <select bind:value={sort} class="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold dark:border-slate-700 dark:bg-slate-900">
      <option value="recommended">Empfohlen</option><option value="priceAsc">Preis aufsteigend</option><option value="priceDesc">Preis absteigend</option><option value="rating">Beste Bewertung</option>
    </select>
  </section>

  <p class="text-sm font-bold text-slate-500">{filteredProducts.length} Produkte gefunden</p>
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each filteredProducts as product}
      <article class="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <button onclick={() => openProduct(product)} class="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-8xl dark:bg-slate-900" aria-label={`${product.name} öffnen`}>
          <span role="img" aria-label={product.name}>{product.imageUrl}</span>
          <span class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-indigo-700">{product.brand ?? product.category}</span>
          <span class="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-2 py-1 text-xs font-bold text-white">★ {product.rating}</span>
        </button>
        <div class="flex-1">
          <p class="text-xs font-black uppercase tracking-widest text-indigo-500">{product.inventoryType ?? product.category}</p>
          <button onclick={() => openProduct(product)} class="text-left"><h3 class="mt-1 text-lg font-black text-slate-900 dark:text-white">{product.name}</h3></button>
          <p class="mt-2 line-clamp-2 text-sm text-slate-500">{product.description ?? 'Ein bemerkenswertes Produkt aus dem KoalaShip-Sortiment.'}</p>
        </div>
        <div class="mt-5 flex items-center justify-between">
          <span class="flex items-center gap-2 text-xl font-black"><CoinIcon class="h-5 w-5" />{getProductPrice(product).toLocaleString('de-DE')}</span>
          <span class="text-xs font-bold text-emerald-600">{product.stock ?? 20} verfügbar</span>
        </div>
        <div class="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button onclick={() => addToCart(product.id, product.variants?.[0]?.values[0] ?? 'Standard')} class="rounded-xl bg-yellow-400 px-3 py-3 font-black text-slate-950 hover:bg-yellow-300">In den Warenkorb</button>
          <button onclick={() => toggleCompare(product.id)} class="rounded-xl border border-slate-200 px-4 font-black dark:border-slate-700" aria-label="Vergleichen">{user.compareIds?.includes(product.id) ? '✓' : '⇄'}</button>
        </div>
      </article>
    {/each}
  </div>
</div>

{#if selectedProduct}
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
    <div class="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-850 dark:bg-slate-800 md:p-8">
      <div class="flex justify-between gap-4"><div><p class="font-black uppercase tracking-widest text-indigo-500">{selectedProduct.brand}</p><h2 class="text-3xl font-black">{selectedProduct.name}</h2></div><button onclick={() => selectedProduct = null} class="h-11 w-11 rounded-full bg-slate-100 text-xl dark:bg-slate-700">×</button></div>
      <div class="mt-6 grid gap-8 md:grid-cols-2">
        <div class="flex min-h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-indigo-100 text-9xl dark:from-slate-900 dark:to-indigo-950">{selectedProduct.imageUrl}</div>
        <div class="space-y-5">
          <div><span class="text-yellow-500">★★★★★</span> <span class="font-bold">{selectedProduct.rating} · {selectedProduct.reviews.length} Bewertungen</span></div>
          <p class="text-lg leading-relaxed text-slate-600 dark:text-slate-300">{selectedProduct.description}</p>
          {#if selectedProduct.variants?.length}
            <label class="block font-bold">Variante
              <select bind:value={selectedVariant} class="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                {#each selectedProduct.variants.flatMap(group => group.values.map(value => `${group.name}: ${value}`)) as variant}<option>{variant}</option>{/each}
              </select>
            </label>
          {/if}
          <div class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            {#each Object.entries(selectedProduct.specs ?? {}) as [name, value]}
              <div class="grid grid-cols-2 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-700"><span class="font-bold text-slate-500">{name}</span><span>{value}</span></div>
            {/each}
          </div>
          <div class="flex items-center justify-between"><span class="text-3xl font-black">{getProductPrice(selectedProduct).toLocaleString('de-DE')} KC</span><span class="font-bold text-emerald-600">Lieferung in ca. {selectedProduct.deliveryDays ?? 2} Tagen</span></div>
          <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <div class="flex justify-between gap-4 text-sm"><b>Preisverlauf, 30 Tage</b><span class={getProductPrice(selectedProduct) <= averagePrice(selectedProduct) ? 'text-emerald-600' : 'text-amber-600'}>{getProductPrice(selectedProduct) <= averagePrice(selectedProduct) ? 'Unter' : 'Über'} dem Durchschnitt ({averagePrice(selectedProduct).toLocaleString('de-DE')} KC)</span></div>
            <div class="mt-3 flex h-20 items-end gap-1">{#each getPriceHistory(selectedProduct) as point}<i class="flex-1 rounded-t bg-indigo-400" style={`height:${priceBarHeight(selectedProduct, point.price)}%`} title={`${point.date.toLocaleDateString('de-DE')}: ${point.price} KC`}></i>{/each}</div>
          </div>
          <button onclick={addSelected} class="w-full rounded-2xl bg-yellow-400 py-4 text-lg font-black text-slate-950">Auswahl in den Warenkorb</button>
        </div>
      </div>
      <div class="mt-8"><div class="mb-3 flex items-center justify-between"><h3 class="text-xl font-black">Kundenbewertungen</h3><select bind:value={reviewSort} class="rounded-lg border p-2 dark:bg-slate-900"><option value="helpful">Relevant</option><option value="positive">Beste zuerst</option><option value="critical">Kritische zuerst</option></select></div>{#each sortedReviews(selectedProduct) as review}<div class="mb-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900"><strong>{review.author} · Verifizierter Kauf · {review.rating}/5</strong><p>{review.text}</p></div>{/each}</div>
    </div>
  </div>
{/if}

{#if cartOpen}
  <div class="fixed inset-0 z-[110] flex justify-end bg-slate-950/60">
    <div class="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900">
      <div class="flex items-center justify-between"><h2 class="text-3xl font-black">Warenkorb</h2><button onclick={() => cartOpen = false} class="rounded-full bg-slate-100 px-4 py-2 text-xl dark:bg-slate-800">×</button></div>
      <div class="my-6 space-y-3">
        {#each user.cart ?? [] as item}
          {@const product = products.find(entry => entry.id === item.productId)}
          {#if product}<div class="flex gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><span class="text-4xl">{product.imageUrl}</span><div class="min-w-0 flex-1"><h3 class="font-black">{product.name}</h3><p class="truncate text-xs text-slate-500">{item.variant}</p><p class="font-bold">{(getProductPrice(product) * item.quantity).toLocaleString('de-DE')} KC</p></div><div class="flex items-center gap-2"><button onclick={() => updateCartQuantity(item.id, item.quantity - 1)} class="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800">−</button><b>{item.quantity}</b><button onclick={() => updateCartQuantity(item.id, item.quantity + 1)} class="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800">+</button></div></div>{/if}
        {/each}
        {#if !user.cart?.length}<p class="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">Noch nichts drin. Das lässt sich ändern.</p>{/if}
      </div>
      {#if user.cart?.length}
        <h3 class="mb-3 text-lg font-black">Lieferoption</h3>
        <div class="grid gap-2">
          {#each [{id:'STANDARD',label:'Standard',note:'Haustür · +10 KC je Position'},{id:'EXPRESS',label:'Express',note:'Halbe Lieferzeit · +50 KC je Position'},{id:'PICKUP',label:'Packstation',note:'Kostenlos abholen'},{id:'SAFE_PLACE',label:'Ablageort',note:`${user.deliveryNote || 'Im Profil festlegen'} · +10 KC je Position`}] as method}
            <label class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 {deliveryMethod === method.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-700'}"><input type="radio" bind:group={deliveryMethod} value={method.id} /><span><b>{method.label}</b><small class="block text-slate-500">{method.note}</small></span></label>
          {/each}
        </div>
        <div class="mt-5 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
          <label for="discount-code" class="text-sm font-black">Rabattcode</label>
          <div class="mt-2 flex gap-2"><input id="discount-code" bind:value={discountCode} placeholder="WELCOME10, LEAF50 oder FREESHIP" class="min-w-0 flex-1 rounded-xl border bg-white p-3 uppercase dark:bg-slate-900" /></div>
          <p class="mt-2 text-xs font-bold {validateDiscountCode(discountCode, getSubtotal()) ? 'text-emerald-600' : 'text-slate-500'}">{discountCode ? (validateDiscountCode(discountCode, getSubtotal())?.message ?? 'Code ungültig oder Mindestwert nicht erreicht') : 'Codes haben transparente Mindestwerte und keinen Countdown.'}</p>
        </div>
        {@const discount = validateDiscountCode(discountCode, getSubtotal())}
        <div class="my-6 space-y-2"><div class="flex justify-between text-sm"><span>Bestellsumme</span><span>{getCartTotal(deliveryMethod).toLocaleString('de-DE')} KC</span></div>{#if discount}<div class="flex justify-between font-bold text-emerald-600"><span>{discount.message}</span><span>−{discount.discount.toLocaleString('de-DE')} KC</span></div>{/if}<div class="flex justify-between text-2xl font-black"><span>Gesamt</span><span>{(getCartTotal(deliveryMethod) - (discount?.discount ?? 0)).toLocaleString('de-DE')} KC</span></div></div>
        <button onclick={finishCheckout} disabled={user.balance < getCartTotal(deliveryMethod) - (discount?.discount ?? 0)} class="w-full rounded-2xl bg-indigo-600 py-4 font-black text-white disabled:bg-slate-300">Kostenpflichtig simuliert bestellen</button>
        <p class="mt-2 text-center text-xs text-slate-500">Kein echtes Geld, keine Schulden, keine reale Bestellung.</p>
      {/if}
    </div>
  </div>
{/if}

{#if compareOpen}
  <div class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4"><div class="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-3xl bg-white p-6 dark:bg-slate-900"><div class="flex justify-between"><h2 class="text-3xl font-black">Produktvergleich</h2><button onclick={() => compareOpen = false}>✕</button></div><div class="mt-6 grid gap-4 md:grid-cols-3">{#each comparedProducts as product}<div class="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"><div class="text-center text-7xl">{product.imageUrl}</div><h3 class="mt-3 text-xl font-black">{product.name}</h3><p class="text-2xl font-black">{getProductPrice(product).toLocaleString('de-DE')} KC</p><p>★ {product.rating} · {product.stock} verfügbar</p>{#each Object.entries(product.specs ?? {}) as [name,value]}<p class="mt-2 border-t pt-2"><b>{name}:</b> {value}</p>{/each}<button onclick={() => toggleCompare(product.id)} class="mt-4 text-sm font-bold text-rose-500">Entfernen</button></div>{/each}</div>{#if !comparedProducts.length}<p class="p-12 text-center text-slate-500">Markiere bis zu drei Produkte mit ⇄.</p>{/if}</div></div>
{/if}

{#if dreamsOpen}
  <div class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4"><div class="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 dark:bg-slate-900"><div class="flex justify-between"><h2 class="text-3xl font-black">Traumlisten</h2><button onclick={() => dreamsOpen = false}>✕</button></div><div class="mt-4 flex gap-2"><input bind:value={newDreamName} placeholder="Neue Liste, z. B. Traum-Setup" class="flex-1 rounded-xl border p-3 dark:bg-slate-800" /><button onclick={() => { createDreamList(newDreamName); newDreamName = ''; }} class="rounded-xl bg-indigo-600 px-4 font-bold text-white">Anlegen</button></div>{#each user.dreamLists ?? [] as list}<section class="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><h3 class="text-xl font-black">{list.name}</h3><p class="text-sm text-slate-500">{list.productIds.length} Wünsche · {list.productIds.reduce((sum,id) => sum + getProductPrice(products.find(p => p.id === id)!),0).toLocaleString('de-DE')} KC</p><div class="mt-3 flex flex-wrap gap-2">{#each products as product}<button onclick={() => toggleDreamListProduct(list.id, product.id)} class="rounded-full px-3 py-2 text-sm font-bold {list.productIds.includes(product.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}">{product.imageUrl} {product.name}</button>{/each}</div></section>{/each}</div></div>
{/if}
