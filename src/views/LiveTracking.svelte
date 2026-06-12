<script lang="ts">
  import { onMount } from 'svelte';
  import { orders, user } from '../lib/store.svelte';
  import { t } from '../lib/i18n.svelte';
  import { themeState } from '../lib/theme.svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  let mapContainer: HTMLElement;
  let map: L.Map;
  
  // Track active markers to update their positions
  let markers: Record<string, L.Marker> = {};
  let currentTileLayer: L.TileLayer | null = null;

  const koalaIcon = L.divIcon({
    className: 'custom-koala-icon',
    html: '<div style="font-size: 24px; text-shadow: 0 0 5px rgba(0,0,0,0.3); background: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🐨</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  const homeIcon = L.divIcon({
    className: 'custom-home-icon',
    html: '<div style="font-size: 30px; text-shadow: 0 0 5px rgba(0,0,0,0.3);">🏠</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
  
  const warehouseIcon = L.divIcon({
    className: 'custom-warehouse-icon',
    html: '<div style="font-size: 30px; text-shadow: 0 0 5px rgba(0,0,0,0.3);">🏭</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  onMount(() => {
    // Basic setup
    const center = user.homeLocation || { lat: 51.165691, lng: 10.451526 };
    map = L.map(mapContainer, {
        zoomControl: false
    }).setView([center.lat, center.lng], 12);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    setMapTiles();

    // Add Home Marker
    if (user.homeLocation) {
        L.marker([user.homeLocation.lat, user.homeLocation.lng], { icon: homeIcon })
         .addTo(map)
         .bindPopup('<b class="text-slate-900">Deine Homebase</b>');
    }

    // Add Warehouse Marker
    if (user.warehouseLocation) {
        L.marker([user.warehouseLocation.lat, user.warehouseLocation.lng], { icon: warehouseIcon })
         .addTo(map)
         .bindPopup('<b class="text-slate-900">KoalaShip Warehouse</b>');
    }

    // Update loop
    const interval = setInterval(() => {
        updateMarkers();
    }, 1000);

    updateMarkers(); // initial

    return () => clearInterval(interval);
  });
  
  $effect(() => {
      // Re-run setMapTiles if theme changes
      if (themeState.current && map) {
          setMapTiles();
      }
  });

  function setMapTiles() {
      if (!map) return;
      if (currentTileLayer) {
          map.removeLayer(currentTileLayer);
      }
      
      const isDark = themeState.current === 'dark';
      const url = isDark 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
          
      currentTileLayer = L.tileLayer(url, {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 20
      }).addTo(map);
  }

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
                .bindPopup(`<b class="text-slate-900">Paket: ${order.id.split('-')[0]}</b><br/><span class="text-slate-600">Status: ${order.status}</span>`);
        }
    }
  }
</script>

<div class="space-y-6 flex flex-col h-[80vh]">
  <div class="flex items-center justify-between mb-2">
    <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('nav.map')}</h2>
  </div>

  <div class="flex-1 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg relative z-0 bg-slate-100 dark:bg-slate-900">
    <div bind:this={mapContainer} class="w-full h-full"></div>
  </div>
</div>
