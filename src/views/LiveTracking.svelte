<script lang="ts">
  import { onMount } from 'svelte';
  import { orders, user } from '../lib/store.svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  let mapContainer: HTMLElement;
  let map: L.Map;
  
  // Track active markers to update their positions
  let markers: Record<string, L.Marker> = {};

  const koalaIcon = L.divIcon({
    className: 'custom-koala-icon',
    html: '<div style="font-size: 24px; text-shadow: 0 0 10px #39ff14;">🐨</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const homeIcon = L.divIcon({
    className: 'custom-home-icon',
    html: '<div style="font-size: 30px; text-shadow: 0 0 15px #b026ff;">🏠</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
  
  const warehouseIcon = L.divIcon({
    className: 'custom-warehouse-icon',
    html: '<div style="font-size: 30px; text-shadow: 0 0 15px #ffd700;">🏭</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  onMount(() => {
    // Basic setup
    const center = user.homeLocation || { lat: 51.165691, lng: 10.451526 };
    map = L.map(mapContainer).setView([center.lat, center.lng], 12);

    // Dark styled map tiles (e.g. CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Add Home Marker
    if (user.homeLocation) {
        L.marker([user.homeLocation.lat, user.homeLocation.lng], { icon: homeIcon })
         .addTo(map)
         .bindPopup('<b>Deine Homebase</b>');
    }

    // Add Warehouse Marker
    if (user.warehouseLocation) {
        L.marker([user.warehouseLocation.lat, user.warehouseLocation.lng], { icon: warehouseIcon })
         .addTo(map)
         .bindPopup('<b>KoalaShip Warehouse</b>');
    }

    // Update loop
    const interval = setInterval(() => {
        updateMarkers();
    }, 1000);

    updateMarkers(); // initial

    return () => clearInterval(interval);
  });

  function updateMarkers() {
    if (!map) return;
    
    const now = Date.now();
    const activeOrders = orders.filter(o => o.status === 'PROCESSING' || o.status === 'SHIPPED');

    // Remove stale markers
    const activeIds = activeOrders.map(o => o.id);
    for (const id in markers) {
        if (!activeIds.includes(id)) {
            map.removeLayer(markers[id]);
            delete markers[id];
        }
    }

    // Update or add active markers
    for (const order of activeOrders) {
        if (!order.startLocation || !user.homeLocation) continue;

        const totalTime = order.deliveryEta - order.orderDate;
        const elapsed = now - order.orderDate;
        let progress = Math.max(0, Math.min(1, elapsed / totalTime));

        // Interpolate position
        const currentLat = order.startLocation.lat + (user.homeLocation.lat - order.startLocation.lat) * progress;
        const currentLng = order.startLocation.lng + (user.homeLocation.lng - order.startLocation.lng) * progress;

        if (markers[order.id]) {
            markers[order.id].setLatLng([currentLat, currentLng]);
        } else {
            markers[order.id] = L.marker([currentLat, currentLng], { icon: koalaIcon })
                .addTo(map)
                .bindPopup(`<b>Paket: ${order.id.split('-')[0]}</b><br/>Status: ${order.status}`);
        }
    }
  }
</script>

<div class="space-y-6 flex flex-col h-[80vh]">
  <div class="flex items-center gap-4">
    <h2 class="text-2xl font-black uppercase tracking-widest text-slate-200">Live Radar</h2>
    <div class="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
  </div>

  <div class="flex-1 rounded-2xl overflow-hidden border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative z-0">
    <div bind:this={mapContainer} class="w-full h-full"></div>
  </div>
</div>
