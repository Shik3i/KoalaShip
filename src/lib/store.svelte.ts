import { type UserProfile, type JobPreset as Job, type Product, type Order, type LatLng } from './types';
import { notify } from './notifications.svelte';
import { playTone } from './sound';

const MAX_STORED_ORDERS = 50;

function loadState<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
}

function saveState() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('koala_user', JSON.stringify(user));
    const compactOrders = orders.slice(-MAX_STORED_ORDERS).map(({ routePolyline: _route, ...order }) => order);
    localStorage.setItem('koala_orders', JSON.stringify(compactOrders));
}

export function exportGameState() {
    const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        user: JSON.parse(JSON.stringify(user)),
        orders: orders.slice(-MAX_STORED_ORDERS).map(({ routePolyline: _route, ...order }) => order),
        preferences: {
            locale: localStorage.getItem('koala_locale'),
            theme: localStorage.getItem('koala_theme'),
            sound: localStorage.getItem('koala_sound')
        }
    };
    return JSON.stringify(payload, null, 2);
}

export function importGameState(raw: string) {
    const payload = JSON.parse(raw) as {
        version?: number;
        user?: UserProfile;
        orders?: Order[];
        preferences?: Record<string, string | null>;
    };
    if (payload.version !== 1 || !payload.user || !Array.isArray(payload.orders)) {
        throw new Error('Ungültige KoalaShip-Sicherung.');
    }
    Object.assign(user, payload.user);
    orders.splice(0, orders.length, ...payload.orders.slice(-MAX_STORED_ORDERS));
    if (payload.preferences?.locale) localStorage.setItem('koala_locale', payload.preferences.locale);
    if (payload.preferences?.theme) localStorage.setItem('koala_theme', payload.preferences.theme);
    if (payload.preferences?.sound) localStorage.setItem('koala_sound', payload.preferences.sound);
    saveState();
    notify('Spielstand importiert', 'Die Seite wird neu geladen.', 'success');
}

export const jobPresets: Job[] = [
    { id: 'j_1', title: 'Minijobber (Kisten stapeln)', salary: 500, interval: 'MONTHLY' },
    { id: 'j_2', title: 'Junior Frontend Dev', salary: 3200, interval: 'MONTHLY' },
    { id: 'j_3', title: 'Senior Backend Architekt', salary: 8500, interval: 'MONTHLY' },
    { id: 'j_4', title: 'CEO (KoalaShip)', salary: 25000, interval: 'MONTHLY' },
    { id: 'j_5', title: 'Eukalyptus-Influencer', salary: 15000, interval: 'WEEKLY' }
];

export const user = $state<UserProfile>(loadState('koala_user', {
    name: null,
    occupation: null,
    lastSalaryPayment: null,
    homeLocation: null,
    warehouseLocation: null,
    balance: 0,
    mode: 'DEMO',
    xp: 0,
    wishlist: [],
    roomItems: [],
    returnedOrderIds: []
}));

user.xp ??= 0;
user.wishlist ??= [];
user.roomItems ??= [];
user.returnedOrderIds ??= [];
user.bio ??= '';
user.jobDescription ??= '';
user.pronouns ??= '';
user.favoriteCategory ??= 'EVERYDAY';
user.deliveryNote ??= '';
user.avatarColor ??= '#4f46e5';

export function getPlayerLevel() {
    return Math.floor((user.xp ?? 0) / 100) + 1;
}

export function getActiveShopEvent() {
    return [
        { name: 'Alltags-Woche', category: 'EVERYDAY', discount: 0.15 },
        { name: 'Luxus-Lounge', category: 'LUXURY', discount: 0.1 },
        { name: 'Absurder Samstag', category: 'ABSURD', discount: 0.2 }
    ][Math.floor(Date.now() / 86400000) % 3];
}

export function getProductPrice(product: Product) {
    const event = getActiveShopEvent();
    return product.category === event.category ? Math.round(product.price * (1 - event.discount)) : product.price;
}

export function toggleWishlist(productId: string) {
    const list = user.wishlist!;
    const index = list.indexOf(productId);
    index >= 0 ? list.splice(index, 1) : list.push(productId);
    saveState();
}

export function toggleRoomItem(productId: string) {
    const room = user.roomItems!;
    const index = room.indexOf(productId);
    index >= 0 ? room.splice(index, 1) : room.length < 8 && room.push(productId);
    saveState();
}

