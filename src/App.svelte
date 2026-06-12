<script lang="ts">
  import { onMount } from 'svelte';
  import { user, products, orders, initTicker, addFunds, switchMode, purchaseProduct, openPackage } from './lib/store.svelte';

  onMount(() => {
    initTicker();
  });

  // Helper to format remaining time
  function getRemainingSeconds(eta: number) {
    const remaining = Math.max(0, Math.floor((eta - Date.now()) / 1000));
    return remaining;
  }
</script>

<div class="app-container">
  <header>
    <div class="header-content">
      <h1>🐨 KoalaShip</h1>
      <a href="https://github.com/Shik3i/KoalaShip.git" target="_blank" rel="noopener noreferrer" class="github-link">
        <img src="/icons/github.svg" alt="GitHub Repo" width="24" height="24" />
      </a>
    </div>
  </header>

  <main>
    <section class="dashboard">
      <div class="card">
        <h2>Profil</h2>
        <p><strong>Modus:</strong> {user.mode}</p>
        <p><strong>Kontostand:</strong> {user.balance} DC (Dopamin-Coins)</p>
        <div class="actions">
          <button onclick={switchMode}>Modus wechseln</button>
          <button onclick={() => addFunds(1000)}>+1000 DC generieren</button>
        </div>
      </div>
    </section>

    <section class="shop">
      <h2>Dopamin-Shop</h2>
      <div class="product-grid">
        {#each products as product}
          <div class="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <div class="product-info">
              <h3>{product.name}</h3>
              <p class="price">{product.price} DC</p>
              <button 
                onclick={() => purchaseProduct(product.id)}
                disabled={user.balance < product.price}
              >
                Kaufen
              </button>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section class="orders">
      <h2>Deine Lieferungen</h2>
      {#if orders.length === 0}
        <p class="empty-state">Noch keine Bestellungen. Shoppe etwas für schnelles Dopamin!</p>
      {:else}
        <div class="order-list">
          {#each [...orders].reverse() as order}
            <div class="order-item" class:delivered={order.status === 'DELIVERED'} class:opened={order.status === 'OPENED'}>
              <div class="order-header">
                <strong>Paket: {products.find(p => p.id === order.productId)?.name}</strong>
                <span class="status {order.status.toLowerCase()}">{order.status}</span>
              </div>
              <div class="order-details">
                <p>Bestellt: {new Date(order.orderDate).toLocaleString()}</p>
                {#if order.status === 'PROCESSING' || order.status === 'SHIPPED'}
                  <p class="eta">Ankunft in: {getRemainingSeconds(order.deliveryEta)}s</p>
                {/if}
              </div>
              {#if order.status === 'DELIVERED'}
                <button class="primary-btn" onclick={() => openPackage(order.id)}>Paket öffnen 🎁</button>
              {/if}
              {#if order.status === 'OPENED'}
                <p class="dopamine-msg">💥 DOPAMIN FREIGESETZT! 💥</p>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </main>

  <footer>
    <p>KoalaShip © 2026 - <a href="https://github.com/Shik3i/KoalaShip.git" target="_blank">GitHub</a></p>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #f4f4f9;
    color: #333;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  header {
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 1rem 2rem;
  }

  .header-content {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
  }

  .github-link {
    display: flex;
    align-items: center;
    color: inherit;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  
  .github-link:hover {
    opacity: 0.7;
  }

  main {
    flex: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  section {
    margin-bottom: 2.5rem;
  }

  h2 {
    color: #2c3e50;
    margin-bottom: 1rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
  }

  .card {
    background: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  button {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
  }

  button:hover:not(:disabled) {
    background: #2980b9;
  }

  button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }

  .primary-btn {
    background: #2ecc71;
    margin-top: 1rem;
    width: 100%;
    padding: 0.75rem;
    font-size: 1.1rem;
  }

  .primary-btn:hover {
    background: #27ae60;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .product-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
  }

  .product-card img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }

  .product-info {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .product-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }

  .price {
    font-weight: bold;
    color: #e67e22;
    margin-bottom: 1rem;
  }

  .product-info button {
    margin-top: auto;
  }

  .order-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .order-item {
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #3498db;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .order-item.delivered {
    border-left-color: #f1c40f;
    background: #fffdf5;
  }

  .order-item.opened {
    border-left-color: #2ecc71;
    opacity: 0.7;
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .status {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-weight: bold;
  }

  .status.processing { background: #e0f7fa; color: #00838f; }
  .status.shipped { background: #fff3e0; color: #e65100; }
  .status.delivered { background: #f1c40f; color: #fff; }
  .status.opened { background: #e8f5e9; color: #2e7d32; }

  .order-details p {
    margin: 0.2rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .eta {
    font-weight: bold;
    color: #e74c3c !important;
  }

  .dopamine-msg {
    text-align: center;
    font-weight: bold;
    color: #e67e22;
    margin-top: 1rem;
    font-size: 1.2rem;
    animation: pop 0.5s ease-out;
  }

  @keyframes pop {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }

  footer {
    text-align: center;
    padding: 2rem;
    background: #fff;
    border-top: 1px solid #eee;
    color: #7f8c8d;
  }

  footer a {
    color: #3498db;
    text-decoration: none;
  }
</style>
