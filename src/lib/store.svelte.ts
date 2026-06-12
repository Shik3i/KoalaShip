import type { UserProfile, Product, Order } from './types';

// ==========================================
// STATE
// ==========================================

export const user = $state<UserProfile>({
    mode: 'DEMO',
    balance: 1000,
    incomeRate: 10
});

export const products = $state<Product[]>([
    { id: 'p_1', name: 'Rolex aus Knetmasse', price: 5000, category: 'LUXURY', imageUrl: 'https://placehold.co/100x100/FFD700/FFFFFF?text=Rolex' },
    { id: 'p_2', name: 'Eine Dose frische Luft', price: 50, category: 'ABSURD', imageUrl: 'https://placehold.co/100x100/87CEEB/FFFFFF?text=Luft' },
    { id: 'p_3', name: 'Standard-Toilettenpapier', price: 5, category: 'EVERYDAY', imageUrl: 'https://placehold.co/100x100/FFFFFF/000000?text=TP' }
]);

export const orders = $state<Order[]>([]);

// ==========================================
// ACTIONS
// ==========================================

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

    // Geld abziehen
    user.balance -= product.price;

    const now = Date.now();
    const isDemo = user.mode === 'DEMO';
    // Demo: 30 Sekunden ETA. Real: 2 Tage (Beispiel)
    const delay = isDemo ? 30 * 1000 : 2 * 24 * 60 * 60 * 1000;

    const newOrder: Order = {
        id: crypto.randomUUID(),
        productId,
        orderDate: now,
        status: 'PROCESSING',
        mode: user.mode,
        deliveryEta: now + delay,
        trackingSteps: [
            { timestamp: now, message: 'Paket wird vom Koala-Kurier sorgfältig verpackt. 🐨' }
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

const STORAGE_KEY = 'koalaship_v1';

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

        // 1. Idle Income
        if (user.incomeRate > 0) {
            user.balance += user.incomeRate;
            stateChanged = true;
        }

        // 2. Logistik simulieren
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
                        order.status = 'SHIPPED';
                        order.trackingSteps.push({
                            timestamp: now,
                            message: "Lieferant Sven ist im Kreis gefahren, aber nun endlich auf dem Weg zu dir."
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
