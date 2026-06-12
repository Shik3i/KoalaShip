import { i18nState } from './i18n.svelte';
import { getLocalizedProducts, getLocalizedTrackingEvents } from './catalog';
import { type UserProfile, type JobPreset as Job, type Product, type Order, type LatLng, type CartItem, type DeliveryMethod, type Property } from './types';
import { notify } from './notifications.svelte';
import { playTone } from './sound';

const MAX_STORED_ORDERS = 1000;

function loadState<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
}

function saveState() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('koala_user', JSON.stringify(user));
    const compactOrders = orders.slice(-MAX_STORED_ORDERS).map(({ routePolyline: _route, ...order }) => {
        if (order.status === 'OPENED') return { ...order, trackingSteps: [] };
        return order;
    });
    localStorage.setItem('koala_orders', JSON.stringify(compactOrders));
}

export function exportGameState() {
    const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        user: JSON.parse(JSON.stringify(user)),
        orders: orders.slice(-MAX_STORED_ORDERS).map(({ routePolyline: _route, ...order }) => {
            if (order.status === 'OPENED') return { ...order, trackingSteps: [] };
            return order;
        }),
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
    mode: 'REAL',
    xp: 0,
    wishlist: [],
    roomItems: [],
    returnedOrderIds: []
}));

user.xp ??= 0;
user.wishlist ??= [];
user.roomItems ??= [];
user.returnedOrderIds ??= [];
user.favoriteOrderIds ??= [];
user.bio ??= '';
user.jobDescription ??= '';
user.pronouns ??= '';
user.favoriteCategory ??= 'EVERYDAY';
user.deliveryNote ??= '';
user.avatarColor ??= '#4f46e5';
user.cart ??= [];
user.compareIds ??= [];
user.wishlists ??= [{ id: 'wishlist_default', name: 'Meine erste Liste', description: 'Für zukünftige Meilensteine', mood: 'Träumerei', items: [] }];
user.ownedPropertyIds ??= ['property_studio'];
user.activePropertyId ??= 'property_studio';
user.propertyDecor ??= {};
user.equippedOutfit ??= [];
user.featuredVehicleId ??= '';
user.featuredElectronics ??= [];
user.messages ??= [];

export const properties: Property[] = [
    { id: 'property_studio', name: 'Koala-Studio', price: 0, image: '🏠', description: 'Klein, gemütlich und bereits inklusive.', slots: 6, style: 'city' },
    { id: 'property_loft', name: 'Skyline-Loft', price: 18000, image: '🌆', description: 'Offene Fläche mit großen Fenstern und Platz für Technik.', slots: 10, style: 'loft' },
    { id: 'property_house', name: 'Eukalyptus-Haus', price: 42000, image: '🏡', description: 'Ein ruhiges Haus mit mehreren Ausstellungsbereichen.', slots: 14, style: 'nature' },
    { id: 'property_villa', name: 'Koala-Villa', price: 125000, image: '🏛️', description: 'Viel Platz für Luxus, Fahrzeuge und fragwürdige Kunst.', slots: 20, style: 'luxury' }
];

