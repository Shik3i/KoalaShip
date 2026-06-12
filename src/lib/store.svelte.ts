import { type UserProfile, type JobPreset as Job, type Product, type Order, type LatLng, type CartItem, type DeliveryMethod, type Property } from './types';
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
user.bio ??= '';
user.jobDescription ??= '';
user.pronouns ??= '';
user.favoriteCategory ??= 'EVERYDAY';
user.deliveryNote ??= '';
user.avatarColor ??= '#4f46e5';
user.cart ??= [];
user.compareIds ??= [];
user.dreamLists ??= [{ id: 'dream_default', name: 'Meine Traumliste', productIds: [] }];
user.ownedPropertyIds ??= ['property_studio'];
user.activePropertyId ??= 'property_studio';
user.propertyDecor ??= {};
user.equippedOutfit ??= [];
user.featuredVehicleId ??= '';
user.featuredElectronics ??= [];

export const properties: Property[] = [
    { id: 'property_studio', name: 'Koala-Studio', price: 0, image: '🏠', description: 'Klein, gemütlich und bereits inklusive.', slots: 6, style: 'city' },
    { id: 'property_loft', name: 'Skyline-Loft', price: 18000, image: '🌆', description: 'Offene Fläche mit großen Fenstern und Platz für Technik.', slots: 10, style: 'loft' },
    { id: 'property_house', name: 'Eukalyptus-Haus', price: 42000, image: '🏡', description: 'Ein ruhiges Haus mit mehreren Ausstellungsbereichen.', slots: 14, style: 'nature' },
    { id: 'property_villa', name: 'Koala-Villa', price: 125000, image: '🏛️', description: 'Viel Platz für Luxus, Fahrzeuge und fragwürdige Kunst.', slots: 20, style: 'luxury' }
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
    notify('Im Warenkorb', products.find(product => product.id === productId)?.name ?? 'Produkt', 'success');
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
        const product = products.find(entry => entry.id === item.productId);
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

export function createDreamList(name: string) {
    const clean = name.trim();
    if (!clean) return;
    user.dreamLists!.push({ id: crypto.randomUUID(), name: clean, productIds: [] });
    saveState();
}

export function toggleDreamListProduct(listId: string, productId: string) {
    const list = user.dreamLists!.find(entry => entry.id === listId);
    if (!list) return;
    const index = list.productIds.indexOf(productId);
    index >= 0 ? list.productIds.splice(index, 1) : list.productIds.push(productId);
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

export function getProductPrice(product: Product) {
    const event = getActiveShopEvent();
    const day = Math.floor(Date.now() / 86400000);
    const seed = [...product.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const marketPrice = Math.round(product.price * (1 + Math.sin((day + seed) * 1.73) * 0.045));
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

const productDetails: Record<string, Partial<Product>> = {
    p_1: { brand: 'KoalaTech', inventoryType: 'ELECTRONICS', description: 'Ein großes Premium-Tablet für Streaming, Zeichnen und sehr wichtige Warenkorb-Recherche.', variants: [{ name: 'Farbe', values: ['Space Grau', 'Eukalyptus Grün', 'Polar Weiß'] }], specs: { Display: '13 Zoll OLED', Speicher: '512 GB', Akku: '20 Stunden' }, stock: 12, deliveryDays: 2 },
    p_2: { brand: 'LeafAudio', inventoryType: 'ELECTRONICS', description: 'Kabellose Kopfhörer mit aktiver Geräuschunterdrückung und Blattgeräusch-Modus.', variants: [{ name: 'Farbe', values: ['Schwarz', 'Creme', 'Grün'] }], specs: { Laufzeit: '38 Stunden', Verbindung: 'Bluetooth', Gewicht: '248 g' }, stock: 31, deliveryDays: 1 },
    p_3: { brand: 'SoftTime', inventoryType: 'OUTFIT', description: 'Eine luxuriös wirkende Uhr, die hauptsächlich durch Selbstbewusstsein zusammengehalten wird.', variants: [{ name: 'Armband', values: ['Schwarz', 'Gold', 'Neon'] }], specs: { Material: 'Premium-Knetmasse', Wasserfest: 'Nein', Anzeige: 'Fast immer' }, stock: 4, deliveryDays: 3 },
    p_4: { brand: 'AlpenAtem', inventoryType: 'COLLECTIBLE', description: 'Handverpackte Bergluft für Schreibtisch, Regal oder dramatische Atempausen.', specs: { Herkunft: 'Fiktive Alpen', Inhalt: '400 ml', Haltbarkeit: 'Optimistisch' }, stock: 99, deliveryDays: 2 },
    p_5: { brand: 'RollGut', inventoryType: 'DECOR', description: 'Unauffällig, zuverlässig und erstaunlich dekorativ in minimalistischen Räumen.', variants: [{ name: 'Packung', values: ['1 Rolle', '8 Rollen', 'Familienpalast'] }], specs: { Lagen: '4', Farbe: 'Weiß', Duft: 'Keiner, zum Glück' }, stock: 250, deliveryDays: 1 },
    p_6: { brand: 'CyberKoala', inventoryType: 'OUTFIT', description: 'Ein rein kosmetisches Cyber-Accessoire ohne medizinische Funktion.', variants: [{ name: 'Seite', values: ['Links', 'Rechts'] }], specs: { Zustand: 'Defekt', LEDs: '7', Garantie: 'Sehr theoretisch' }, stock: 2, deliveryDays: 5 },
    p_7: { brand: 'OrbitHome', inventoryType: 'DECOR', description: 'Eine kompakte Raumstation für das sehr große virtuelle Wohnzimmer.', specs: { Umlaufbahn: 'Dekorativ', Zimmer: '12', Aussicht: 'Unbezahlbar' }, stock: 1, deliveryDays: 14 },
    p_8: { brand: 'SeatRGB', inventoryType: 'DECOR', description: 'Ergonomischer Gaming-Stuhl mit mehr Beleuchtung als manche Innenstädte.', variants: [{ name: 'Farbe', values: ['Schwarz', 'Weiß', 'Lila'] }], specs: { RGB: '16,7 Mio. Farben', Belastung: '150 kg', Komfort: 'Legendär' }, stock: 18, deliveryDays: 2 },
    p_9: { brand: 'ChainLeaf', inventoryType: 'COLLECTIBLE', description: 'Ein lokal gespeichertes digitales Sammlerstück ohne Blockchain und ohne Spekulation.', specs: { Format: 'PNG-ish', Seltenheit: 'Behauptet', Wiederverkauf: 'Nein' }, stock: 999, deliveryDays: 1 }
};
for (const product of products) Object.assign(product, productDetails[product.id] ?? {});

products.push(
    { id: 'p_10', name: 'Koala Streetwear Hoodie', price: 180, category: 'EVERYDAY', imageUrl: '🧥', rating: 4.7, reviews: [{ author: 'Mira', text: 'Sehr weich und angenehm übertrieben.', rating: 5 }], brand: 'SoftLeaf', inventoryType: 'OUTFIT', description: 'Schwerer Oversize-Hoodie für dein virtuelles Outfit.', variants: [{ name: 'Größe', values: ['S', 'M', 'L', 'XL'] }, { name: 'Farbe', values: ['Flieder', 'Schwarz', 'Grün'] }], specs: { Material: 'Bio-Baumwolle', Schnitt: 'Oversize' }, stock: 44, deliveryDays: 2 },
    { id: 'p_11', name: 'Eucalyptus Runner', price: 220, category: 'LUXURY', imageUrl: '👟', rating: 4.6, reviews: [{ author: 'SprintKoala', text: 'Sieht schnell aus, reicht mir.', rating: 5 }], brand: 'LeafStep', inventoryType: 'OUTFIT', description: 'Limitierter Sneaker für komplette Koala-Looks.', variants: [{ name: 'Größe', values: ['38', '40', '42', '44'] }], specs: { Sohle: 'Cloud Foam', Edition: '2026' }, stock: 17, deliveryDays: 3 },
    { id: 'p_12', name: 'Koala GT Electric', price: 68000, category: 'LUXURY', imageUrl: '🏎️', rating: 4.9, reviews: [{ author: 'Volt', text: 'Steht hervorragend in der Garage.', rating: 5 }], brand: 'Koala Motors', inventoryType: 'VEHICLE', description: 'Elektrischer Grand Tourer für die virtuelle Traumgarage.', variants: [{ name: 'Lack', values: ['Midnight', 'Eukalyptus', 'Pearl'] }], specs: { Leistung: '640 PS', Reichweite: '610 km', Sitze: '4' }, stock: 3, deliveryDays: 7 },
    { id: 'p_13', name: 'City Leaf Scooter', price: 3400, category: 'EVERYDAY', imageUrl: '🛵', rating: 4.4, reviews: [{ author: 'CityKoala', text: 'Perfekt für kurze virtuelle Wege.', rating: 4 }], brand: 'UrbanLeaf', inventoryType: 'VEHICLE', description: 'Leiser Elektro-Scooter für deine Garage.', variants: [{ name: 'Farbe', values: ['Mint', 'Rot', 'Schwarz'] }], specs: { Reichweite: '90 km', Tempo: '80 km/h' }, stock: 9, deliveryDays: 4 },
    { id: 'p_14', name: 'Creator Workstation Ultra', price: 7900, category: 'LUXURY', imageUrl: '🖥️', rating: 4.8, reviews: [{ author: 'RenderKid', text: 'Rendert meine Wunschliste in 8K.', rating: 5 }], brand: 'KoalaCompute', inventoryType: 'ELECTRONICS', description: 'Eine kompromisslose Workstation für dein Elektronik-Setup.', variants: [{ name: 'RAM', values: ['64 GB', '128 GB', '256 GB'] }], specs: { GPU: 'Leaf RTX 6090', Speicher: '8 TB', Kühlung: 'Flüsterleise' }, stock: 6, deliveryDays: 4 },
    { id: 'p_15', name: 'Modulares Sofa Cloud', price: 2400, category: 'LUXURY', imageUrl: '🛋️', rating: 4.7, reviews: [{ author: 'HomeKoala', text: 'Mein Loft wirkt direkt teurer.', rating: 5 }], brand: 'Nest', inventoryType: 'DECOR', description: 'Großes modulares Sofa für gekaufte Immobilien.', variants: [{ name: 'Bezug', values: ['Sand', 'Moos', 'Graphit'] }], specs: { Module: '5', Breite: '320 cm' }, stock: 8, deliveryDays: 5 }
);

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
    const product = products.find(p => p.id === productId);
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
        quantity,
        unitPrice: getProductPrice(product),
        totalPrice: totalCost,
        variant,
        deliveryMethod: method,
        deliveryLabel: method === 'PICKUP' ? 'KoalaShip Packstation' : method === 'SAFE_PLACE' ? (user.deliveryNote || 'Gewählter Ablageort') : method === 'EXPRESS' ? 'Express-Haustürzustellung' : 'Standard-Haustürzustellung',
        invoiceNumber: `KS-${new Date(now).getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
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

export function checkoutCart(deliveryMethod: DeliveryMethod, discountCode = '') {
    if (!user.cart!.length) return false;
    const grossTotal = getCartTotal(deliveryMethod);
    const discount = validateDiscountCode(discountCode, grossTotal);
    const total = grossTotal - (discount?.discount ?? 0);
    if (user.balance < total) {
        notify('Checkout abgelehnt', 'Dein Guthaben reicht nicht. KoalaShip macht keine Schulden.', 'warning');
        return false;
    }
    const items: CartItem[] = [...user.cart!];
    let remainingDiscount = discount?.discount ?? 0;
    user.balance += remainingDiscount;
    for (const item of items) {
        const success = purchaseProduct(item.productId, deliveryMethod === 'EXPRESS', item.quantity, item.variant, deliveryMethod);
        if (!success) return false;
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
        order.trackingSteps.push({ timestamp: Date.now(), message: 'Paket geöffnet, Inhalt geprüft und ins Inventar übernommen.' });
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
                order.estimatedStops = 8 + Math.floor(Math.random() * 14);
                order.lastTrackingUpdate = now;
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
                    'Die Sendung wurde im nächsten Umschlagzentrum verarbeitet.',
                    'Das geplante Transportfahrzeug wurde pünktlich erreicht.',
                    'Die Route wurde wegen aktueller Verkehrslage leicht angepasst.'
                ];
                order.deliveryEvent = events[Math.floor(Math.random() * events.length)];
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
                        order.estimatedStops = 8 + Math.floor(Math.random() * 14);
                        order.lastTrackingUpdate = now;
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
                const stops = Math.max(0, Math.ceil((1 - progress) / .2 * (order.estimatedStops ?? 12)));
                if (stops !== order.estimatedStops && now - (order.lastTrackingUpdate ?? 0) > 45_000) {
                    order.estimatedStops = stops;
                    order.lastTrackingUpdate = now;
                    order.trackingSteps.push({ timestamp: now, message: stops > 0 ? `Noch ungefähr ${stops} Stopps vor deiner Zustellung.` : 'Der Kurier ist ganz in der Nähe.' });
                    stateChanged = true;
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
