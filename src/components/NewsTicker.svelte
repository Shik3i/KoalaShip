<script lang="ts">
  import { onMount } from 'svelte';
  import news from '../data/news-ticker.json';
  import { orders, user } from '../lib/store.svelte';

  type Requirement = 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CART' | 'NO_ORDERS';
  type NewsItem = {
    id: string;
    category: string;
    text: string;
    weight?: number;
    requires?: Requirement;
  };

  let current = $state<NewsItem>(news[0] as NewsItem);
  let paused = $state(false);
  let visible = $state(true);

  function isEligible(item: NewsItem) {
    if (!item.requires) return true;
    if (item.requires === 'CART') return (user.cart?.length ?? 0) > 0;
    if (item.requires === 'NO_ORDERS') return orders.length === 0;
    return orders.some(order => order.status === item.requires);
  }

  function pickNext() {
    const eligible = (news as NewsItem[]).filter(item => item.id !== current.id && isEligible(item));
    const weighted = eligible.flatMap(item => Array(Math.max(1, item.weight ?? 1)).fill(item));
    if (weighted.length) current = weighted[Math.floor(Math.random() * weighted.length)];
  }

  onMount(() => {
    pickNext();
    const interval = window.setInterval(() => {
      if (!paused && visible) pickNext();
    }, 11000);
    const handleVisibility = () => visible = document.visibilityState === 'visible';
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  });
</script>

<aside class="news-ticker border-b border-indigo-950/20 bg-indigo-950 text-white" aria-label="KoalaShip Satire-Newsticker">
  <div class="mx-auto flex h-10 max-w-7xl items-center gap-3 overflow-hidden px-4 sm:px-6 lg:px-8">
    <span class="shrink-0 rounded bg-rose-500 px-2 py-1 text-[10px] font-black uppercase tracking-widest">Koala News</span>
    <button
      onclick={pickNext}
      onmouseenter={() => paused = true}
      onmouseleave={() => paused = false}
      onfocus={() => paused = true}
      onblur={() => paused = false}
      class="min-w-0 flex-1 overflow-hidden text-left"
      aria-label="Nächste Satiremeldung anzeigen"
      title="Klicken für die nächste Meldung"
    >
      <span class="news-ticker-text inline-block whitespace-nowrap text-sm font-bold">
        <span class="mr-3 text-indigo-300 uppercase">[{current.category}]</span>{current.text}
      </span>
    </button>
    <span class="hidden shrink-0 text-[10px] font-bold uppercase tracking-widest text-indigo-300 sm:block">Satire</span>
  </div>
</aside>
