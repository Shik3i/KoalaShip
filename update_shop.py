import re

file_path = 'src/views/Shop.svelte'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace openProduct
content = re.sub(
    r'function openProduct\(product: Product\) \{.*?\}',
    '''function openProduct(product: Product) {
    selectedProduct = product;
    selectedVariant = product.variants?.[0]?.values?.[0]?.name ?? 'Standard';
  }''',
    content,
    flags=re.DOTALL
)

# Replace the modal part (from {#if selectedProduct} to {/if} before cartOpen)
modal_pattern = re.compile(r'\{#if selectedProduct\}.*?(?=\{#if cartOpen\})', re.DOTALL)
new_modal = '''{#if selectedProduct}
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
          
        </div>
      </div>
      
      {#if selectedProduct.relatedProductIds?.length}
         <div class="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700">
            <h3 class="text-2xl font-black mb-6">Passt hervorragend zu...</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
               {#each selectedProduct.relatedProductIds as relatedId}
                  {@const relatedProduct = products.find(p => p.id === relatedId)}
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
'''
content = modal_pattern.sub(new_modal, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Update getProductPrice in store.svelte.ts
store_path = 'src/lib/store.svelte.ts'
with open(store_path, 'r', encoding='utf-8') as f:
    store_content = f.read()

new_get_price = '''export function getProductPrice(product: Product, variantName?: string) {
    const event = getActiveShopEvent();
    const day = Math.floor(Date.now() / 86400000);
    const seed = [...product.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    let marketPrice = Math.round(product.price * (1 + Math.sin((day + seed) * 1.73) * 0.045));
    
    if (variantName && product.variants?.length) {
        const variantGroup = product.variants[0];
        const value = variantGroup.values.find(v => v.name === variantName);
        if (value?.priceModifier) {
             marketPrice += value.priceModifier;
        }
    }
    
    return product.category === event.category ? Math.round(marketPrice * (1 - event.discount)) : marketPrice;
}'''

store_content = re.sub(
    r'export function getProductPrice\(product: Product\) \{.*?\}',
    new_get_price,
    store_content,
    flags=re.DOTALL
)

with open(store_path, 'w', encoding='utf-8') as f:
    f.write(store_content)

print("Shop.svelte and store.svelte.ts updated successfully.")