export const carriers: import('./types').Carrier[] = [
    {
        id: 'koala_express',
        name: 'Koala Express',
        logo: '🐨',
        color: '#4f46e5',
        rating: 4.2,
        reliability: 0.95,
        quirks: ['Stets bemüht, aber verschläft oft', 'Klingelt nicht, sondern klopft'],
        trackingMilestones: {
            received: 'Auftragsdaten elektronisch an Koala Express übermittelt.',
            transit: 'Paket ist im gemütlichen Transit.',
            sorting: 'Im lokalen Koala-Verteilzentrum eingetroffen. Wird gemächlich sortiert.',
            outForDelivery: 'Koala-Kurier ist auf der Route. (Könnte einen Snack-Stopp einlegen)',
            delivered: 'Erfolgreich übergeben (oder vor die Tür gelegt).'
        }
    },
    {
        id: 'eucalyptus_logistics',
        name: 'Eucalyptus Logistics',
        logo: '🌿',
        color: '#10b981',
        rating: 4.8,
        reliability: 0.99,
        quirks: ['Sehr zuverlässig', 'Pakete duften nach Minze', 'Fährt E-Bikes'],
        trackingMilestones: {
            received: 'Eco-Auftrag empfangen und digital verbucht.',
            transit: 'Klimaneutraler Transit läuft.',
            sorting: 'Im Green-Sorting-Center angekommen.',
            outForDelivery: 'Eco-Kurier ist auf der finalen (und leisen) Route.',
            delivered: 'Umweltfreundlich zugestellt!'
        }
    },
    {
        id: 'parcel_paws',
        name: 'ParcelPaws',
        logo: '🐾',
        color: '#f59e0b',
        rating: 3.5,
        reliability: 0.85,
        quirks: ['Schnell, aber chaotisch', 'Pakete haben manchmal Bissspuren'],
        trackingMilestones: {
            received: 'Wuff! Auftrag entgegengenommen.',
            transit: 'Rennt schnell über den Hauptlauf!',
            sorting: 'Hundehütte 4 (Verteilzentrum) passiert.',
            outForDelivery: 'Kurier hetzt durch deine Nachbarschaft!',
            delivered: 'Paket über den Zaun geworfen. Wuff!'
        }
    },
    {
        id: 'night_koala',
        name: 'NightKoala Delivery',
        logo: '🦇',
        color: '#8b5cf6',
        rating: 4.5,
        reliability: 0.92,
        quirks: ['Arbeitet nur nach 18 Uhr', 'Sehr leise', 'Wirft Pakete gerne'],
        trackingMilestones: {
            received: 'Die Nachtschicht hat den Auftrag registriert.',
            transit: 'Flug im Schutz der Dunkelheit.',
            sorting: 'In der dunklen Höhle (Verteilzentrum) sortiert.',
            outForDelivery: 'Nacht-Kurier schleicht durch deinen Garten.',
            delivered: 'Lautlos zugestellt.'
        }
    }
];

export function getOwnedProductIds() {
    return orders
        .filter(order => order.status === 'OPENED' && !user.returnedOrderIds?.includes(order.id))
        .flatMap(order => Array(order.quantity ?? 1).fill(order.revealedProductId || order.productId));
}

export function addToCart(productId: string, variant = 'Standard') {
    const existing = user.cart!.find(item => item.productId === productId && item.variant === variant);
    if (existing) existing.quantity++;
    else user.cart!.push({ id: crypto.randomUUID(), productId, quantity: 1, variant });
    saveState();
    notify('Im Warenkorb', getProducts().find(product => product.id === productId)?.name ?? 'Produkt', 'success');
}

export function updateCartQuantity(itemId: string, quantity: number) {
    const item = user.cart!.find(entry => entry.id === itemId);
    if (!item) return;
    if (quantity <= 0) user.cart = user.cart!.filter(entry => entry.id !== itemId);
    else item.quantity = Math.min(9, quantity);
    saveState();
}

export function clearCart() {
    user.cart = [];
    saveState();
}

export function getCartTotal(deliveryMethod: DeliveryMethod = 'STANDARD') {
    const shipping = deliveryMethod === 'EXPRESS' ? 50 : deliveryMethod === 'PICKUP' ? 0 : 10;
    return user.cart!.reduce((sum, item) => {
        const product = getProducts().find(entry => entry.id === item.productId);
        return sum + (product ? getProductPrice(product) * item.quantity + shipping : 0);
    }, 0);
}

export function toggleCompare(productId: string) {
    const ids = user.compareIds!;
    const index = ids.indexOf(productId);
    if (index >= 0) ids.splice(index, 1);
    else if (ids.length < 3) ids.push(productId);
    else notify('Vergleich voll', 'Du kannst bis zu drei Produkte vergleichen.', 'warning');
    saveState();
}

export function createWishlist(name: string, description: string, mood: string) {
    const cleanName = name.trim();
    if (!cleanName) return;
    user.wishlists!.push({ id: crypto.randomUUID(), name: cleanName, description, mood, items: [] });
    saveState();
}

export function deleteWishlist(listId: string) {
    user.wishlists = user.wishlists!.filter(list => list.id !== listId);
    saveState();
}

export function toggleWishlistItem(listId: string, productId: string) {
    const list = user.wishlists!.find(entry => entry.id === listId);
    if (!list) return;
    const index = list.items.findIndex(item => item.productId === productId);
    if (index >= 0) {
        list.items.splice(index, 1);
    } else {
        list.items.push({ productId, addedAt: Date.now() });
    }
    saveState();
}

