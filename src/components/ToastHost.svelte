<script lang="ts">
  import { notifications, dismissNotification } from '../lib/notifications.svelte';
</script>

<div class="fixed right-4 top-20 z-[120] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
  {#each notifications as item (item.id)}
    <button
      class="toast-card w-full rounded-2xl border bg-white/95 p-4 text-left shadow-xl backdrop-blur dark:bg-slate-800/95
        {item.kind === 'success' ? 'border-emerald-300 dark:border-emerald-700' : ''}
        {item.kind === 'warning' ? 'border-amber-300 dark:border-amber-700' : ''}
        {item.kind === 'info' ? 'border-indigo-300 dark:border-indigo-700' : ''}"
      onclick={() => dismissNotification(item.id)}
      aria-label={`${item.title}: ${item.message}. Schließen`}
    >
      <strong class="block text-slate-900 dark:text-white">{item.title}</strong>
      <span class="text-sm text-slate-600 dark:text-slate-300">{item.message}</span>
    </button>
  {/each}
</div>