export function returnOrder(orderId: string, score: number) {
    const order = orders.find(item => item.id === orderId);
    if (!order || order.status !== 'OPENED' || user.returnedOrderIds!.includes(orderId)) return false;
    const product = products.find(item => item.id === (order.revealedProductId || order.productId));
    if (!product) return false;
    const refund = Math.round(getProductPrice(product) * (0.65 + Math.min(score, 100) / 500));
    user.balance += refund;
    user.returnedOrderIds!.push(orderId);
    user.roomItems = user.roomItems!.filter(id => id !== product.id);
    user.xp = (user.xp ?? 0) + 20;
    notify('Retoure abgeschlossen', `${refund.toLocaleString('de-DE')} KC wurden gutgeschrieben.`, 'success');
    saveState();
    return true;
}

export const products = $state<Product[]>([
    { id: 'p_1', name: 'KoalaPad Pro Max', price: 1200, category: 'LUXURY', imageUrl: '📱', rating: 4.8, reviews: [{author: 'TechGuru', text: 'Bestes Tablet, mein Koala wischt stundenlang.', rating: 5}, {author: 'Hater99', text: 'Akku hält nur 20 Stunden.', rating: 4}] },
    { id: 'p_2', name: 'Noise-Cancelling Eukalyptus', price: 350, category: 'EVERYDAY', imageUrl: '🎧', rating: 4.5, reviews: [{author: 'Sleepy', text: 'Endlich Ruhe beim Kauen.', rating: 5}] },
    { id: 'p_3', name: 'Smartwatch (Knetmasse Edition)', price: 4500, category: 'LUXURY', imageUrl: '⌚', rating: 3.2, reviews: [{author: 'RolexFan', text: 'Sieht täuschend echt aus.', rating: 4}, {author: 'RegenOpfer', text: 'Ist im Regen geschmolzen.', rating: 1}] },
    { id: 'p_4', name: 'Dose frische Luft (Alpen)', price: 80, category: 'ABSURD', imageUrl: '💨', rating: 4.9, reviews: [{author: 'BreathIn', text: 'Schmeckt nach Bergen.', rating: 5}] },
    { id: 'p_5', name: 'Standard-Toilettenpapier', price: 5, category: 'EVERYDAY', imageUrl: '🧻', rating: 4.0, reviews: [{author: 'Kunde', text: 'Tut was es soll.', rating: 4}] },
    { id: 'p_6', name: 'Cyber-Implantat (defekt)', price: 15000, category: 'LUXURY', imageUrl: '🦾', rating: 2.1, reviews: [{author: 'Edgerunner', text: 'Zuckt manchmal unkontrolliert.', rating: 2}] },
    { id: 'p_7', name: 'Eigene Raumstation (Orbital)', price: 2500000, category: 'ABSURD', imageUrl: '🛰️', rating: 5.0, reviews: [{author: 'Elon M.', text: 'Gutes Preis-Leistungs-Verhältnis.', rating: 5}, {author: 'Astronaut', text: 'Etwas zugig im Bad.', rating: 4}] },
    { id: 'p_8', name: 'Gaming-Stuhl (RGB)', price: 400, category: 'EVERYDAY', imageUrl: '🪑', rating: 4.6, reviews: [{author: 'GamerGirl', text: 'Leuchtet in 16 Mio Farben.', rating: 5}] },
    { id: 'p_9', name: 'Virtueller NFT Koala', price: 8000, category: 'ABSURD', imageUrl: '🖼️', rating: 1.0, reviews: [{author: 'CryptoBro', text: 'To the moon! (Wert ist auf 0 gefallen)', rating: 1}] }
]);

products.push({
    id: 'p_mystery_gold',
    name: 'Gold Mystery Box',
    price: 750,
    category: 'MYSTERY',
    imageUrl: '🎁',
    rating: 4.9,
    reviews: [{ author: 'LuckyLeaf', text: 'Die Spannung war fast besser als der Inhalt.', rating: 5 }]
});

export const orders = $state<Order[]>(loadState('koala_orders', []));

export function getAchievements() {
    return [
        { id: 'first_order', title: 'Erste Beute', description: 'Erste Bestellung aufgegeben', unlocked: orders.length >= 1 },
        { id: 'collector', title: 'Sammler', description: 'Fünf Pakete geöffnet', unlocked: orders.filter(order => order.status === 'OPENED').length >= 5 },
        { id: 'wishlist', title: 'Große Pläne', description: 'Drei Sparziele gesetzt', unlocked: (user.wishlist?.length ?? 0) >= 3 },
        { id: 'room', title: 'Innenarchitekt', description: 'Drei Dinge im Zimmer ausgestellt', unlocked: (user.roomItems?.length ?? 0) >= 3 },
        { id: 'returns', title: 'Passt doch nicht', description: 'Eine Retoure abgeschlossen', unlocked: (user.returnedOrderIds?.length ?? 0) >= 1 }
    ];
}