export function buyProperty(propertyId: string) {
    const property = properties.find(entry => entry.id === propertyId);
    if (!property || user.ownedPropertyIds!.includes(propertyId)) return false;
    if (user.balance < property.price) {
        notify('Noch nicht drin', 'Für diese Immobilie reicht dein Guthaben noch nicht.', 'warning');
        return false;
    }
    user.balance -= property.price;
    user.ownedPropertyIds!.push(propertyId);
    user.activePropertyId = propertyId;
    user.propertyDecor![propertyId] ??= [];
    saveState();
    notify('Neue Immobilie', `${property.name} gehört jetzt dir.`, 'success');
    return true;
}

export function setActiveProperty(propertyId: string) {
    if (!user.ownedPropertyIds!.includes(propertyId)) return;
    user.activePropertyId = propertyId;
    saveState();
}

export function togglePropertyDecor(productId: string) {
    const property = properties.find(entry => entry.id === user.activePropertyId);
    if (!property) return;
    const decor = user.propertyDecor![property.id] ??= [];
    const index = decor.indexOf(productId);
    if (index >= 0) decor.splice(index, 1);
    else if (decor.length < property.slots) decor.push(productId);
    saveState();
}

export function toggleOutfit(productId: string) {
    const outfit = user.equippedOutfit!;
    const index = outfit.indexOf(productId);
    index >= 0 ? outfit.splice(index, 1) : outfit.length < 4 && outfit.push(productId);
    saveState();
}

export function setFeaturedVehicle(productId: string) {
    user.featuredVehicleId = user.featuredVehicleId === productId ? '' : productId;
    saveState();
}

export function toggleFeaturedElectronics(productId: string) {
    const setup = user.featuredElectronics!;
    const index = setup.indexOf(productId);
    index >= 0 ? setup.splice(index, 1) : setup.length < 5 && setup.push(productId);
    saveState();
}

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

