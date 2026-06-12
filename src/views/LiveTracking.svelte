<script lang="ts">
  import { onMount } from 'svelte';
  import { orders, user, fetchOsrmRoute, carriers } from '../lib/store.svelte';
  import { t } from '../lib/i18n.svelte';
  import { themeState } from '../lib/theme.svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { LatLng, Order } from '../lib/types';

  let mapContainer: HTMLElement | undefined = $state();
  let map: L.Map | undefined;
  
  let truckMarkers: Record<string, L.Marker> = {};
  let polylines: Record<string, L.Polyline> = {};
  let currentTileLayer: L.TileLayer | null = null;
  
  let activeOrderCount = $state(0);
  let deliveryOrders = $derived(orders.filter(order => order.status === 'OUT_FOR_DELIVERY'));

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

  function getCarrierIcon(logo: string, color: string, count: number) {
      return L.divIcon({
        className: 'custom-carrier-icon',
        html: `<div class="relative transform -scale-x-100" style="font-size: 24px; text-shadow: 0 0 5px rgba(0,0,0,0.3); background: white; border: 2px solid ${color}; border-radius: 50%; padding: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                ${logo}
                ${count > 1 ? `<span class="absolute -top-2 -right-2 transform scale-x-[-1] bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">${count}</span>` : ''}
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
  }

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
         .bindPopup('<b class="text-slate-900">Zentrales Verteilzentrum</b>');
    }

    const interval = setInterval(() => {
        updateTracking();
    }, 1000);

    updateTracking();
    autoFitBounds();

    return () => clearInterval(interval);
  });
  
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
          ? '/api/tiles/dark/{z}/{x}/{y}.png'
          : '/api/tiles/light/{z}/{x}/{y}.png';
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
    const activeOrders = orders.filter(o => o.status === 'LOCAL_SORTING' || o.status === 'OUT_FOR_DELIVERY');
    activeOrderCount = activeOrders.length;

    // Group by carrierId
    const carrierGroups: Record<string, Order[]> = {};
    for (const order of activeOrders) {
        const cId = order.carrierId || 'koala_express';
        if (!carrierGroups[cId]) carrierGroups[cId] = [];
        carrierGroups[cId].push(order);
    }

    const activeCarrierIds = Object.keys(carrierGroups);
    for (const id in truckMarkers) {
        if (!activeCarrierIds.includes(id)) {
            map.removeLayer(truckMarkers[id]);
            delete truckMarkers[id];
        }
    }
    for (const id in polylines) {
        if (!activeCarrierIds.includes(id) || !carrierGroups[id].some(o => o.status === 'OUT_FOR_DELIVERY')) {
            map.removeLayer(polylines[id]);
            delete polylines[id];
        }
    }

    for (const cId of activeCarrierIds) {
        const group = carrierGroups[cId];
        const carrier = carriers.find(c => c.id === cId)!;
        
        // Take the order with the furthest progress or first one
        const representativeOrder = group.find(o => o.status === 'OUT_FOR_DELIVERY') || group[0];
        if (!user.warehouseLocation) continue;

        let currentPos = representativeOrder.startLocation || user.warehouseLocation;

        if (representativeOrder.status === 'OUT_FOR_DELIVERY') {
            const totalTime = representativeOrder.deliveryEta - representativeOrder.orderDate;
            const phaseStartTime = representativeOrder.orderDate + (totalTime * 0.8);
            const phaseDuration = totalTime * 0.2;
            const elapsedInPhase = now - phaseStartTime;
            const progress = Math.max(0, Math.min(1, elapsedInPhase / phaseDuration));

            if (representativeOrder.routePolyline && representativeOrder.routePolyline.length > 0) {
                if (!polylines[cId]) {
                    polylines[cId] = L.polyline(representativeOrder.routePolyline.map(p => [p.lat, p.lng]), {
                        color: carrier.color,
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 10'
                    }).addTo(map);
                }
                currentPos = getPositionAlongPolyline(representativeOrder.routePolyline, progress);
            } else if (user.homeLocation) {
                currentPos = {
                    lat: currentPos.lat + (user.homeLocation.lat - currentPos.lat) * progress,
                    lng: currentPos.lng + (user.homeLocation.lng - currentPos.lng) * progress
                };
            }
        }

        if (truckMarkers[cId]) {
            truckMarkers[cId].setLatLng([currentPos.lat, currentPos.lng]);
            truckMarkers[cId].setIcon(getCarrierIcon(carrier.logo, carrier.color, group.length));
        } else {
            truckMarkers[cId] = L.marker([currentPos.lat, currentPos.lng], { icon: getCarrierIcon(carrier.logo, carrier.color, group.length) })
                .addTo(map)
                .bindPopup(`<b class="text-slate-900">${carrier.name}</b><br/><span class="text-slate-600 text-xs">Liefert ${group.length} Paket(e)</span>`);
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
  {#if deliveryOrders.length}
    <div class="grid gap-3 sm:grid-cols-2">
      {#each deliveryOrders as order}
        <div class="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950">
          <div class="flex justify-between"><strong>Paket {order.id.split('-')[0]}</strong><span class="font-black text-indigo-600">{order.estimatedStops === 0 ? 'Kurier in der Nähe' : `ca. ${order.estimatedStops ?? 12} Stopps`}</span></div>
          <p class="mt-1 text-sm">Zeitfenster: {new Date(order.deliveryEta - 30 * 60 * 1000).toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'})}–{new Date(order.deliveryEta + 30 * 60 * 1000).toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'})}</p>
          <p class="mt-1 text-xs text-slate-500">Letzte Aktualisierung: {new Date(order.lastTrackingUpdate ?? Date.now()).toLocaleTimeString('de-DE')}</p>
        </div>
      {/each}
    </div>
  {/if}

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