// OSRM Fetcher
export async function fetchOsrmRoute(start: LatLng, end: LatLng): Promise<LatLng[] | null> {
    try {
        const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
        const url = `/api/route/${coordinates}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            // OSRM returns [lng, lat], Leaflet wants [lat, lng]
            return data.routes[0].geometry.coordinates.map((coord: number[]) => ({
                lat: coord[1],
                lng: coord[0]
            }));
        }
        return null;
    } catch (e) {
        console.error("Failed to fetch OSRM route:", e);
        return null;
    }
}

export interface ProfileDetails {
    bio: string;
    jobDescription: string;
    pronouns: string;
    favoriteCategory: UserProfile['favoriteCategory'];
    deliveryNote: string;
    avatarColor: string;
}

export function updateProfile(details: ProfileDetails) {
    Object.assign(user, details);
    saveState();
    notify('Profil gespeichert', 'Deine KoalaShip-Karte wurde aktualisiert.', 'success');
}

export function completeOnboarding(name: string, job: Job, homeLat: number, homeLng: number, details: ProfileDetails) {
    user.name = name;
    user.occupation = job;
    user.homeLocation = { lat: homeLat, lng: homeLng };
    
    // Generate warehouse roughly 15km away
    const angle = Math.random() * Math.PI * 2;
    const distanceDegree = 15 / 111; // ~15km in degrees
    user.warehouseLocation = {
        lat: homeLat + Math.cos(angle) * distanceDegree,
        lng: homeLng + Math.sin(angle) * distanceDegree
    };
    Object.assign(user, details);
    
    // Starting Capital (5000 KC) as requested
    user.balance = 5000;
    user.lastSalaryPayment = Date.now();
    saveState();
}

export function switchMode() {
    user.mode = user.mode === 'DEMO' ? 'REAL' : 'DEMO';
    saveState();
}

export function purchaseProduct(productId: string, isExpress: boolean = false): boolean {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    
    const totalCost = getProductPrice(product) + (isExpress ? 50 : 0);
    if (user.balance < totalCost) {
        notify('Kauf abgelehnt', 'Dein Guthaben reicht noch nicht. Schulden gibt es hier nicht.', 'warning');
        return false;
    }

    user.balance -= totalCost;
    user.xp = (user.xp ?? 0) + 15;

    const now = Date.now();
    const isDemo = user.mode === 'DEMO';
    let delay = isDemo ? 60 * 1000 : 2 * 24 * 60 * 60 * 1000; // Demo: 1 Min, Real: 2 Days
    
    if (isExpress) {
        delay = delay / 2;
    }

    const startMessages = [
        'Bestellung aufgegeben. Warten auf internationale Abfertigung.',
        'Zahlung autorisiert. Paket wird im Übersee-Lager gesucht.',
        'Auftrag an Logistikpartner im Fern-Transit übergeben.'
    ];
    const randomStartMsg = startMessages[Math.floor(Math.random() * startMessages.length)];

    const newOrder: Order = {
        id: crypto.randomUUID(),
        productId,
        orderDate: now,
        status: 'TRANSIT',
        mode: user.mode,
        deliveryEta: now + delay,
        startLocation: user.warehouseLocation ? { ...user.warehouseLocation } : undefined,
        isExpress,
        trackingSteps: [
            { timestamp: now, message: randomStartMsg }
        ]
    };

    orders.push(newOrder);
    if (orders.length > MAX_STORED_ORDERS) orders.splice(0, orders.length - MAX_STORED_ORDERS);
    saveState();
    notify('Bestellung bestätigt', `${product.name} ist unterwegs.`, 'success');
    playTone('purchase');
    return true;
}

export function openPackage(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    if (order && order.status === 'DELIVERED') {
        if (order.productId === 'p_mystery_gold') {
            const possibleProducts = products.filter(product => product.category !== 'MYSTERY');
            order.revealedProductId = possibleProducts[Math.floor(Math.random() * possibleProducts.length)]?.id;
        }
        order.status = 'OPENED';
        const inventoryId = order.revealedProductId || order.productId;
        if (!user.roomItems!.includes(inventoryId) && user.roomItems!.length < 8) user.roomItems!.push(inventoryId);
        user.xp = (user.xp ?? 0) + 25;
        order.trackingSteps.push({
            timestamp: Date.now(),
            message: '🎁 D O P A M I N E   R E L E A S E D !'
        });
        saveState();
        playTone('reveal');
    }
}

export function resetUser() {
    user.name = null;
    user.occupation = null;
    user.balance = 0;
    user.lastSalaryPayment = null;
    user.homeLocation = null;
    user.warehouseLocation = null;
    orders.splice(0, orders.length);
    saveState();
}

export function initTicker() {
    if (typeof window === 'undefined') return;

    setInterval(async () => {
        const now = Date.now();
        const isDemo = user.mode === 'DEMO';

        // Salary Logic
        if (user.lastSalaryPayment && user.occupation) {
            let intervalMs = 0;
            if (user.occupation.interval === 'WEEKLY') {
                intervalMs = isDemo ? 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
            } else {
                intervalMs = isDemo ? 4 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
            }

            const missedPayments = Math.floor((now - user.lastSalaryPayment) / intervalMs);
            if (missedPayments > 0) {
                const salaryTotal = user.occupation.salary * missedPayments;
                user.balance += salaryTotal;
                user.lastSalaryPayment += intervalMs * missedPayments;
                saveState();
                notify('Gehalt angekommen!', `+${salaryTotal.toLocaleString('de-DE')} KC`, 'success');
                playTone('salary');
            }
        }

        // Delivery Logic (Phase Transitions)
        let stateChanged = false;
        const currentHour = new Date(now).getHours();

        for (const order of orders) {
            if (order.status === 'DELIVERED' || order.status === 'OPENED') continue;

            const totalTime = order.deliveryEta - order.orderDate;
            const elapsed = now - order.orderDate;
            const progress = Math.max(0, Math.min(1, elapsed / totalTime));

            if (progress >= 1) {
                order.status = 'DELIVERED';
                order.trackingSteps.push({
                    timestamp: now,
                    message: 'Erfolgreich zugestellt! Bereit zum Unboxing.'
                });
                notify('Paket zugestellt!', products.find(product => product.id === order.productId)?.name ?? 'Dein Paket ist da.', 'success');
                stateChanged = true;
                continue;
            }

            if (progress >= 0.8 && order.status !== 'OUT_FOR_DELIVERY') {
                if (order.mode === 'REAL' && (currentHour < 8 || currentHour >= 18)) continue;
                order.status = 'OUT_FOR_DELIVERY';
                order.trackingSteps.push({
                    timestamp: now,
                    message: 'In Zustellung. Koala-Kurier ist auf der Route.'
                });
                notify('Nur noch wenige Stopps', 'Dein Paket ist jetzt in Zustellung.', 'info');
                stateChanged = true;
                continue;
            }

            if (progress >= 0.35 && !order.deliveryEvent) {
                const events = [
                    'Gratis Express-Upgrade: Der Kurier kennt eine Abkürzung.',
                    'Eukalyptus-Pause beendet: Das Paket ist wieder unterwegs.',
                    'Perfektes Wetter: Die Zustellung läuft besonders glatt.'
                ];
                order.deliveryEvent = events[Math.floor(Math.random() * events.length)];
                order.deliveryEta -= Math.min(totalTime * 0.08, 60 * 60 * 1000);
                order.trackingSteps.push({ timestamp: now, message: order.deliveryEvent });
                notify('Lieferereignis', order.deliveryEvent, 'info');
                stateChanged = true;
            }

            // Phase 1: Transit (0% - 60%)
            if (order.status === 'TRANSIT') {
                if (progress >= 0.6) {
                    order.status = 'LOCAL_SORTING';
                    order.trackingSteps.push({
                        timestamp: now,
                        message: 'Im lokalen KoalaShip Verteilzentrum eingetroffen. Wird sortiert.'
                    });
                    stateChanged = true;
                }
            }
            
            // Phase 2: Local Sorting (60% - 80%)
            else if (order.status === 'LOCAL_SORTING') {
                if (progress >= 0.8) {
                    // Check working hours (only in REAL mode)
                    if (order.mode === 'REAL' && (currentHour < 8 || currentHour >= 18)) {
                        // Delay ETA by 1 hour until we hit working hours
                        order.deliveryEta += 60 * 60 * 1000;
                    } else {
                        order.status = 'OUT_FOR_DELIVERY';
                        order.trackingSteps.push({
                            timestamp: now,
                            message: 'In Zustellung. Koala-Kurier ist auf der Route.'
                        });
                        stateChanged = true;
                        
                        // Fetch OSRM Route asynchronously
                        if (!order.routePolyline && user.warehouseLocation && user.homeLocation) {
                            fetchOsrmRoute(user.warehouseLocation, user.homeLocation).then(route => {
                                if (route) {
                                    order.routePolyline = route;
                                    saveState();
                                }
                            });
                        }
                    }
                }
            }
            
            // Phase 3: Out for Delivery (80% - 100%)
            else if (order.status === 'OUT_FOR_DELIVERY') {
                if (now >= order.deliveryEta) {
                    order.status = 'DELIVERED';
                    order.trackingSteps.push({
                        timestamp: now,
                        message: 'Erfolgreich zugestellt! Bereit zum Unboxing.'
                    });
                    stateChanged = true;
                }
            }
        }

        if (stateChanged) saveState();
    }, 1000);
}
