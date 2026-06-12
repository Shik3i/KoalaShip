<script lang="ts">
  import { onMount } from 'svelte';
  import { orders, user, fetchOsrmRoute } from '../lib/store.svelte';
  import { t } from '../lib/i18n.svelte';
  import { themeState } from '../lib/theme.svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { LatLng } from '../lib/types';

  let mapContainer: HTMLElement | undefined = $state();
  let map: L.Map | undefined;
  
  let truckMarkers: Record<string, L.Marker> = {};
  let polylines: Record<string, L.Polyline> = {};
  let currentTileLayer: L.TileLayer | null = null;
  
  let activeOrderCount = $state(0);

  const koalaIcon = L.divIcon({
    className: 'custom-koala-icon',
    html: '<div class="transform -scale-x-100" style="font-size: 24px; text-shadow: 0 0 5px rgba(0,0,0,0.3); background: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🐨</div>',
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
    const center = user.homeLocation || { lat: 51.165691, lng: 10.451526 };
    map = L.map(mapContainer as HTMLElement, { zoomControl: false }).setView([center.lat, center.lng], 12);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    setMapTiles();

    if (user.homeLocation) {
        L.marker([user.homeLocation.lat, user.homeLocation.lng], { icon: homeIcon })
         .addTo(map)
         .bindPopup('<b class="text-slate-900">Deine Homebase</b>');
    }
    if (user.warehouseLocation) {
        L.marker([user.warehouseLocation.lat, user.warehouseLocation.lng], { icon: warehouseIcon })
         .addTo(map)
         .bindPopup('<b class="text-slate-900">Lokales KoalaShip Verteilzentrum</b>');
    }

    const interval = setInterval(() => {
        updateTracking();
    }, 1000);

    updateTracking();
    autoFitBounds();
    loadRoutes();

    return () => clearInterval(interval);
  });

  async function loadRoutes() {
      if (!user.warehouseLocation || !user.homeLocation) return;
      const activeOrders = orders.filter(order => order.status === 'OUT_FOR_DELIVERY' && !order.routePolyline);
      if (activeOrders.length === 0) return;
      const route = await fetchOsrmRoute(user.warehouseLocation, user.homeLocation);
      if (route) activeOrders.forEach(order => order.routePolyline = route);
  }
  
  $effect(() => {
      if (themeState.current && map) {
          setMapTiles();
      }
  });

  function setMapTiles() {
      if (!map) return;
      if (currentTileLayer) map.removeLayer(currentTileLayer);
      const isDark = themeState.current === 'dark';
      const url = isDark 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      currentTileLayer = L.tileLayer(url, {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 20
      }).addTo(map);
  }

  function autoFitBounds() {
      if (!map || !user.homeLocation || !user.warehouseLocation) return;
      const bounds = L.latLngBounds([
          [user.homeLocation.lat, user.homeLocation.lng],
          [user.warehouseLocation.lat, user.warehouseLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }

  // Calculate position along a polyline given a progress 0..1
  function getPositionAlongPolyline(points: LatLng[], progress: number): LatLng {
      if (points.length === 0) return {lat: 0, lng: 0};
      if (points.length === 1) return points[0];
      if (progress <= 0) return points[0];
      if (progress >= 1) return points[points.length - 1];

      let totalDist = 0;
      const dists = [];
      for (let i = 0; i < points.length - 1; i++) {
          if (!map) return points[0];
          const d = map.distance([points[i].lat, points[i].lng], [points[i+1].lat, points[i+1].lng]);
          dists.push(d);
          totalDist += d;
      }

      const targetDist = totalDist * progress;
      let currDist = 0;

      for (let i = 0; i < dists.length; i++) {
          if (currDist + dists[i] >= targetDist) {
              // Found the segment
              const segmentProgress = (targetDist - currDist) / dists[i];
              const lat = points[i].lat + (points[i+1].lat - points[i].lat) * segmentProgress;
              const lng = points[i].lng + (points[i+1].lng - points[i].lng) * segmentProgress;
              return { lat, lng };
          }
          currDist += dists[i];
      }
      return points[points.length - 1];
  }

  function updateTracking() {
    if (!map) return;
    
    const now = Date.now();
    // Only show LOCAL_SORTING (at warehouse) and OUT_FOR_DELIVERY (moving)
    const activeOrders = orders.filter(o => o.status === 'LOCAL_SORTING' || o.status === 'OUT_FOR_DELIVERY');
    activeOrderCount = activeOrders.length;

    const activeIds = activeOrders.map(o => o.id);
    for (const id in truckMarkers) {
        if (!activeIds.includes(id)) {
            map.removeLayer(truckMarkers[id]);
            delete truckMarkers[id];
        }
    }
    for (const id in polylines) {
        if (!activeIds.includes(id) || orders.find(o=>o.id===id)?.status !== 'OUT_FOR_DELIVERY') {
            map.removeLayer(polylines[id]);
            delete polylines[id];
        }
    }

    for (const order of activeOrders) {
        if (!user.warehouseLocation) continue;

        let currentPos = user.warehouseLocation; // Default to warehouse

        if (order.status === 'OUT_FOR_DELIVERY') {
            // Phase 3: Out for Delivery (80% -> 100% of total time)
            const totalTime = order.deliveryEta - order.orderDate;
            const phaseStartTime = order.orderDate + (totalTime * 0.8);
            const phaseDuration = totalTime * 0.2;
            const elapsedInPhase = now - phaseStartTime;
            const progress = Math.max(0, Math.min(1, elapsedInPhase / phaseDuration));

            if (order.routePolyline && order.routePolyline.length > 0) {
                // Draw path
                if (!polylines[order.id]) {
                    polylines[order.id] = L.polyline(order.routePolyline.map(p => [p.lat, p.lng]), {
                        color: themeState.current === 'dark' ? '#6366f1' : '#4f46e5',
                        weight: 4,
                        opacity: 0.6,
                        dashArray: '10, 10'
                    }).addTo(map);
                }
                // Move along path
                currentPos = getPositionAlongPolyline(order.routePolyline, progress);
            } else if (user.homeLocation) {
                // Fallback direct line
                currentPos = {
                    lat: user.warehouseLocation.lat + (user.homeLocation.lat - user.warehouseLocation.lat) * progress,
                    lng: user.warehouseLocation.lng + (user.homeLocation.lng - user.warehouseLocation.lng) * progress
                };
            }
        }

        // Render Truck
        if (truckMarkers[order.id]) {
            truckMarkers[order.id].setLatLng([currentPos.lat, currentPos.lng]);
        } else {
            truckMarkers[order.id] = L.marker([currentPos.lat, currentPos.lng], { icon: koalaIcon })
                .addTo(map)
                .bindPopup(`<b class="text-slate-900">Paket: ${order.id.split('-')[0]}</b><br/><span class="text-slate-600 text-xs">Status: ${order.status}</span>`);
        }
    }
  }
</script>

<div class="space-y-6 flex flex-col h-[80vh]">
  <div class="flex items-center justify-between mb-2">
    <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('nav.map')}</h2>
    {#if activeOrderCount > 0}
        <button onclick={autoFitBounds} class="text-xs font-bold px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 transition-colors">
            Ansicht zentrieren
        </button>
    {/if}
  </div>

  <div class="flex-1 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg relative z-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
    
    {#if activeOrderCount === 0}
        <div class="absolute z-10 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <span class="text-6xl mb-4 opacity-50 grayscale">📡</span>
            <h3 class="text-xl font-bold text-slate-700 dark:text-slate-300">Radar sucht nach Frequenzen...</h3>
            <p class="text-slate-500 text-sm mt-2 max-w-md">Aktuell befinden sich keine Pakete in der lokalen Auslieferung. Wenn Pakete aus dem Übersee-Lager in unserem lokalen Verteilzentrum (15km) eintreffen, tauchen sie hier auf.</p>
        </div>
        <div class="w-full h-full opacity-30 pointer-events-none" bind:this={mapContainer}></div>
    {:else}
        <div class="w-full h-full" bind:this={mapContainer}></div>
    {/if}

  </div>
</div>
