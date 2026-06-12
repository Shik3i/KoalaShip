<script lang="ts">
  import { user, products, purchaseProduct } from '../lib/store.svelte';
</script>

<div class="space-y-6">
  <div class="flex items-center gap-4">
    <h2 class="text-2xl font-black uppercase tracking-widest text-slate-200">Darknet Market</h2>
    <div class="flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each products as product}
      <div class="group relative bg-[#101025] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 flex flex-col
        {user.balance >= product.price ? 'shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.2)]' : 'opacity-80 grayscale-[20%]'}
      ">
        
        <div class="w-full h-40 bg-slate-900/50 border border-slate-800 rounded-xl mb-6 flex items-center justify-center text-7xl shadow-inner group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span class="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{product.imageUrl}</span>
        </div>
        
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-xl font-bold text-white leading-tight">{product.name}</h3>
          <span class="text-[10px] font-mono font-bold tracking-widest px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700">{product.category}</span>
        </div>
        
        <p class="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] mb-8">
          {product.price.toLocaleString('de-DE')} DC
        </p>
        
        <button 
          onclick={() => purchaseProduct(product.id)}
          disabled={user.balance < product.price}
          class="mt-auto w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:cursor-not-allowed
            {user.balance >= product.price 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-95' 
              : 'bg-slate-800 text-slate-500 border border-slate-700'}"
        >
          {user.balance >= product.price ? 'Kaufen 🛒' : 'Broke 💀'}
        </button>
      </div>
    {/each}
  </div>
</div>