export function getProductPrice(product: Product, variantName?: string) {
    const event = getActiveShopEvent();
    const day = Math.floor(Date.now() / 86400000);
    const seed = [...product.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    let marketPrice = Math.round(product.price * (1 + Math.sin((day + seed) * 1.73) * 0.045));
    
    if (variantName && product.variants?.length) {
        const variantGroup = product.variants[0];
        const value = variantGroup.values.find(v => v.name === variantName);
        if (value?.priceModifier) {
             marketPrice += value.priceModifier;
        }
    }
    
    return product.category === event.category ? Math.round(marketPrice * (1 - event.discount)) : marketPrice;
}

export function getPriceHistory(product: Product, days = 30) {
    const today = Math.floor(Date.now() / 86400000);
    const seed = [...product.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Array.from({ length: days }, (_, index) => {
        const day = today - days + index + 1;
        return { date: new Date(day * 86400000), price: Math.round(product.price * (1 + Math.sin((day + seed) * 1.73) * 0.045)) };
    });
}

export function generateMessage(orderId: string, type: import('./types').MessageType) {
    if (typeof window === 'undefined') return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const product = getProducts().find(p => p.id === (order.revealedProductId || order.productId));
    if (!product) return;

    const carrier = carriers.find(c => c.id === order.carrierId) ?? carriers[0];

    let sender = 'KoalaShip Info';
    let subject = '';
    let content = '';

    switch (type) {
        case 'ORDER_CONFIRMATION':
            sender = 'KoalaShip Bestellwesen';
            subject = `Bestellbestätigung: ${product.name}`;
            content = `Hallo ${user.name || 'Kunde'},\n\nwir haben deine Bestellung (Order-ID: ${order.id}) dankend erhalten. Unser Mitarbeiter Günther hat dein Paket bereits gefunden und bereitet es für ${carrier.name} vor.\n\nEs wird schon bald auf die Reise gehen!\n\nViele Grüße,\nDein KoalaShip Team`;
            break;
        case 'SHIPPING_ANNOUNCEMENT':
            sender = 'KoalaShip Logistik';
            subject = `Versandbestätigung: ${product.name}`;
            content = `Das Klebeband hat verloren! Deine Bestellung wurde sicher verpackt und an ${carrier.name} übergeben.\n\nDu kannst die Lieferung jederzeit im Dashboard verfolgen.`;
            break;
        case 'SORTING_CENTER':
            sender = carrier.name;
            subject = 'Paket wird sortiert';
            content = `Dein Paket hat unser lokales Verteilzentrum erreicht. Es wurde erfolgreich gescannt, gewogen und auf ein kleineres Förderband geschoben.\n\nDer Endspurt beginnt!`;
            break;
        case 'DELIVERY_TODAY':
            sender = carrier.name;
            subject = 'Zustellung steht heute an!';
            content = `Gute Nachrichten: Unser Fahrer ist in deiner Region unterwegs! \nBitte bereite dich auf die Annahme vor. Stelle sicher, dass du Hosen trägst (optional, aber empfohlen).\n\nWir sehen uns gleich!`;
            break;
        case 'DELIVERED':
            sender = carrier.name;
            subject = 'Paket erfolgreich zugestellt';
            content = `Es ist vollbracht! Deine Bestellung wurde erfolgreich übergeben. \n\nWir hoffen, das Unboxing wird spektakulär. Gehe in dein Inventar, um das Paket zu öffnen!`;
            break;
        case 'INVOICE':
            sender = 'KoalaShip Buchhaltung';
            subject = `Rechnung zu Bestellung ${order.invoiceNumber}`;
            content = `Hier ist deine (fiktive) Rechnung über ${order.totalPrice?.toLocaleString('de-DE')} KC.\n\nDa alles über dein unendliches Spielgeld läuft, haben wir den Betrag bereits abgebucht. Keine Mahnungen, keine Zinsen.\nDanke für den Einkauf!`;
            break;
        case 'REVIEW':
            sender = 'KoalaShip Customer Success';
            subject = `Wie gefällt dir: ${product.name}?`;
            content = `Du hast dein Paket geöffnet! \nIst das Produkt so gut wie beschrieben? Hast du es schon fallen gelassen?\n\nDa dieses Spiel ohnehin keine echten Reviews speichert, kannst du das Produkt einfach weiter stillschweigend genießen.\nViel Spaß damit!`;
            break;
    }

    if (user.messages!.some(m => m.orderId === orderId && m.type === type)) return;

    user.messages!.unshift({
        id: crypto.randomUUID(),
        orderId,
        type,
        sender,
        subject,
        content,
        timestamp: Date.now(),
        read: false
    });
    saveState();
}

export function markMessageRead(id: string) {
    const msg = user.messages!.find(m => m.id === id);
    if (msg && !msg.read) {
        msg.read = true;
        saveState();
    }
}

export function validateDiscountCode(code: string, subtotal: number) {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'WELCOME10' && subtotal >= 500) return { code: normalized, discount: Math.min(250, Math.round(subtotal * .1)), message: '10 % Willkommensrabatt' };
    if (normalized === 'LEAF50' && subtotal >= 1000) return { code: normalized, discount: 50, message: '50 KC Warenkorbrabatt' };
    if (normalized === 'FREESHIP' && subtotal >= 250) return { code: normalized, discount: 10, message: 'Standardversand geschenkt' };
    return null;
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

export function toggleFavoriteOrder(orderId: string) {
    user.favoriteOrderIds ??= [];
    const index = user.favoriteOrderIds.indexOf(orderId);
    index >= 0 ? user.favoriteOrderIds.splice(index, 1) : user.favoriteOrderIds.push(orderId);
    saveState();
}

export function returnOrder(orderId: string, score: number) {
    const order = orders.find(item => item.id === orderId);
    if (!order || order.status !== 'OPENED' || user.returnedOrderIds!.includes(orderId)) return false;
    const product = getProducts().find(item => item.id === (order.revealedProductId || order.productId));
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

export const getProducts = () => getLocalizedProducts(i18nState.locale);

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
    user.mode = isDeveloperMode() ? user.mode : 'REAL';
    user.lastSalaryPayment = Date.now();
    saveState();
}

export function isDeveloperMode() {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === 'true';
}

export function devAdvanceOrders() {
    if (!isDeveloperMode()) return;
    const now = Date.now();
    for (const order of orders) {
        if (order.status === 'OPENED') continue;
        order.orderDate = now - 55_000;
        order.deliveryEta = now + 5_000;
        order.status = 'OUT_FOR_DELIVERY';
        order.trackingSteps.push({ timestamp: now, message: 'Developer-Test: Zustellung beschleunigt.' });
    }
    saveState();
}

export function devDeliverOrders() {
    if (!isDeveloperMode()) return;
    const now = Date.now();
    for (const order of orders) {
        if (order.status === 'OPENED') continue;
        order.status = 'DELIVERED';
        order.deliveryEta = now;
        order.trackingSteps.push({ timestamp: now, message: 'Developer-Test: Paket zugestellt.' });
    }
    saveState();
}

export function switchMode() {
    user.mode = user.mode === 'DEMO' ? 'REAL' : 'DEMO';
    saveState();
}

export function purchaseProduct(productId: string, isExpress: boolean = false, quantity = 1, variant = 'Standard', deliveryMethod?: DeliveryMethod): boolean {
    const product = getProducts().find(p => p.id === productId);
    if (!product) return false;
    
    const method = deliveryMethod ?? (isExpress ? 'EXPRESS' : 'STANDARD');
    const shipping = method === 'EXPRESS' ? 50 : method === 'PICKUP' ? 0 : 10;
    const totalCost = getProductPrice(product) * quantity + shipping;
    if (user.balance < totalCost) {
        notify('Kauf abgelehnt', 'Dein Guthaben reicht noch nicht. Schulden gibt es hier nicht.', 'warning');
        return false;
    }

    user.balance -= totalCost;
    user.xp = (user.xp ?? 0) + 15;

    const now = Date.now();
    const isDemo = user.mode === 'DEMO';
    
    let deliveryDays = product.deliveryDays ?? 2;
    if (isExpress) deliveryDays = Math.max(1, deliveryDays - 1);

    const deliveryEta = now + (isDeveloperMode() ? (deliveryDays * 60 * 1000) : (deliveryDays * 24 * 60 * 60 * 1000));
    
    const selectedCarrier = carriers[Math.floor(Math.random() * carriers.length)];
    const randomStartMsg = selectedCarrier.trackingMilestones.received;

    const newOrder: Order = {
        id: crypto.randomUUID(),
        productId,
        orderDate: now,
        status: 'TRANSIT',
        mode: user.mode,
        deliveryEta: deliveryEta,
        startLocation: user.warehouseLocation ? { ...user.warehouseLocation } : undefined,
        isExpress,
        quantity,
        unitPrice: getProductPrice(product),
        totalPrice: totalCost,
        variant,
        deliveryMethod: method,
        deliveryLabel: method === 'PICKUP' ? 'KoalaShip Packstation' : method === 'SAFE_PLACE' ? (user.deliveryNote || 'Gewählter Ablageort') : method === 'EXPRESS' ? 'Express-Haustürzustellung' : 'Standard-Haustürzustellung',
        invoiceNumber: `KS-${new Date(now).getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        lastTrackingUpdate: now,
        carrierId: selectedCarrier.id,
        trackingSteps: [
            { timestamp: now, message: randomStartMsg }
        ]
    };

    orders.push(newOrder);
    if (orders.length > MAX_STORED_ORDERS) orders.splice(0, orders.length - MAX_STORED_ORDERS);
    saveState();
    generateMessage(newOrder.id, 'ORDER_CONFIRMATION');
    notify('Bestellung bestätigt', `${product.name} ist unterwegs.`, 'success');
    playTone('purchase');
    return true;
}

export function checkoutCart(deliveryMethod: DeliveryMethod, discountCode = ''): Order[] | null {
    if (!user.cart!.length) return null;
    const grossTotal = getCartTotal(deliveryMethod);
    const discount = validateDiscountCode(discountCode, grossTotal);
    const total = grossTotal - (discount?.discount ?? 0);
    if (user.balance < total) {
        notify('Checkout abgelehnt', 'Dein Guthaben reicht nicht. KoalaShip macht keine Schulden.', 'warning');
        return null;
    }
    const items: CartItem[] = [...user.cart!];
    let remainingDiscount = discount?.discount ?? 0;
    user.balance += remainingDiscount;
    const initialOrdersCount = orders.length;
    for (const item of items) {
        const success = purchaseProduct(item.productId, deliveryMethod === 'EXPRESS', item.quantity, item.variant, deliveryMethod);
        if (!success) return null;
        const order = orders.at(-1);
        if (order && remainingDiscount > 0) {
            const applied = Math.min(remainingDiscount, order.totalPrice ?? 0);
            order.discountCode = discount?.code;
            order.discountAmount = applied;
            order.totalPrice = Math.max(0, (order.totalPrice ?? 0) - applied);
            remainingDiscount -= applied;
        }
    }
    clearCart();
    notify('Checkout abgeschlossen', `${items.length} Positionen wurden bestellt${discount ? ` · ${discount.message}` : ''}.`, 'success');
    saveState();
    return orders.slice(initialOrdersCount);
}

export function openPackage(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    if (order && order.status === 'DELIVERED') {
        if (order.productId === 'p_mystery_gold') {
            const possibleProducts = getProducts().filter(product => product.category !== 'MYSTERY');
            order.revealedProductId = possibleProducts[Math.floor(Math.random() * possibleProducts.length)]?.id;
        }
        order.status = 'OPENED';
        const inventoryId = order.revealedProductId || order.productId;
        if (!user.roomItems!.includes(inventoryId) && user.roomItems!.length < 8) user.roomItems!.push(inventoryId);
        user.xp = (user.xp ?? 0) + 25;
        order.trackingSteps.push({ timestamp: Date.now(), message: 'Paket geöffnet, Inhalt geprüft und ins Inventar übernommen.' });
        saveState();
        generateMessage(orderId, 'REVIEW');
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
    if (!isDeveloperMode() && user.mode !== 'REAL') {
        user.mode = 'REAL';
        saveState();
    }

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
            const carrier = carriers.find(c => c.id === order.carrierId) ?? carriers[0];

            if (progress >= 1) {
                order.status = 'DELIVERED';
                order.trackingSteps.push({
                    timestamp: now,
                    message: carrier.trackingMilestones.delivered
                });
                generateMessage(order.id, 'DELIVERED');
                generateMessage(order.id, 'INVOICE');
                notify('Paket zugestellt!', getProducts().find(product => product.id === order.productId)?.name ?? 'Dein Paket ist da.', 'success');
                stateChanged = true;
                continue;
            }

            const isNightCarrier = carrier.id === 'night_koala';
            const canDeliverNow = order.mode === 'DEMO' || 
                (isNightCarrier ? (currentHour >= 18 || currentHour < 6) : (currentHour >= 8 && currentHour < 18));

            if (progress >= 0.8 && order.status !== 'OUT_FOR_DELIVERY') {
                if (!canDeliverNow) {
                    // Delay delivery ETA by 1 hour until we hit working hours
                    order.deliveryEta += 60 * 60 * 1000;
                    continue;
                }
                order.status = 'OUT_FOR_DELIVERY';
                order.estimatedStops = 8 + Math.floor(Math.random() * 14);
                order.lastTrackingUpdate = now;
                order.trackingSteps.push({
                    timestamp: now,
                    message: carrier.trackingMilestones.outForDelivery
                });
                generateMessage(order.id, 'DELIVERY_TODAY');
                notify('In Zustellung', `Dein Paket von ${carrier.name} kommt heute!`, 'info');
                stateChanged = true;
                
                // Fetch OSRM Route asynchronously
                if (!order.routePolyline && user.warehouseLocation && user.homeLocation) {
                    // Start points vary by carrier
                    const carrierIndex = carriers.findIndex(c => c.id === carrier.id);
                    const angleOffset = (carrierIndex * Math.PI / 2); 
                    const distanceDegree = 10 / 111;
                    const startLat = user.homeLocation.lat + Math.cos(angleOffset) * distanceDegree;
                    const startLng = user.homeLocation.lng + Math.sin(angleOffset) * distanceDegree;
                    
                    fetchOsrmRoute({lat: startLat, lng: startLng}, user.homeLocation).then(route => {
                        if (route) {
                            order.routePolyline = route;
                            order.startLocation = {lat: startLat, lng: startLng};
                            saveState();
                        }
                    });
                }
                continue;
            }

            const seed = [...order.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);

            // Deterministic Milestones
            const milestones = [
                { p: 0.05, msg: ['Auftragsdaten elektronisch übermittelt.', 'Sendung wurde elektronisch angekündigt.'][seed % 2] },
                { p: 0.15, msg: ['Sendung in der Vorbereitung beim Absender.', 'Paket ist abholbereit für den Transport.'][seed % 2] },
                { p: 0.25, msg: 'Sendung wurde vom Transporteur entgegengenommen.' },
                { p: 0.35, msg: ['Label wurde erneut gescannt.', 'Sendung hat das Start-Versandzentrum verlassen.'][seed % 2] },
                { p: 0.45, msg: carrier.trackingMilestones.transit },
                { p: 0.55, msg: ['Zwischenstopp im Verteilnetzwerk passiert.', 'Route für den Weitertransport bestätigt.'][seed % 2] }
            ];

            for (const ms of milestones) {
                 if (progress >= ms.p && !order.trackingSteps.some(s => s.message === ms.msg)) {
                     order.trackingSteps.push({ timestamp: now, message: ms.msg });
                     stateChanged = true;
                 }
            }

            // Phase 1: Transit (0% - 60%)
            if (order.status === 'TRANSIT') {
                if (progress >= 0.6) {
                    order.status = 'LOCAL_SORTING';
                    order.trackingSteps.push({
                        timestamp: now,
                        message: carrier.trackingMilestones.sorting
                    });
                    generateMessage(order.id, 'SORTING_CENTER');
                    stateChanged = true;
                }
            }
            
            // Phase 3: Out for Delivery (80% - 100%)
            else if (order.status === 'OUT_FOR_DELIVERY') {
                const linearStops = ((1 - progress) / 0.2) * 15;
                const fluctuation = Math.sin(progress * 50 + seed) * 1.5; 
                let targetStops = Math.max(0, Math.ceil(linearStops + fluctuation));

                if (order.estimatedStops === undefined) order.estimatedStops = 15;

                if (targetStops !== order.estimatedStops && now - (order.lastTrackingUpdate ?? 0) > 45_000) {
                    let oldStops = order.estimatedStops;
                    
                    // Allow decreasing, stagnating, or going up by max 1
                    if (targetStops > oldStops + 1) {
                        targetStops = oldStops; // Stagnate instead of jumping up too much
                    }

                    order.estimatedStops = targetStops;
                    order.lastTrackingUpdate = now;
                    
                    let msg = '';
                    if (targetStops === 0) {
                        msg = 'Der Kurier befindet sich in unmittelbarer Nähe. Halte dich bereit.';
                    } else if (targetStops > oldStops) {
                        msg = `Route wurde minimal angepasst. Aktuell noch ${targetStops} Stopps.`;
                    } else if (targetStops === oldStops) {
                        msg = `Leichte Verzögerung auf der Route. Weiterhin ${targetStops} Stopps.`;
                    } else {
                        msg = `Noch ungefähr ${targetStops} Stopps vor deiner Zustellung.`;
                    }

                    const lastMsg = order.trackingSteps[order.trackingSteps.length - 1]?.message;
                    if (lastMsg !== msg) {
                        order.trackingSteps.push({ timestamp: now, message: msg });
                        stateChanged = true;
                    }
                }

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

export async function manualTrackingRefresh(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    if (!order || ['DELIVERED', 'OPENED'].includes(order.status)) return false;
    
    // Simulate network delay for anticipation
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
    
    const now = Date.now();
    const elapsed = now - order.orderDate;
    const totalTime = order.deliveryEta - order.orderDate;
    const progress = Math.max(0, Math.min(1, elapsed / totalTime));

    // Divide delivery into 20 chunks
    const chunk = Math.floor(progress * 20); 
    const seed = [...order.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) + chunk;

    if (order.lastRefreshChunk === chunk) {
         notify('Tracking-Server', getLocalizedTrackingEvents(i18nState.locale).refreshWait, 'info');
         return true; 
    }

    order.lastRefreshChunk = chunk;
    order.lastTrackingUpdate = now;

    // Comedy/Impatient events vs boring events
    const isFunny = (seed % 3) === 0;
    
    if (isFunny) {
         const funnyEvents = [
             "Tracking-Server manuell aufgeweckt. Paket schläft noch.",
             "System-Check: Das Paket befindet sich definitiv irgendwo auf der Erde.",
             "Fahrer wurde per Funk angefunkt. Hat genervt aufgelegt.",
             "Scanmeldung manuell angefordert. Computer sagt 'Nein'.",
             "Logistik-Update: Alles beim Alten, aber danke der Nachfrage."
         ];
         const msg = funnyEvents[seed % funnyEvents.length];
         order.trackingSteps.push({ timestamp: now, message: msg });
    } else {
         const boringEvents = [
             "Keine neuen Scan-Ereignisse im System gefunden.",
             "Letzter bekannter Status durch Server bestätigt.",
             "Verbindung zum Frachtzentrum erfolgreich. Keine neuen Daten.",
             "Manueller Refresh: Keine Statusänderung verzeichnet."
         ];
         const msg = boringEvents[seed % boringEvents.length];
         const lastMsg = order.trackingSteps[order.trackingSteps.length - 1]?.message;
         if (!boringEvents.includes(lastMsg)) {
             order.trackingSteps.push({ timestamp: now, message: msg });
         }
    }
    
    saveState();
    return true;
}
