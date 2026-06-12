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
    incomeRate: number;   // Deprecated, keep for compat or remove? Let's remove and use occupation.
}

export type ProductCategory = 'LUXURY' | 'EVERYDAY' | 'ABSURD';

export interface Product {
    id: string;
    name: string;
    price: number;
    category: ProductCategory;
    imageUrl: string;
}

export type OrderStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'OPENED';

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
    trackingSteps: TrackingStep[];
}
