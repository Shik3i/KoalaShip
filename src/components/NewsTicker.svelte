<script lang="ts">
  import { onMount } from 'svelte';
  import { newstickerMessages } from '../lib/content';
  import { createPRNG, getDaySeed, pickSeeded } from '../lib/random';

  let tickCount = 0;
  let current = $state(pickSeeded(newstickerMessages, createPRNG(getDaySeed() + tickCount)));
  let paused = $state(false);
  let visible = $state(true);

  function pickNext() {
    tickCount++;
    current = pickSeeded(newstickerMessages, createPRNG(getDaySeed() + tickCount));
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
        {current}
      </span>
    </button>
    <span class="hidden shrink-0 text-[10px] font-bold uppercase tracking-widest text-indigo-300 sm:block">Satire</span>
  </div>
</aside>
