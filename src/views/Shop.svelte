<script lang="ts">
  import {
    user, getProducts, getProductPrice, getActiveShopEvent, addToCart, updateCartQuantity,
    getCartTotal, checkoutCart, toggleCompare, createWishlist, deleteWishlist, toggleWishlistItem,
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
  let checkoutStep = $state<'CART' | 'DELIVERY' | 'SUMMARY' | 'SUCCESS'>('CART');
  let completedOrders = $state<import('../lib/types').Order[]>([]);
  let compareOpen = $state(false);
  let wishlistsOpen = $state(false);
  let newWishlistName = $state('');
  let newWishlistDesc = $state('');
  let newWishlistMood = $state('');
  let activeWishlistId = $state<string | null>(null);
  let deliveryMethod = $state<DeliveryMethod>('STANDARD');
  let discountCode = $state('');
  let reviewSort = $state<'helpful' | 'positive' | 'critical'>('helpful');
  const event = getActiveShopEvent();

  let filteredProducts = $derived(getProducts()
    .filter(product => category === 'ALL' || product.category === category)
    .filter(product => `${product.name} ${product.brand ?? ''} ${product.description ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'priceAsc') return getProductPrice(a) - getProductPrice(b);
      if (sort === 'priceDesc') return getProductPrice(b) - getProductPrice(a);
      if (sort === 'rating') return b.rating - a.rating;
      return Number(b.category === user.favoriteCategory) - Number(a.category === user.favoriteCategory);
    }));

  let comparedProducts = $derived(user.compareIds?.map(id => getProducts().find(product => product.id === id)).filter(Boolean) as Product[]);
  let cartCount = $derived(user.cart?.reduce((sum, item) => sum + item.quantity, 0) ?? 0);

  let cartProducts = $derived((user.cart ?? []).map(item => getProducts().find(entry => entry.id === item.productId)).filter(Boolean) as Product[]);
  
  let cartAnalysisTitle = $derived.by(() => {
    if (!cartProducts.length) return "Leerer Korb";
    const types = cartProducts.reduce((acc, p) => { 
      const t = p.inventoryType || 'OTHER';
      acc[t] = (acc[t] || 0) + 1; 
      return acc; 
    }, {} as Record<string, number>);
    const mostCommonType = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b, '');
    if (cartProducts.some(p => p.category === 'MYSTERY')) return "Risikofreudiger Einkauf";
    if (mostCommonType === 'VEHICLE') return "Logistischer Albtraum";
    if (mostCommonType === 'DECOR') return "Virtueller Innenarchitekt";
    if (mostCommonType === 'OUTFIT') return "Neue Garderobe";
    if (mostCommonType === 'ELECTRONICS') return "Tech-Upgrade";
    return "Bunte Mischung";
  });

  let cartPackaging = $derived.by(() => {
    if (!cartProducts.length) return "";
    if (cartProducts.some(p => p.inventoryType === 'VEHICLE')) return "Sperrgut (auf Palette, leicht im Regen stehen gelassen)";
    if (cartProducts.some(p => p.category === 'MYSTERY')) return "Unauffälliger Karton (Geheimnisvoll)";
    if (cartProducts.every(p => p.inventoryType === 'OUTFIT' || p.inventoryType === 'COLLECTIBLE')) return "Luftpolsterumschlag (Hoffentlich reißfest)";
    if (cartProducts.some(p => p.inventoryType === 'ELECTRONICS')) return "Karton mit Warnaufkleber (Wird trotzdem geworfen)";
    return "Recycelter Koala-Karton";
  });

  let cartSplits = $derived.by(() => {
    if (!cartProducts.length) return "";
    const uniqueTypes = new Set(cartProducts.map(p => p.inventoryType)).size;
    if (cartCount === 1) return "Kommt logischerweise in 1 kompakten Paket.";
    if (cartCount > 3 || uniqueTypes > 2) return "Wird aus unerfindlichen Gründen in 3 getrennten Lieferungen an verschiedenen Tagen zugestellt.";
    return "Wird clever in 1 Lieferung zusammengefasst.";
  });

  function openProduct(product: Product) {
    selectedProduct = product;
    selectedVariant = product.variants?.[0]?.values?.[0]?.name ?? 'Standard';
  }

  function addSelected() {
    if (!selectedProduct) return;
    addToCart(selectedProduct.id, selectedVariant);
    selectedProduct = null;
  }

  function finishCheckout() {
    const newOrders = checkoutCart(deliveryMethod, discountCode);
    if (newOrders) {
      completedOrders = newOrders;
      checkoutStep = 'SUCCESS';
    }
  }

  function sortedReviews(product: Product) {
    if (reviewSort === 'positive') return [...product.reviews].sort((a, b) => b.rating - a.rating);
    if (reviewSort === 'critical') return [...product.reviews].sort((a, b) => a.rating - b.rating);
    return product.reviews;
  }

  function getSubtotal() {
    return (user.cart ?? []).reduce((sum, item) => {
      const product = getProducts().find(entry => entry.id === item.productId);
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
      <button onclick={() => wishlistsOpen = true} class="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold dark:border-slate-700 dark:bg-slate-800 transition-colors hover:border-indigo-500 hover:text-indigo-500">Window-Shopping</button>
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
          <button onclick={() => addToCart(product.id, product.variants?.[0]?.values[0]?.name ?? 'Standard')} class="rounded-xl bg-yellow-400 px-3 py-3 font-black text-slate-950 hover:bg-yellow-300">In den Warenkorb</button>
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
        <div class="space-y-6">
           <div class="flex min-h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-indigo-100 text-9xl dark:from-slate-900 dark:to-indigo-950">{selectedProduct.imageUrl}</div>
           
           {#if selectedProduct.whyThisProduct?.length}
           <div class="rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/30">
               <h3 class="font-black text-indigo-900 dark:text-indigo-200 mb-3">Warum dieses Produkt?</h3>
               <ul class="space-y-2">
                 {#each selectedProduct.whyThisProduct as reason}
                    <li class="flex items-start gap-2 text-indigo-800 dark:text-indigo-300"><span class="font-bold text-indigo-500">✓</span> {reason}</li>
                 {/each}
               </ul>
           </div>
           {/if}
        </div>
        
        <div class="space-y-6">
          <div><span class="text-yellow-500">★★★★★</span> <span class="font-bold">{selectedProduct.rating} · {selectedProduct.reviews.length} Bewertungen</span></div>
          <p class="text-lg leading-relaxed text-slate-600 dark:text-slate-300">{selectedProduct.description}</p>
          
          {#if selectedProduct.variants?.length}
            {@const group = selectedProduct.variants[0]}
            <div class="space-y-3">
              <h3 class="font-black">{group.name} wählen</h3>
              <div class="grid gap-3">
                {#each group.values as variant}
                  <button 
                    onclick={() => selectedVariant = variant.name} 
                    class="text-left flex flex-col p-4 rounded-2xl border-2 transition-all {selectedVariant === variant.name ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'}"
                  >
                     <div class="flex justify-between items-center w-full">
                       <span class="font-black text-lg">{variant.name}</span>
                       {#if variant.priceModifier}<span class="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg">+{variant.priceModifier} KC</span>{/if}
                     </div>
                     {#if variant.description}<p class="text-sm text-slate-500 mt-1">{variant.description}</p>{/if}
                     {#if variant.pros?.length || variant.cons?.length}
                        <div class="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                           {#each variant.pros ?? [] as pro}<span class="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">👍 {pro}</span>{/each}
                           {#each variant.cons ?? [] as con}<span class="text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg">👎 {con}</span>{/each}
                        </div>
                     {/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
          
          <div class="flex items-center justify-between"><span class="text-3xl font-black">{getProductPrice(selectedProduct, selectedVariant).toLocaleString('de-DE')} KC</span><span class="font-bold text-emerald-600">Lieferung in ca. {selectedProduct.deliveryDays ?? 2} Tagen</span></div>
          <button onclick={addSelected} class="w-full rounded-2xl bg-yellow-400 py-4 text-lg font-black text-slate-950 hover:bg-yellow-300 transition-all shadow-lg hover:-translate-y-1 hover:shadow-xl">Auswahl in den Warenkorb</button>
          
          <div class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
             <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Auf einen Wunschzettel legen</p>
             <div class="flex flex-wrap gap-2">
                {#each user.wishlists ?? [] as list}
                   <button onclick={() => toggleWishlistItem(list.id, selectedProduct!.id)} class="rounded-xl border px-3 py-2 text-sm font-bold transition-colors {list.items.some(i => i.productId === selectedProduct!.id) ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}">
                      {list.items.some(i => i.productId === selectedProduct!.id) ? '❤️' : '🤍'} {list.name}
                   </button>
                {/each}
             </div>
          </div>
          
        </div>
      </div>
      
      {#if selectedProduct.relatedProductIds?.length}
         <div class="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700">
            <h3 class="text-2xl font-black mb-6">Passt hervorragend zu...</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
               {#each selectedProduct.relatedProductIds as relatedId}
                  {@const relatedProduct = getProducts().find(p => p.id === relatedId)}
                  {#if relatedProduct}
                     <button onclick={() => openProduct(relatedProduct)} class="text-left group flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                        <div class="text-5xl mb-3 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl aspect-square">{relatedProduct.imageUrl}</div>
                        <h4 class="font-black text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">{relatedProduct.name}</h4>
                        <span class="text-xs text-slate-500 font-bold">{getProductPrice(relatedProduct).toLocaleString('de-DE')} KC</span>
                     </button>
                  {/if}
               {/each}
            </div>
         </div>
      {/if}

      <div class="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700">
         <div class="mb-6 flex items-center justify-between">
            <h3 class="text-2xl font-black">Echte Kundenbewertungen</h3>
            <select bind:value={reviewSort} class="rounded-lg border p-2 text-sm font-bold bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
               <option value="helpful">Relevanteste</option>
               <option value="positive">Beste zuerst</option>
               <option value="critical">Kritische zuerst</option>
            </select>
         </div>
         <div class="grid gap-4 md:grid-cols-2">
            {#each sortedReviews(selectedProduct) as review}
               <div class="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div class="flex justify-between items-start mb-2">
                     <div>
                        <strong class="block text-slate-900 dark:text-white">{review.author}</strong>
                        <span class="text-xs text-emerald-600 font-bold">Verifizierter virtueller Kauf</span>
                     </div>
                     <div class="text-yellow-500 font-black">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  </div>
                  <p class="text-slate-600 dark:text-slate-300 italic">"{review.text}"</p>
               </div>
            {/each}
         </div>
      </div>
      
    </div>
  </div>
{/if}
{#if cartOpen}
  <div class="fixed inset-0 z-[110] flex justify-end bg-slate-950/60">
    <div class="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900">
      <div class="flex items-center justify-between"><h2 class="text-3xl font-black">Warenkorb</h2><button onclick={() => { cartOpen = false; checkoutStep = 'CART'; }} class="rounded-full bg-slate-100 px-4 py-2 text-xl dark:bg-slate-800">×</button></div>
      {#if checkoutStep === 'CART'}
      {#if user.cart?.length}
        <div class="mt-6 rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
          <h3 class="font-black text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
            <span>📊</span> {cartAnalysisTitle}
          </h3>
          <ul class="text-sm text-indigo-800 dark:text-indigo-300 space-y-1">
            <li><b>Verpackung:</b> {cartPackaging}</li>
            <li><b>Logistik:</b> {cartSplits}</li>
          </ul>
        </div>
      {/if}
      <div class="my-6 space-y-3">
        {#each user.cart ?? [] as item}
          {@const product = getProducts().find(entry => entry.id === item.productId)}
          {#if product}<div class="flex gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><span class="text-4xl">{product.imageUrl}</span><div class="min-w-0 flex-1"><h3 class="font-black">{product.name}</h3><p class="truncate text-xs text-slate-500">{item.variant}</p><p class="font-bold">{(getProductPrice(product) * item.quantity).toLocaleString('de-DE')} KC</p></div><div class="flex items-center gap-2"><button onclick={() => updateCartQuantity(item.id, item.quantity - 1)} class="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800">−</button><b>{item.quantity}</b><button onclick={() => updateCartQuantity(item.id, item.quantity + 1)} class="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800">+</button></div></div>{/if}
        {/each}
        {#if !user.cart?.length}<p class="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">Noch nichts drin. Das lässt sich ändern.</p>{/if}
      </div>
      {#if user.cart?.length}
        <button onclick={() => checkoutStep = 'DELIVERY'} class="mt-6 w-full rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-lg">Zur fiktiven Kasse</button>
      {/if}
      {:else if checkoutStep === 'DELIVERY'}
        <h3 class="mb-3 text-lg font-black">Logistik & Lieferoption</h3>
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
        <button onclick={() => checkoutStep = 'SUMMARY'} class="mt-6 w-full rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-lg">Weiter zur Übersicht</button>
        <button onclick={() => checkoutStep = 'CART'} class="mt-2 w-full rounded-2xl py-4 font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Zurück zum Korb</button>
      {:else if checkoutStep === 'SUMMARY'}
        <h3 class="mb-3 text-lg font-black">Zusammenfassung</h3>
        {@const discount = validateDiscountCode(discountCode, getSubtotal())}
        <div class="my-6 space-y-2"><div class="flex justify-between text-sm"><span>Bestellsumme</span><span>{getCartTotal(deliveryMethod).toLocaleString('de-DE')} KC</span></div>{#if discount}<div class="flex justify-between font-bold text-emerald-600"><span>{discount.message}</span><span>−{discount.discount.toLocaleString('de-DE')} KC</span></div>{/if}<div class="flex justify-between text-2xl font-black"><span>Gesamt</span><span>{(getCartTotal(deliveryMethod) - (discount?.discount ?? 0)).toLocaleString('de-DE')} KC</span></div></div>
        <button onclick={finishCheckout} disabled={user.balance < getCartTotal(deliveryMethod) - (discount?.discount ?? 0)} class="w-full rounded-2xl bg-emerald-600 py-4 font-black text-white shadow-lg disabled:bg-slate-300">Zahlungspflichtig simulieren</button>
        <button onclick={() => checkoutStep = 'DELIVERY'} class="mt-2 w-full rounded-2xl py-4 font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Zurück</button>
        <p class="mt-2 text-center text-xs text-slate-500">Kein echtes Geld, keine Schulden, keine reale Bestellung.</p>
      {:else if checkoutStep === 'SUCCESS'}
        <div class="text-center py-10">
           <div class="text-7xl mb-4">🎉</div>
           <h3 class="text-2xl font-black text-emerald-600">Erfolgreich simuliert!</h3>
           <p class="mt-2 text-slate-500">Danke! Wir haben dein fiktives Geld erfolgreich entgegengenommen.</p>
           
           <div class="mt-6 space-y-3 text-left">
             {#each completedOrders as order}
               <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                 <p class="text-xs font-bold text-slate-500">Order-ID: {order.id}</p>
                 <div class="flex items-center gap-3 mt-2">
                   <span class="text-3xl">{getProducts().find(p => p.id === order.productId)?.imageUrl}</span>
                   <div>
                     <p class="font-black text-slate-900 dark:text-white">{getProducts().find(p => p.id === order.productId)?.name}</p>
                     <p class="text-xs text-emerald-600 mt-1 font-bold">{order.trackingSteps[0]?.message}</p>
                   </div>
                 </div>
               </div>
             {/each}
           </div>
           
           <button onclick={() => { cartOpen = false; checkoutStep = 'CART'; }} class="mt-8 w-full rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-lg">Zurück zum Shop</button>
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if compareOpen}
  <div class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4"><div class="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-3xl bg-white p-6 dark:bg-slate-900"><div class="flex justify-between"><h2 class="text-3xl font-black">Produktvergleich</h2><button onclick={() => compareOpen = false}>✕</button></div><div class="mt-6 grid gap-4 md:grid-cols-3">{#each comparedProducts as product}<div class="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"><div class="text-center text-7xl">{product.imageUrl}</div><h3 class="mt-3 text-xl font-black">{product.name}</h3><p class="text-2xl font-black">{getProductPrice(product).toLocaleString('de-DE')} KC</p><p>★ {product.rating} · {product.stock} verfügbar</p>{#each Object.entries(product.specs ?? {}) as [name,value]}<p class="mt-2 border-t pt-2"><b>{name}:</b> {value}</p>{/each}<button onclick={() => toggleCompare(product.id)} class="mt-4 text-sm font-bold text-rose-500">Entfernen</button></div>{/each}</div>{#if !comparedProducts.length}<p class="p-12 text-center text-slate-500">Markiere bis zu drei Produkte mit ⇄.</p>{/if}</div></div>
{/if}

{#if wishlistsOpen}
  <div class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
    <div class="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl dark:bg-slate-900">
      
      <header class="flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
           <p class="text-sm font-black uppercase tracking-widest text-indigo-500">Träume & Ziele</p>
           <h2 class="text-3xl font-black">Window-Shopping</h2>
        </div>
        <button onclick={() => wishlistsOpen = false} class="h-10 w-10 rounded-full bg-slate-100 text-xl font-bold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">✕</button>
      </header>

      <div class="flex-1 overflow-auto p-6">
        {#if activeWishlistId === null}
          <!-- Listen-Übersicht -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <!-- Neue Liste anlegen -->
             <div class="flex flex-col rounded-3xl border border-dashed border-slate-300 bg-white/50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
                <h3 class="text-xl font-black mb-4">Neue Liste erstellen</h3>
                <input bind:value={newWishlistName} placeholder="Name (z.B. Sommerträume)" class="mb-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-900" />
                <input bind:value={newWishlistDesc} placeholder="Beschreibung (Optional)" class="mb-2 w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                <select bind:value={newWishlistMood} class="mb-4 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-900">
                   <option value="Träumerei">Träumerei ✨</option>
                   <option value="Realistisch">Realistisch 🎯</option>
                   <option value="Wenn ich im Lotto gewinne">Lotto-Gewinn 💸</option>
                   <option value="Geschenke">Geschenke 🎁</option>
                </select>
                <button onclick={() => { createWishlist(newWishlistName, newWishlistDesc, newWishlistMood); newWishlistName = ''; newWishlistDesc = ''; }} disabled={!newWishlistName.trim()} class="mt-auto w-full rounded-xl bg-indigo-600 py-3 font-black text-white disabled:opacity-50">Liste anlegen</button>
             </div>

             <!-- Bestehende Listen -->
             {#each user.wishlists ?? [] as list}
                {@const totalValue = list.items.reduce((sum, item) => sum + getProductPrice(getProducts().find(p => p.id === item.productId)!), 0)}
                <button onclick={() => activeWishlistId = list.id} class="group flex flex-col items-start justify-between rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                   <div class="w-full">
                      <div class="flex items-center justify-between">
                         <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">{list.mood}</span>
                         <span class="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">→</span>
                      </div>
                      <h3 class="mt-4 text-2xl font-black text-slate-900 dark:text-white">{list.name}</h3>
                      {#if list.description}<p class="mt-2 text-sm text-slate-500 line-clamp-2">{list.description}</p>{/if}
                   </div>
                   
                   <div class="mt-6 w-full border-t border-slate-100 pt-4 dark:border-slate-700">
                      <p class="text-xs font-bold text-slate-400">Gesamtwert der Liste</p>
                      <p class="text-xl font-black text-indigo-600 dark:text-indigo-400">{totalValue.toLocaleString('de-DE')} KC</p>
                      <p class="mt-1 text-xs text-slate-500">{list.items.length} Produkte gesammelt</p>
                   </div>
                </button>
             {/each}
          </div>
        {:else}
          <!-- Listen-Detailansicht -->
          {@const list = user.wishlists!.find(l => l.id === activeWishlistId)}
          {#if list}
             <div class="mb-6 flex items-start justify-between">
                <div>
                   <button onclick={() => activeWishlistId = null} class="mb-2 text-sm font-bold text-indigo-500 hover:text-indigo-700">← Zurück zur Übersicht</button>
                   <h2 class="text-4xl font-black">{list.name} <span class="text-lg opacity-50">({list.mood})</span></h2>
                   {#if list.description}<p class="mt-2 text-slate-600 dark:text-slate-400">{list.description}</p>{/if}
                </div>
                <button onclick={() => { deleteWishlist(list.id); activeWishlistId = null; }} class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30">Liste löschen</button>
             </div>

             <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {#each list.items as item}
                   {@const product = getProducts().find(p => p.id === item.productId)}
                   {#if product}
                      <article class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                         <div class="flex items-start justify-between">
                            <span class="text-7xl drop-shadow-md">{product.imageUrl}</span>
                            <button onclick={() => toggleWishlistItem(list.id, product.id)} class="text-xl font-bold text-rose-500 hover:scale-110">❤️</button>
                         </div>
                         <h4 class="mt-4 text-lg font-black leading-tight">{product.name}</h4>
                         <p class="text-xl font-black text-indigo-600 mt-1">{getProductPrice(product).toLocaleString('de-DE')} KC</p>
                         
                         <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <p class="text-xs text-slate-500">Auf der Liste seit: <b class="text-slate-700 dark:text-slate-300">{new Date(item.addedAt).toLocaleDateString('de-DE')}</b></p>
                            <div class="mt-3 grid grid-cols-2 gap-2">
                               <button onclick={() => addToCart(product.id, 'Standard')} class="rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">In den Warenkorb</button>
                               <button onclick={() => { wishlistsOpen = false; selectedProduct = product; }} class="rounded-xl border border-slate-200 py-2 text-xs font-bold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Details ansehen</button>
                            </div>
                         </div>
                      </article>
                   {/if}
                {/each}
                
                {#if list.items.length === 0}
                   <div class="col-span-full py-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                      <span class="text-4xl opacity-50 block mb-3">🪹</span>
                      <p class="text-slate-500 font-bold">Diese Liste ist noch leer.</p>
                      <button onclick={() => { activeWishlistId = null; wishlistsOpen = false; }} class="mt-4 text-indigo-500 font-bold">Gehe in den Shop und suche Produkte</button>
                   </div>
                {/if}
             </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}
