<script lang="ts">
  import { products, user, orders, toggleRoomItem } from '../lib/store.svelte';
  const ownedIds = $derived([...new Set(ordersToProducts())]);
  function ordersToProducts() {
    return orders.filter(order => order.status === 'OPENED' && !user.returnedOrderIds?.includes(order.id))
      .map(order => order.revealedProductId || order.productId);
  }
</script>

<div class="space-y-8">
  <div>
    <h2 class="text-3xl font-black text-slate-900 dark:text-white">Koala-Zimmer</h2>
    <p class="text-slate-500">Stelle bis zu acht geöffnete Produkte aus.</p>
  </div>
  <div class="relative min-h-[25rem] overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-b from-sky-200 via-amber-50 to-amber-200 p-8 shadow-inner dark:from-slate-700 dark:via-slate-800 dark:to-slate-950">
    <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-amber-700/20"></div>
    <div class="relative grid grid-cols-2 gap-8 sm:grid-cols-4">
      {#each user.roomItems ?? [] as productId}
        {@const product = products.find(item => item.id === productId)}
        {#if product}
          <button onclick={() => toggleRoomItem(product.id)} class="flex aspect-square flex-col items-center justify-center rounded-2xl bg-white/70 text-6xl shadow-lg backdrop-blur dark:bg-slate-900/70" aria-label={`${product.name} wegräumen`}>
            {product.imageUrl}<span class="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">{product.name}</span>
          </button>
        {/if}
      {/each}
    </div>
  </div>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
    {#each ownedIds as productId}
      {@const product = products.find(item => item.id === productId)}
      {#if product}
        <button onclick={() => toggleRoomItem(product.id)} class="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800">
          <span class="block text-4xl">{product.imageUrl}</span>
          <span class="text-sm font-bold">{user.roomItems?.includes(product.id) ? 'Wegräumen' : 'Ausstellen'}</span>
        </button>
      {/if}
    {/each}
  </div>
</div>
