<script lang="ts">
  import { user, products, purchaseProduct } from '../lib/store.svelte';
  import { t } from '../lib/i18n.svelte';
  import CoinIcon from '../components/CoinIcon.svelte';

  // State for Buy Slam / Loading
  let buyingProductId = $state<string | null>(null);
  let buyStatus = $state<'authorizing' | 'done'>('authorizing');
  
  // State for Express Shipping
  let isExpress = $state(false);

  // State for Reviews Modal
  let selectedProduct = $state<typeof products[0] | null>(null);
  
  // State for shaking insufficient funds
  let shakeProductId = $state<string | null>(null);
  let isLoading = $state(true);
  let visibleRounds = $state(1);

  setTimeout(() => isLoading = false, 700);

  function handleScroll() {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
      if (nearBottom && visibleRounds < 3) visibleRounds++;
  }

  $effect(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
  });

  function handleBuy(productId: string, totalCost: number) {
      if (user.balance < totalCost) {
          shakeProductId = productId;
          setTimeout(() => shakeProductId = null, 500);
          return;
      }
      
      buyingProductId = productId;
      buyStatus = 'authorizing';
      
      setTimeout(() => {
          purchaseProduct(productId, isExpress);
          buyStatus = 'done';
          setTimeout(() => {
              buyingProductId = null;
          }, 1500);
      }, 1000);
  }

  function getStars(rating: number) {
      const full = Math.floor(rating);
      const half = rating % 1 >= 0.5 ? 1 : 0;
      const empty = 5 - full - half;
      return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between mb-8">
    <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('shop.title')}</h2>
    
    <!-- Global Express Toggle -->
    <label class="flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div class="relative">
            <input type="checkbox" bind:checked={isExpress} class="sr-only" />
            <div class="block bg-slate-200 dark:bg-slate-700 w-10 h-6 rounded-full transition-colors {isExpress ? 'bg-indigo-500 dark:bg-indigo-500' : ''}"></div>
            <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform {isExpress ? 'transform translate-x-4' : ''}"></div>
        </div>
        <div class="flex flex-col">
            <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{isExpress ? t('shop.express') : t('shop.standard')}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">Halbiert die Lieferzeit</span>
        </div>
    </label>
  </div>
  
  {#if isLoading}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" aria-label="Produkte werden geladen">
      {#each Array(8) as _}
        <div class="skeleton-card h-[28rem] rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
      {/each}
    </div>
  {:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {#each Array(visibleRounds).flatMap((_, round) => products.map(product => ({ product, key: `${round}-${product.id}` }))) as entry (entry.key)}
      {@const product = entry.product}
      {@const totalCost = product.price + (isExpress ? 50 : 0)}
      {@const canAfford = user.balance >= totalCost}
      {@const isBuying = buyingProductId === product.id}

      <div class="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        
        <!-- Image Area -->
        <div class="w-full aspect-square bg-slate-50 dark:bg-slate-900 rounded-xl mb-4 flex items-center justify-center text-8xl shadow-inner relative overflow-hidden group-hover:scale-[1.02] transition-transform">
          <span class="relative z-10 drop-shadow-md" role="img" aria-label={product.name}>{product.imageUrl}</span>
          <!-- Fake Prime Badge -->
          <div class="absolute top-3 left-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            PRIME
          </div>
        </div>
        
        <!-- Content Area -->
        <div class="flex-1 flex flex-col">
            <div class="flex justify-between items-start mb-1">
                <span class="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">{product.category}</span>
                <button 
                    onclick={() => selectedProduct = product}
                    aria-label={`Bewertungen für ${product.name} öffnen`}
                    class="flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-600 transition-colors"
                >
                    {getStars(product.rating)} <span class="text-slate-500 dark:text-slate-400 underline">({product.reviews.length})</span>
                </button>
            </div>
            
            <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-4">{product.name}</h3>
            
            <div class="mt-auto flex items-end justify-between mb-4">
                <div class="flex items-center gap-1.5">
                    <CoinIcon class="w-6 h-6" />
                    <span class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {totalCost.toLocaleString('de-DE')}
                    </span>
                </div>
            </div>
            
            <!-- Buy Button Slam -->
            {#if isBuying}
                {#if buyStatus === 'authorizing'}
                    <button disabled class="w-full py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold flex items-center justify-center gap-2">
                        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('shop.authorizing')}
                    </button>
                {:else}
                    <button disabled class="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transform scale-105 transition-transform">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                        {t('shop.ordered')}
                    </button>
                {/if}
            {:else}
                <button 
                    onclick={() => handleBuy(product.id, totalCost)}
                    class="w-full py-3 rounded-xl font-bold transition-all duration-200 shadow-sm
                        {shakeProductId === product.id ? 'bg-red-500 text-white animate-[shake_0.4s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}
                        {shakeProductId !== product.id && canAfford ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 hover:shadow-md active:scale-95' : ''}
                        {shakeProductId !== product.id && !canAfford ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700' : ''}"
                >
                    {shakeProductId === product.id ? 'Zu teuer!' : (canAfford ? t('shop.buy') : t('shop.outofstock'))}
                </button>
            {/if}
        </div>
      </div>
    {/each}
  </div>
  {#if visibleRounds < 3}
    <p class="py-8 text-center text-sm font-bold text-slate-500">Mehr Produkte werden beim Scrollen geladen...</p>
  {/if}
  {/if}
</div>

<!-- Reviews Modal -->
{#if selectedProduct}
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedProduct.imageUrl}</span> {t('shop.reviews')}
              </h3>
              <button onclick={() => selectedProduct = null} aria-label="Bewertungen schließen" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
          </div>
          
          <div class="p-6 overflow-y-auto space-y-6">
              <div class="flex items-center gap-4 mb-2">
                  <div class="text-5xl font-black text-slate-900 dark:text-white">{selectedProduct.rating.toFixed(1)}</div>
                  <div class="flex flex-col">
                      <div class="text-yellow-500 text-xl">{getStars(selectedProduct.rating)}</div>
                      <span class="text-sm text-slate-500 dark:text-slate-400">Basierend auf {selectedProduct.reviews.length} globalen Bewertungen</span>
                  </div>
              </div>
              
              <hr class="border-slate-200 dark:border-slate-700" />
              
              {#each selectedProduct.reviews as review}
                  <div class="space-y-1">
                      <div class="flex items-center gap-2">
                          <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                              {review.author[0]}
                          </div>
                          <span class="font-bold text-slate-900 dark:text-white">{review.author}</span>
                      </div>
                      <div class="text-yellow-500 text-sm">{getStars(review.rating)}</div>
                      <p class="text-slate-600 dark:text-slate-300 text-sm italic">"{review.text}"</p>
                  </div>
              {/each}
          </div>
          
          <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button onclick={() => selectedProduct = null} class="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-bold transition-colors">
                  {t('common.close')}
              </button>
          </div>
      </div>
  </div>
{/if}
