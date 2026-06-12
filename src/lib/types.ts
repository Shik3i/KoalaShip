export type GameMode = 'DEMO' | 'REAL';

export interface UserProfile {
    mode: GameMode;
    balance: number;      // Fake-Geld auf dem Konto
    incomeRate: number;   // Einkommen pro Sekunde
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
    trackingSteps: TrackingStep[];
}
