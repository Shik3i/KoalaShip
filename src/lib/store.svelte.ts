import { type UserProfile, type JobPreset as Job, type Product, type Order, type LatLng } from './types';

function loadState<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
}

function saveState() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('koala_user', JSON.stringify(user));
    localStorage.setItem('koala_orders', JSON.stringify(orders));
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
    mode: 'DEMO'
}));

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

export const orders = $state<Order[]>(loadState('koala_orders', []));

// OSRM Fetcher
async function fetchOsrmRoute(start: LatLng, end: LatLng): Promise<LatLng[] | null> {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
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

export function completeOnboarding(name: string, job: Job, homeLat: number, homeLng: number) {
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
    
    // Starting Capital (5000 KC) as requested
    user.balance = 5000;
    user.lastSalaryPayment = Date.now();
    saveState();
}

export function switchMode() {
    user.mode = user.mode === 'DEMO' ? 'REAL' : 'DEMO';
    saveState();
}

export function purchaseProduct(productId: string, isExpress: boolean = false) {
    const product = products.find(p => p.id === productId);
    if (!product) return console.error('Produkt nicht gefunden');
    
    const totalCost = product.price + (isExpress ? 50 : 0);
    if (user.balance < totalCost) return console.warn('Nicht genug KoalaCoins!');

    user.balance -= totalCost;

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
    saveState();
}

export function openPackage(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    if (order && order.status === 'DELIVERED') {
        order.status = 'OPENED';
        order.trackingSteps.push({
            timestamp: Date.now(),
            message: '🎁 D O P A M I N E   R E L E A S E D !'
        });
        saveState();
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

            if (now - user.lastSalaryPayment >= intervalMs) {
                user.balance += user.occupation.salary;
                user.lastSalaryPayment = now;
                saveState();
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
