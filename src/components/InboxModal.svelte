<script lang="ts">
    import { user, markMessageRead } from '../lib/store.svelte';
    import { navigateTo } from '../lib/router.svelte';
    
    let { close } = $props<{ close: () => void }>();
    
    let activeMessageId = $state<string | null>(null);
    let activeMessage = $derived(user.messages?.find(m => m.id === activeMessageId));
    
    function selectMessage(id: string) {
        activeMessageId = id;
        markMessageRead(id);
    }
</script>

<div class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
    <div class="flex h-[85vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        
        <!-- Sidebar: Message List -->
        <div class="flex w-full flex-col border-r border-slate-200 dark:border-slate-800 md:w-1/3 lg:w-1/4 {activeMessageId ? 'hidden md:flex' : 'flex'}">
            <header class="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <h2 class="text-xl font-black">Postfach</h2>
                <button onclick={close} class="h-8 w-8 rounded-full bg-slate-200 font-bold hover:bg-slate-300 dark:bg-slate-700 md:hidden">✕</button>
            </header>
            
            <div class="flex-1 overflow-y-auto">
                {#each user.messages ?? [] as msg}
                    <button 
                        onclick={() => selectMessage(msg.id)}
                        class="w-full border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 {activeMessageId === msg.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <span class="truncate font-bold {msg.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}">{msg.sender}</span>
                            {#if !msg.read}
                                <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                            {/if}
                        </div>
                        <p class="mt-1 line-clamp-2 text-sm {msg.read ? 'text-slate-500' : 'font-bold text-slate-700 dark:text-slate-200'}">{msg.subject}</p>
                        <p class="mt-2 text-xs font-bold text-slate-400">{new Date(msg.timestamp).toLocaleDateString('de-DE')} · {new Date(msg.timestamp).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})}</p>
                    </button>
                {/each}
                {#if !user.messages?.length}
                    <div class="p-8 text-center text-slate-500">
                        <span class="mb-2 block text-4xl opacity-50">📭</span>
                        <p class="text-sm font-bold">Dein Postfach ist leer.</p>
                    </div>
                {/if}
            </div>
        </div>
        
        <!-- Main: Message Detail -->
        <div class="hidden flex-1 flex-col bg-slate-50 dark:bg-slate-900/50 md:flex {activeMessageId ? '!flex' : ''}">
            {#if activeMessage}
                <header class="flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div>
                        <div class="flex items-center gap-3">
                            <button onclick={() => activeMessageId = null} class="md:hidden font-bold text-indigo-500">← Zurück</button>
                            <h2 class="text-2xl font-black text-slate-900 dark:text-white">{activeMessage.subject}</h2>
                        </div>
                        <p class="mt-1 text-sm font-bold text-slate-500 md:mt-1">Von: <span class="text-slate-700 dark:text-slate-300">{activeMessage.sender}</span></p>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="hidden text-sm font-bold text-slate-400 md:block">{new Date(activeMessage.timestamp).toLocaleString('de-DE')}</span>
                        <button onclick={close} class="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 md:flex">✕</button>
                    </div>
                </header>
                
                <div class="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div class="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div class="prose dark:prose-invert prose-slate whitespace-pre-wrap leading-relaxed">
                            {activeMessage.content}
                        </div>
                        
                        <div class="mt-10 border-t border-slate-100 pt-6 text-center dark:border-slate-700">
                            <p class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Automatische Aktion</p>
                            <button 
                                onclick={() => { close(); navigateTo('HISTORY'); }} 
                                class="rounded-xl bg-indigo-600 px-6 py-3 font-black text-white hover:bg-indigo-700 shadow-md transition-transform hover:-translate-y-1"
                            >
                                Zur Bestellung (History)
                            </button>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="relative flex flex-1 items-center justify-center">
                    <div class="text-center text-slate-400">
                        <span class="mb-4 block text-6xl opacity-20">✉️</span>
                        <p class="font-bold">Wähle eine Nachricht aus</p>
                    </div>
                    <button onclick={close} class="absolute right-6 top-6 h-10 w-10 rounded-full bg-slate-200 font-bold hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 md:hidden">✕</button>
                </div>
            {/if}
        </div>
        
    </div>
</div>
