// PRNG implementation: Mulberry32
// A fast, 32-bit PRNG that produces good quality pseudo-random numbers
export function createPRNG(seed: string | number): () => number {
    let s = typeof seed === 'string' ? getHash(seed) : seed;
    
    return function() {
        let t = s += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Generate a 32-bit hash from a string using a simple hashing algorithm (djb2 variant)
export function getHash(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
}

// Seed Helpers
export function getDaySeed(): string {
    const now = new Date();
    // YYYY-MM-DD local time
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function getOrderSeed(orderId: string): string {
    return `order_${orderId}`;
}

export function getProductSeed(productId: string): string {
    return `product_${productId}`;
}

// Utility functions
export function pickSeeded<T>(array: T[], prng: () => number): T {
    if (array.length === 0) throw new Error("Cannot pick from empty array");
    return array[Math.floor(prng() * array.length)];
}

export function chanceSeeded(probability: number, prng: () => number): boolean {
    return prng() < probability;
}

export function randomRangeSeeded(min: number, max: number, prng: () => number): number {
    return min + prng() * (max - min);
}

export function randomIntSeeded(min: number, max: number, prng: () => number): number {
    return Math.floor(min + prng() * (max - min + 1));
}

export function shuffleSeeded<T>(array: T[], prng: () => number): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
