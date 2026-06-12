import type { UserProfile, Product, Order, JobPreset, LatLng } from './types';

// ==========================================
// PRESETS
// ==========================================

export const jobPresets: JobPreset[] = [
    { id: 'job_1', title: 'Minijobber', salary: 520, interval: 'WEEKLY' },
    { id: 'job_2', title: 'Junior Dev', salary: 3200, interval: 'MONTHLY' },
    { id: 'job_3', title: 'Senior 10x Rockstar', salary: 12500, interval: 'MONTHLY' },
    { id: 'job_4', title: 'Koala-Influencer', salary: 25000, interval: 'MONTHLY' }
];

// ==========================================
// STATE
// ==========================================

export const user = $state<UserProfile>({
    name: null,
    occupation: null,
    lastSalaryPayment: null,
    homeLocation: null,
    warehouseLocation: null,
    mode: 'DEMO',
    balance: 0,
    incomeRate: 0 // deprecated
});

export const products = $state<Product[]>([
    { id: 'p_1', name: 'Rolex aus Knetmasse', price: 5000, category: 'LUXURY', imageUrl: '⌚' },
    { id: 'p_2', name: 'Eine Dose frische Luft', price: 50, category: 'ABSURD', imageUrl: '💨' },
    { id: 'p_3', name: 'Standard-Toilettenpapier', price: 5, category: 'EVERYDAY', imageUrl: '🧻' },
    { id: 'p_4', name: 'Cyberpunk Implantat (defekt)', price: 15000, category: 'LUXURY', imageUrl: '🦾' },
    { id: 'p_5', name: 'Premium Eukalyptus', price: 200, category: 'EVERYDAY', imageUrl: '🌿' }
]);

export const orders = $state<Order[]>([]);

// ==========================================
// ACTIONS
// ==========================================

export function resetUser() {
    user.name = null;
    user.occupation = null;
    user.lastSalaryPayment = null;
    user.homeLocation = null;
    user.warehouseLocation = null;
    user.balance = 0;
    orders.splice(0, orders.length);
    saveState();
}

export function completeOnboarding(name: string, job: JobPreset, homeLat: number, homeLng: number) {
    user.name = name;
    user.occupation = job;
    user.homeLocation = { lat: homeLat, lng: homeLng };
    
    // Generate warehouse 15km away roughly (1 degree is ~111km)
    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const distanceDegree = 15 / 111; 
    user.warehouseLocation = {
        lat: homeLat + Math.cos(angle) * distanceDegree,
        lng: homeLng + Math.sin(angle) * distanceDegree
    };
    
    // Initial salary payout
    user.balance = job.salary;
    user.lastSalaryPayment = Date.now();
    saveState();
}

export function addFunds(amount: number) {
    if (amount <= 0) return;
    user.balance += amount;
    saveState();
}

export function switchMode() {
    user.mode = user.mode === 'DEMO' ? 'REAL' : 'DEMO';
    saveState();
}

export function purchaseProduct(productId: string) {
    const product = products.find(p => p.id === productId);
    if (!product) return console.error('Produkt nicht gefunden');
    if (user.balance < product.price) return console.warn('Nicht genug Dopamin-Coins!');

    user.balance -= product.price;

    const now = Date.now();
    const isDemo = user.mode === 'DEMO';
    const delay = isDemo ? 30 * 1000 : 2 * 24 * 60 * 60 * 1000;

    const startMessages = [
        'Der Koala-Kurier hat dein Paket mit Premium-Blättern poliert.',
        'Paket wurde im System erfasst – der Hamster im Laufrad gibt alles!',
        'Ein Eukalyptus-Experte schnürt dein Paket gerade liebevoll zusammen.',
        'Das Dopamin-Kontingent wurde reserviert. Dein Paket wird verpackt.'
    ];
    const randomStartMsg = startMessages[Math.floor(Math.random() * startMessages.length)];

    const newOrder: Order = {
        id: crypto.randomUUID(),
        productId,
        orderDate: now,
        status: 'PROCESSING',
        mode: user.mode,
        deliveryEta: now + delay,
        startLocation: user.warehouseLocation ? { ...user.warehouseLocation } : undefined,
        trackingSteps: [
            { timestamp: now, message: randomStartMsg }
        ]
    };

    orders.push(newOrder);
    saveState();
}

export function openPackage(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (order.status === 'DELIVERED') {
        order.status = 'OPENED';
        order.trackingSteps.push({
            timestamp: Date.now(),
            message: 'DOPAMINE RELEASED! 💥✨'
        });
        saveState();
    }
}

// ==========================================
// PERSISTENZ & BACKGROUND TICKER
// ==========================================

const STORAGE_KEY = 'koalaship_v2';

export function saveState() {
    if (typeof window === 'undefined') return;
    const data = { user, orders };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadState() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.user) Object.assign(user, parsed.user);
            if (parsed.orders) orders.splice(0, orders.length, ...parsed.orders);
        } catch (e) {
            console.error('Fehler beim Laden des Spielstands', e);
        }
    }
}

function notifyBrowser(message: string) {
    if (typeof Notification !== 'undefined') {
        if (Notification.permission === 'granted') {
            new Notification('KoalaShip Update', { body: message, icon: '/icons/github.svg' });
        }
    }
}

export function initTicker() {
    loadState();
    
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    if (typeof window === 'undefined') return;

    setInterval(() => {
        const now = Date.now();
        let stateChanged = false;

        // 1. Salary Check
        if (user.name && user.occupation && user.lastSalaryPayment) {
            const isDemo = user.mode === 'DEMO';
            let intervalMs = 0;
            
            if (user.occupation.interval === 'WEEKLY') {
                intervalMs = isDemo ? 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // Demo: 1 min
            } else {
                intervalMs = isDemo ? 4 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000; // Demo: 4 min
            }

            if (now - user.lastSalaryPayment >= intervalMs) {
                user.balance += user.occupation.salary;
                user.lastSalaryPayment = now;
                notifyBrowser(`Gehaltszahlung erhalten: ${user.occupation.salary} DC!`);
                stateChanged = true;
            }
        }

        // 2. Logistics Simulation
        for (const order of orders) {
            if (order.status === 'PROCESSING' || order.status === 'SHIPPED') {
                if (now >= order.deliveryEta) {
                    order.status = 'DELIVERED';
                    order.trackingSteps.push({
                        timestamp: now,
                        message: "Dein Paket ist angekommen! Bereit zum Unboxing. 🎁"
                    });
                    notifyBrowser(`Dopamin-Alarm! Dein Paket ist angekommen!`);
                    stateChanged = true;
                } else if (order.status === 'PROCESSING') {
                    const totalDuration = order.deliveryEta - order.orderDate;
                    if ((order.deliveryEta - now) < (totalDuration / 2)) {
                        const shippedMessages = [
                            "Lieferant Sven ist im Kreis gefahren, aber nun endlich auf dem Weg zu dir.",
                            "Das Paket hat den Koala-Schrein passiert und nähert sich schnell.",
                            "Der Kurier hat extra einen Energy-Drink gekippt. Es geht voran!",
                            "Logistik-Update: Paket fliegt quasi durch die Leitung."
                        ];
                        const randomShippedMsg = shippedMessages[Math.floor(Math.random() * shippedMessages.length)];
                        
                        order.status = 'SHIPPED';
                        order.trackingSteps.push({
                            timestamp: now,
                            message: randomShippedMsg
                        });
                        stateChanged = true;
                    }
                }
            }
        }

        if (stateChanged) {
            saveState();
        }
    }, 1000);
}
