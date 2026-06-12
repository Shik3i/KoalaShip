export type GameMode = 'DEMO' | 'REAL';

export interface LatLng {
    lat: number;
    lng: number;
}

export type SalaryInterval = 'WEEKLY' | 'MONTHLY' | 'MINUTELY'; // MINUTELY for DEMO mode maybe, or we just handle it in logic

export interface JobPreset {
    id: string;
    title: string;
    salary: number;
    interval: SalaryInterval;
}

export interface UserProfile {
    // New Onboarding Fields
    name: string | null;
    occupation: JobPreset | null;
    lastSalaryPayment: number | null; // Timestamp
    homeLocation: LatLng | null;
    warehouseLocation: LatLng | null; // Generated 15km away

    // Legacy Fields
    mode: GameMode;
    balance: number;      // Fake-Geld auf dem Konto
    xp?: number;
    wishlist?: string[];
    roomItems?: string[];
    returnedOrderIds?: string[];
    bio?: string;
    jobDescription?: string;
    pronouns?: string;
    favoriteCategory?: ProductCategory;
    deliveryNote?: string;
    avatarColor?: string;
    cart?: CartItem[];
    compareIds?: string[];
    dreamLists?: DreamList[];
    ownedPropertyIds?: string[];
    activePropertyId?: string;
    propertyDecor?: Record<string, string[]>;
    equippedOutfit?: string[];
    featuredVehicleId?: string;
    featuredElectronics?: string[];
}

export type ProductCategory = 'LUXURY' | 'EVERYDAY' | 'ABSURD' | 'MYSTERY';
export type InventoryType = 'DECOR' | 'OUTFIT' | 'VEHICLE' | 'ELECTRONICS' | 'COLLECTIBLE';

export interface Product {
    id: string;
    name: string;
    price: number;
    category: ProductCategory;
    imageUrl: string;
    rating: number; // e.g. 4.5
    reviews: { author: string; text: string; rating: number }[];
    description?: string;
    brand?: string;
    inventoryType?: InventoryType;
    variants?: { name: string; values: string[] }[];
    specs?: Record<string, string>;
    stock?: number;
    deliveryDays?: number;
}

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    variant: string;
}

export interface DreamList {
    id: string;
    name: string;
    productIds: string[];
    targetNote?: string;
}

export interface Property {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    slots: number;
    style: string;
}

export type DeliveryMethod = 'STANDARD' | 'EXPRESS' | 'PICKUP' | 'SAFE_PLACE';

export type OrderStatus = 'TRANSIT' | 'LOCAL_SORTING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'OPENED';

export interface TrackingStep {
    timestamp: number;
    message: string;
}

export interface Order {
    id: string;
    productId: string;
    orderDate: number; // Unix Timestamp in ms
    status: OrderStatus;
    mode: GameMode;    
    deliveryEta: number; // ETA als Unix Timestamp
    startLocation?: LatLng; // Map-Tracking
    routePolyline?: LatLng[]; // OSRM Route
    isExpress?: boolean;
    trackingSteps: TrackingStep[];
    revealedProductId?: string;
    deliveryEvent?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
    variant?: string;
    deliveryMethod?: DeliveryMethod;
    deliveryLabel?: string;
    invoiceNumber?: string;
    discountCode?: string;
    discountAmount?: number;
    estimatedStops?: number;
    lastTrackingUpdate?: number;
}
