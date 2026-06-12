import type { Locale } from './i18n.svelte';
import type { Product } from './types';

export function getLocalizedTrackingEvents(locale: Locale) {
    if (locale === 'EN') {
        return {
            start: ['Order received. Koalas are waking up.', 'Data transmitted to logistics center.', 'Order confirmed, preparing shipment.'],
            phase1: ['Shipment is being prepared at the sender.', 'Package is ready for pickup.', 'Data electronically transmitted to KoalaShip.', 'Package sorted in starting facility.'],
            phase2: ['Package has left the starting facility.', 'Intermediate stop in the distribution network.', 'Vehicle loaded for onward transport.', 'Delivery window calculated, route slightly optimized.'],
            funny: [
                "Tracking server manually awakened. Package is still sleeping.",
                "System check: The package is definitely somewhere on Earth.",
                "Driver contacted via radio. Hung up annoyed.",
                "Scan requested manually. Computer says 'No'.",
                "Logistics update: Nothing changed, but thanks for asking.",
                "We shook the box. It still rattles.",
                "Driver is currently reconsidering his life choices.",
                "Package scanned. Scanner beeped happily."
            ],
            boring: [
                "No new scan events found in the system.",
                "Last known status confirmed by server.",
                "Connection to freight center successful. No new data.",
                "Manual refresh: No status change recorded.",
                "Still in transit.",
                "Processing continues normally."
            ],
            refreshWait: "Still no new scan event. Patience is a virtue."
        };
    }
    if (locale === 'ES') {
        return {
            start: ['Pedido recibido. Los koalas se están despertando.', 'Datos transmitidos al centro logístico.', 'Pedido confirmado, preparando envío.'],
            phase1: ['El envío se está preparando en el remitente.', 'El paquete está listo para la recogida.', 'Datos transmitidos electrónicamente a KoalaShip.', 'Paquete clasificado en la instalación de origen.'],
            phase2: ['El paquete ha salido de la instalación de origen.', 'Parada intermedia en la red de distribución.', 'Vehículo cargado para el transporte.', 'Ventana de entrega calculada, ruta ligeramente optimizada.'],
            funny: [
                "Servidor de seguimiento despertado manualmente. El paquete sigue durmiendo.",
                "Verificación del sistema: El paquete definitivamente está en algún lugar de la Tierra.",
                "Conductor contactado por radio. Colgó molesto.",
                "Escaneo solicitado manualmente. La computadora dice 'No'.",
                "Actualización logística: Nada ha cambiado, pero gracias por preguntar.",
                "Sacudimos la caja. Todavía suena.",
                "El conductor está reconsiderando sus decisiones de vida.",
                "Paquete escaneado. El escáner pitó felizmente."
            ],
            boring: [
                "No se encontraron nuevos eventos de escaneo en el sistema.",
                "Último estado conocido confirmado por el servidor.",
                "Conexión al centro de carga exitosa. Sin datos nuevos.",
                "Actualización manual: No se registró cambio de estado.",
                "Todavía en tránsito.",
                "El procesamiento continúa normalmente."
            ],
            refreshWait: "Aún no hay nuevos eventos de escaneo. La paciencia es una virtud."
        };
    }
    // Default DE
    return {
        start: ['Bestellung eingegangen. Koalas wachen auf.', 'Auftragsdaten an Logistikzentrum übermittelt.', 'Bestellung bestätigt, Versand wird vorbereitet.'],
        phase1: ['Sendung in der Vorbereitung beim Absender.', 'Paket ist abholbereit für den Transport.', 'Auftragsdaten elektronisch an KoalaShip übermittelt.', 'Paket im Start-Paketzentrum sortiert.'],
        phase2: ['Sendung hat das Start-Versandzentrum verlassen.', 'Zwischenstopp im Verteilnetzwerk passiert.', 'Fahrzeug für den Weitertransport wurde beladen.', 'Zustellfenster wurde berechnet und Route leicht optimiert.'],
        funny: [
            "Tracking-Server manuell aufgeweckt. Paket schläft noch.",
            "System-Check: Das Paket befindet sich definitiv irgendwo auf der Erde.",
            "Fahrer wurde per Funk angefunkt. Hat genervt aufgelegt.",
            "Scanmeldung manuell angefordert. Computer sagt 'Nein'.",
            "Logistik-Update: Alles beim Alten, aber danke der Nachfrage.",
            "Wir haben den Karton geschüttelt. Klappert noch.",
            "Fahrer überdenkt gerade seine Lebensentscheidungen im Stau.",
            "Paket gescannt. Scanner hat fröhlich gepiept."
        ],
        boring: [
            "Keine neuen Scan-Ereignisse im System gefunden.",
            "Letzter bekannter Status durch Server bestätigt.",
            "Verbindung zum Frachtzentrum erfolgreich. Keine neuen Daten.",
            "Manueller Refresh: Keine Statusänderung verzeichnet.",
            "Weiterhin im regulären Transportprozess.",
            "Logistikzentrum meldet normalen Betrieb."
        ],
        refreshWait: "Immer noch keine neue Scanmeldung. Geduld ist eine Tugend."
    };
}

export function getLocalizedProducts(locale: Locale): Product[] {
    if (locale === 'EN') {
        return [
            { 
                id: 'p_1', name: 'KoalaPad Pro Max', price: 1200, category: 'LUXURY', imageUrl: '📱', rating: 4.8, brand: 'KoalaTech', inventoryType: 'ELECTRONICS',
                description: 'A large premium tablet for streaming, drawing, and very important shopping cart research.',
                specs: { Display: '13 inch OLED', Storage: '512 GB', Battery: '20 hours' }, stock: 12, deliveryDays: 2,
                whyThisProduct: ['Razor-sharp display', 'Perfect for pretending to work', 'Status symbol in cafes'],
                relatedProductIds: ['p_2', 'p_14'],
                reviews: [
                    {author: 'TechGuru', text: 'Best tablet, my Koala swipes for hours.', rating: 5},
                    {author: 'Hater99', text: 'Battery only lasts 20 hours. Way too little for a real marathon.', rating: 4},
                    {author: 'Skeptic', text: "It's basically just an overpriced board with glass.", rating: 3}
                ],
                variants: [{
                    name: 'Color',
                    values: [
                        { name: 'Space Gray', description: 'The classic for business Koalas.', pros: ['Fingerprints are invisible', 'Serious'], cons: ['Boring'] },
                        { name: 'Eucalyptus Green', description: 'The signature edition.', pros: ['Looks fantastic', 'Rare'], cons: ['Does not match every outfit'], priceModifier: 50 },
                        { name: 'Polar White', description: 'Minimalist and clean.', pros: ['Aesthetic'], cons: ['Gets dirty quickly'] }
                    ]
                }]
            },
            { 
                id: 'p_2', name: 'Noise-Cancelling Eucalyptus', price: 350, category: 'EVERYDAY', imageUrl: '🎧', rating: 4.5, brand: 'LeafAudio', inventoryType: 'ELECTRONICS',
                description: 'Wireless headphones with active noise cancellation and a special leaf-rustle transparency mode.',
                specs: { Runtime: '38 hours', Connection: 'Bluetooth 5.3', Weight: '248 g' }, stock: 31, deliveryDays: 1,
                whyThisProduct: ['Blocks out city noise', 'Extremely light and comfortable', 'Long battery life'],
                relatedProductIds: ['p_1', 'p_10'],
                reviews: [
                    {author: 'Sleepy', text: 'Finally absolute silence while chewing. 10/10.', rating: 5},
                    {author: 'Audiophile', text: 'The bass is a bit flat, but the noise cancelling is magic.', rating: 4}
                ],
                variants: [{
                    name: 'Color',
                    values: [
                        { name: 'Black', description: 'Inconspicuous and elegant.', pros: ['Goes with everything'], cons: ['Standard'] },
                        { name: 'Cream', description: 'Soft and noble.', pros: ['Very modern'], cons: ['Scratches are visible'] }
                    ]
                }]
            },
            { 
                id: 'p_3', name: 'Smartwatch (Clay Edition)', price: 4500, category: 'LUXURY', imageUrl: '⌚', rating: 3.2, brand: 'SoftTime', inventoryType: 'OUTFIT',
                description: 'A luxurious-looking watch that is mainly held together by self-confidence and modeling clay.',
                specs: { Material: 'Premium Clay', Waterproof: 'Absolutely not', Display: 'Almost always' }, stock: 4, deliveryDays: 3,
                whyThisProduct: ['Makes a statement', 'Absolute unique piece', 'Guaranteed eye-catcher'],
                relatedProductIds: ['p_6', 'p_10'],
                reviews: [
                    {author: 'RolexFan', text: 'Looks deceptively real from afar.', rating: 4},
                    {author: 'RainVictim', text: 'Just melted away in the first rain. Bad quality.', rating: 1},
                    {author: 'IronyLover', text: 'Exactly what I wanted. Ironic luxury.', rating: 5}
                ],
                variants: [{
                    name: 'Strap',
                    values: [
                        { name: 'Gold-Look', description: 'Dyed clay that shines.', pros: ['Looks expensive'], cons: ['Rubs off easily'] },
                        { name: 'Neon-Pink', description: 'For a loud entrance.', pros: ['Very noticeable'], cons: ['Unsellable'] }
                    ]
                }]
            },
            { 
                id: 'p_4', name: 'Can of Fresh Air (Alps)', price: 80, category: 'ABSURD', imageUrl: '💨', rating: 4.9, brand: 'AlpenAtem', inventoryType: 'COLLECTIBLE',
                description: 'Hand-packed mountain air for your desk, shelf, or dramatic breathing pauses during meetings.',
                specs: { Origin: 'Fictional Alps', Volume: '400 ml', ShelfLife: 'Optimistic' }, stock: 99, deliveryDays: 2,
                whyThisProduct: ['Provides brief illusion of nature', 'Good conversation starter in the office'],
                relatedProductIds: ['p_9', 'p_5'],
                reviews: [
                    {author: 'BreathIn', text: 'Actually tastes like mountains.', rating: 5},
                    {author: 'Realist', text: "It's an empty can. Why did I buy this?", rating: 3}
                ],
                variants: [{
                    name: 'Altitude',
                    values: [
                        { name: '1000m', description: 'Mild alpine air.', pros: ['Cheap'], cons: ['Little aroma'] },
                        { name: '3000m', description: 'Thin air for experts.', pros: ['Exclusive'], cons: ['You breathe fast'] }
                    ]
                }]
            },
            { 
                id: 'p_5', name: 'Standard Toilet Paper', price: 5, category: 'EVERYDAY', imageUrl: '🧻', rating: 4.0, brand: 'RollGut', inventoryType: 'DECOR',
                description: 'Inconspicuous, reliable, and surprisingly decorative in minimalist rooms. A true crisis classic.',
                specs: { Layers: '4', Color: 'White', Scent: 'None, fortunately' }, stock: 250, deliveryDays: 1,
                whyThisProduct: ['You always need it', 'No frills, just function'],
                relatedProductIds: ['p_4'],
                reviews: [
                    {author: 'Customer', text: 'Does what it should.', rating: 4},
                    {author: 'Prepper', text: 'Ordered 500 pieces. Better safe than sorry.', rating: 5}
                ],
                variants: [{
                    name: 'Package',
                    values: [
                        { name: '1 Roll', description: 'For minimalists.', pros: ['Space-saving'], cons: ['Empty fast'] },
                        { name: '8 Rolls', description: 'The standard.', pros: ['Safe'], cons: ['Boring'] },
                        { name: 'Family Palace', description: '100 Rolls.', pros: ['Lasts a year'], cons: ['Room is full'] }
                    ]
                }]
            },
            { 
                id: 'p_6', name: 'Cyber Implant (Defective)', price: 15000, category: 'LUXURY', imageUrl: '🦾', rating: 2.1, brand: 'CyberKoala', inventoryType: 'OUTFIT',
                description: 'A purely cosmetic cyber accessory with no medical function. Twitches randomly.',
                specs: { Condition: 'Defective', LEDs: '7', Warranty: 'Very theoretical' }, stock: 2, deliveryDays: 5,
                whyThisProduct: ['Looks dangerous', 'Blinks wildly', 'Cool dystopia vibe'],
                relatedProductIds: ['p_14', 'p_3'],
                reviews: [
                    {author: 'Edgerunner', text: 'Twitches uncontrollably sometimes. Knocked over my coffee.', rating: 2},
                    {author: 'CyberFan', text: 'The used look is fantastic.', rating: 4}
                ],
                variants: [{
                    name: 'Side',
                    values: [
                        { name: 'Left', description: 'For left-handers.', pros: ['Noticeable'], cons: ['Heavy'] },
                        { name: 'Right', description: 'For right-handers.', pros: ['Good balance'], cons: ['Expensive'] }
                    ]
                }]
            },
            { 
                id: 'p_7', name: 'Own Space Station (Orbital)', price: 2500000, category: 'ABSURD', imageUrl: '🛰️', rating: 5.0, brand: 'OrbitHome', inventoryType: 'DECOR',
                description: 'A compact space station for a very large virtual living room. Ultimate luxury.',
                specs: { Orbit: 'Decorative', Rooms: '12', View: 'Priceless' }, stock: 1, deliveryDays: 14,
                whyThisProduct: ['The ultimate flex', 'Priceless view', 'Microgravity included'],
                relatedProductIds: ['p_9'],
                reviews: [
                    {author: 'Elon M.', text: "Good value for money. I'll take two.", rating: 5},
                    {author: 'Astronaut', text: 'A bit drafty in the bathroom, but the view of Earth is nice.', rating: 4}
                ],
                variants: [{
                    name: 'Equipment',
                    values: [
                        { name: 'Basic', description: 'Just the essentials.', pros: ['"Cheap"'], cons: ['No pool'] },
                        { name: 'Luxury', description: 'With zero-G pool.', pros: ['Pool in Space!'], cons: ['Priceless'] }
                    ]
                }]
            },
            { 
                id: 'p_8', name: 'Gaming Chair (RGB)', price: 400, category: 'EVERYDAY', imageUrl: '🪑', rating: 4.6, brand: 'SeatRGB', inventoryType: 'DECOR',
                description: 'Ergonomic gaming chair with more lighting than some downtowns. Electricity costs exclusive.',
                specs: { RGB: '16.7M Colors', MaxLoad: '150 kg', Comfort: 'Legendary' }, stock: 18, deliveryDays: 2,
                whyThisProduct: ['Increases FPS (felt)', 'Very comfortable', 'Blinds the neighbors'],
                relatedProductIds: ['p_14', 'p_1'],
                reviews: [
                    {author: 'GamerGirl', text: 'Lights up in 16M colors. My room looks like a disco.', rating: 5},
                    {author: 'NoScope', text: 'Squeaks a bit when leaning back.', rating: 4}
                ],
                variants: [{
                    name: 'Edition',
                    values: [
                        { name: 'Black/RGB', description: 'Classic black, colorful lights.', pros: ['Timeless'], cons: ['Dust trap'] },
                        { name: 'White/Neon', description: 'Extremely eye-catching.', pros: ['Modern'], cons: ['Dirt sensitive'] }
                    ]
                }]
            },
            { 
                id: 'p_9', name: 'Virtual NFT Koala', price: 8000, category: 'ABSURD', imageUrl: '🖼️', rating: 1.0, brand: 'ChainLeaf', inventoryType: 'COLLECTIBLE',
                description: 'A locally stored digital collectible without blockchain and without speculation. Just an expensive image.',
                specs: { Format: 'PNG-ish', Rarity: 'Claimed', Resell: 'No' }, stock: 999, deliveryDays: 1,
                whyThisProduct: ['Burn money with style', 'You can print it out'],
                relatedProductIds: ['p_7', 'p_3'],
                reviews: [
                    {author: 'CryptoBro', text: 'To the moon! (Value dropped to 0).', rating: 1},
                    {author: 'ArtCritic', text: 'A masterful commentary on digital transience.', rating: 5}
                ],
                variants: [{
                    name: 'Motif',
                    values: [
                        { name: 'Bored Koala', description: 'Yawns.', pros: ['Authentic'], cons: ['Expensive'] },
                        { name: 'Laser Eyes', description: 'With red eyes.', pros: ['Meme value'], cons: ['Even more expensive'] }
                    ]
                }]
            },
            { 
                id: 'p_10', name: 'Koala Streetwear Hoodie', price: 180, category: 'EVERYDAY', imageUrl: '🧥', rating: 4.7, brand: 'SoftLeaf', inventoryType: 'OUTFIT',
                description: 'Heavy oversize hoodie for your virtual outfit. Made from the finest organic cotton.',
                specs: { Material: 'Organic Cotton', Cut: 'Oversize' }, stock: 44, deliveryDays: 2,
                whyThisProduct: ['Extremely soft', 'Casual look', 'Large hood to hide'],
                relatedProductIds: ['p_11', 'p_2'],
                reviews: [
                    { author: 'Mira', text: 'Very soft and pleasantly oversized. Perfect.', rating: 5 },
                    { author: 'FashionFail', text: 'The fabric pills slightly after the first wash.', rating: 4 }
                ],
                variants: [{
                    name: 'Color',
                    values: [
                        { name: 'Lilac', description: 'Subtle and fresh.', pros: ['Spring vibe'], cons: ['Stain sensitive'] },
                        { name: 'Night Black', description: 'The ninja look.', pros: ['Slimming'], cons: ['Dog hair sticks'] }
                    ]
                }]
            },
            { 
                id: 'p_11', name: 'Eucalyptus Runner', price: 220, category: 'LUXURY', imageUrl: '👟', rating: 4.6, brand: 'LeafStep', inventoryType: 'OUTFIT',
                description: 'Limited sneaker for complete Koala looks. With extra thick sole for soft stepping.',
                specs: { Sole: 'Cloud Foam', Edition: '2026' }, stock: 17, deliveryDays: 3,
                whyThisProduct: ['Limited', 'Walks like on clouds', 'Matches everything'],
                relatedProductIds: ['p_10'],
                reviews: [
                    { author: 'SprintKoala', text: "Looks fast, that's enough for me.", rating: 5 },
                    { author: 'Sneakerhead', text: 'The box arrived slightly dented. Shoe is ok.', rating: 3 }
                ],
                variants: [{
                    name: 'Size & Fit',
                    values: [
                        { name: 'Standard', description: 'Normal width.', pros: ['Usually fits'], cons: ['Nothing special'] },
                        { name: 'Wide (Oversize)', description: 'For wider feet.', pros: ['Comfortable'], cons: ['Looks chunky'] }
                    ]
                }]
            },
            { 
                id: 'p_12', name: 'Koala GT Electric', price: 68000, category: 'LUXURY', imageUrl: '🏎️', rating: 4.9, brand: 'Koala Motors', inventoryType: 'VEHICLE',
                description: 'Electric Grand Tourer for the virtual dream garage. Accelerates faster than you can look.',
                specs: { Power: '640 HP', Range: '610 km', Seats: '4' }, stock: 3, deliveryDays: 7,
                whyThisProduct: ['No emissions', 'Incredible acceleration', 'Lots of space'],
                relatedProductIds: ['p_13'],
                reviews: [
                    { author: 'Volt', text: 'Looks excellent in my virtual garage.', rating: 5 },
                    { author: 'PetrolHead', text: 'Has no engine sound. Boring.', rating: 2 }
                ],
                variants: [{
                    name: 'Paint',
                    values: [
                        { name: 'Midnight', description: 'Deep black.', pros: ['Evil look'], cons: ['Gets hot quickly'] },
                        { name: 'Eucalyptus Pearl', description: 'Glimmers greenish.', pros: ['Unique'], cons: ['Surcharge'] }
                    ]
                }]
            },
            { 
                id: 'p_13', name: 'City Leaf Scooter', price: 3400, category: 'EVERYDAY', imageUrl: '🛵', rating: 4.4, brand: 'UrbanLeaf', inventoryType: 'VEHICLE',
                description: 'Quiet electric scooter for your garage. Perfect for the virtual traffic jam.',
                specs: { Range: '90 km', Speed: '80 km/h' }, stock: 9, deliveryDays: 4,
                whyThisProduct: ['Gets through everywhere', 'Easy to park', 'Stylish'],
                relatedProductIds: ['p_12', 'p_10'],
                reviews: [
                    { author: 'CityKoala', text: 'Perfect for short virtual trips to the cafe.', rating: 5 },
                    { author: 'Racer', text: 'Could be a bit faster.', rating: 3 }
                ],
                variants: [{
                    name: 'Equipment',
                    values: [
                        { name: 'City', description: 'Just the vehicle.', pros: ['Cheap'], cons: ['Little storage'] },
                        { name: 'Commuter Bundle', description: 'With top case.', pros: ['Practical'], cons: ['Less aerodynamic'] }
                    ]
                }]
            },
            { 
                id: 'p_14', name: 'Creator Workstation Ultra', price: 7900, category: 'LUXURY', imageUrl: '🖥️', rating: 4.8, brand: 'KoalaCompute', inventoryType: 'ELECTRONICS',
                description: 'An uncompromising workstation for your electronics setup. Renders everything in record time.',
                specs: { GPU: 'Leaf RTX 6090', Storage: '8 TB SSD', Cooling: 'Whisper quiet' }, stock: 6, deliveryDays: 4,
                whyThisProduct: ['Infinite power', 'Future-proof', 'Looks extremely professional'],
                relatedProductIds: ['p_1', 'p_8'],
                reviews: [
                    { author: 'RenderKid', text: 'Renders my wishlist in 8K without breaking a sweat.', rating: 5 },
                    { author: 'MacFan', text: 'Way too big and clunky.', rating: 2 }
                ],
                variants: [{
                    name: 'RAM',
                    values: [
                        { name: '64 GB', description: 'For normal pros.', pros: ['Sufficient'], cons: ['Maybe soon too little'] },
                        { name: '256 GB', description: 'For 3D Artists.', pros: ['Future-proof'], cons: ['Very expensive'] }
                    ]
                }]
            },
            { 
                id: 'p_15', name: 'Modular Sofa Cloud', price: 2400, category: 'LUXURY', imageUrl: '🛋️', rating: 4.7, brand: 'Nest', inventoryType: 'DECOR',
                description: 'Large modular sofa for purchased properties. You sink in and never get up again.',
                specs: { Modules: '5', Width: '320 cm' }, stock: 8, deliveryDays: 5,
                whyThisProduct: ['Ultra comfortable', 'Expandable', 'Washable covers'],
                relatedProductIds: ['p_5', 'p_8'],
                reviews: [
                    { author: 'HomeKoala', text: 'My loft instantly looks much more expensive. Very soft.', rating: 5 },
                    { author: 'Minimalist', text: 'Takes up half the room.', rating: 3 }
                ],
                variants: [{
                    name: 'Cover',
                    values: [
                        { name: 'Sand (Linen)', description: 'Natural and breathable.', pros: ['Beautiful'], cons: ['Scratchy'] },
                        { name: 'Moss (Velvet)', description: 'Very luxurious.', pros: ['Soft'], cons: ['Hard to clean'] }
                    ]
                }]
            },
            {
                id: 'p_mystery_gold', name: 'Gold Mystery Box', price: 750, category: 'MYSTERY', imageUrl: '🎁', rating: 4.9, brand: 'KoalaShip', inventoryType: 'COLLECTIBLE',
                description: "A mysterious golden box. Nobody knows what's inside (Spoiler: some other product).",
                specs: { Tension: 'Extremely high', Return: 'Not possible' }, stock: 100, deliveryDays: 1,
                whyThisProduct: ['Pure thrill', 'The chance for something expensive', 'Unboxing is fun'],
                relatedProductIds: [],
                reviews: [
                    { author: 'LuckyLeaf', text: 'The tension was almost better than the actual content.', rating: 5 },
                    { author: 'Unlucky', text: 'Got standard toilet paper for 750 KC. I am furious.', rating: 1 }
                ],
                variants: [{
                    name: 'Packaging',
                    values: [
                        { name: 'Standard Gold', description: 'Golden paper.', pros: ['Shines'], cons: ['Tears quickly'] },
                        { name: 'Premium Ribbon', description: 'With red ribbon.', pros: ['Even more exciting'], cons: ['Surcharge'] }
                    ]
                }]
            }
        ];
    }
    if (locale === 'ES') {
        return [
            { 
                id: 'p_1', name: 'KoalaPad Pro Max', price: 1200, category: 'LUXURY', imageUrl: '📱', rating: 4.8, brand: 'KoalaTech', inventoryType: 'ELECTRONICS',
                description: 'Una tableta premium grande para transmitir, dibujar y hacer investigaciones muy importantes sobre carritos de compras.',
                specs: { Pantalla: '13 pulgadas OLED', Almacenamiento: '512 GB', Batería: '20 horas' }, stock: 12, deliveryDays: 2,
                whyThisProduct: ['Pantalla de gran nitidez', 'Perfecto para fingir que trabajas', 'Símbolo de estatus en cafés'],
                relatedProductIds: ['p_2', 'p_14'],
                reviews: [
                    {author: 'TechGuru', text: 'La mejor tableta, mi koala desliza durante horas.', rating: 5},
                    {author: 'Hater99', text: 'La batería solo dura 20 horas. Demasiado poco para un maratón real.', rating: 4},
                    {author: 'Escéptico', text: 'Básicamente es solo una tabla cara con cristal.', rating: 3}
                ],
                variants: [{
                    name: 'Color',
                    values: [
                        { name: 'Gris Espacial', description: 'El clásico para koalas de negocios.', pros: ['Las huellas no se ven', 'Serio'], cons: ['Aburrido'] },
                        { name: 'Verde Eucalipto', description: 'La edición exclusiva.', pros: ['Se ve fantástico', 'Raro'], cons: ['No combina con cualquier atuendo'], priceModifier: 50 },
                        { name: 'Blanco Polar', description: 'Minimalista y limpio.', pros: ['Estético'], cons: ['Se ensucia rápido'] }
                    ]
                }]
            },
            { 
                id: 'p_2', name: 'Eucalipto con Cancelación de Ruido', price: 350, category: 'EVERYDAY', imageUrl: '🎧', rating: 4.5, brand: 'LeafAudio', inventoryType: 'ELECTRONICS',
                description: 'Auriculares inalámbricos con cancelación activa de ruido y modo especial de transparencia de crujido de hojas.',
                specs: { Autonomía: '38 horas', Conexión: 'Bluetooth 5.3', Peso: '248 g' }, stock: 31, deliveryDays: 1,
                whyThisProduct: ['Bloquea el ruido de la ciudad', 'Extremadamente ligero', 'Batería de larga duración'],
                relatedProductIds: ['p_1', 'p_10'],
                reviews: [
                    {author: 'Sleepy', text: 'Por fin silencio absoluto al masticar. 10/10.', rating: 5},
                    {author: 'Audiófilo', text: 'Los bajos son algo planos, pero la cancelación es mágica.', rating: 4}
                ],
                variants: [{
                    name: 'Color',
                    values: [
                        { name: 'Negro', description: 'Discreto y elegante.', pros: ['Combina con todo'], cons: ['Estándar'] },
                        { name: 'Crema', description: 'Suave y noble.', pros: ['Muy moderno'], cons: ['Se ven los rasguños'] }
                    ]
                }]
            },
            { 
                id: 'p_3', name: 'Reloj Inteligente (Edición Plastilina)', price: 4500, category: 'LUXURY', imageUrl: '⌚', rating: 3.2, brand: 'SoftTime', inventoryType: 'OUTFIT',
                description: 'Un reloj de aspecto lujoso que se mantiene unido principalmente por la confianza en sí mismo y la plastilina.',
                specs: { Material: 'Plastilina Premium', Impermeable: 'Para nada', Pantalla: 'Casi siempre' }, stock: 4, deliveryDays: 3,
                whyThisProduct: ['Es una declaración', 'Pieza única', 'Atrae todas las miradas'],
                relatedProductIds: ['p_6', 'p_10'],
                reviews: [
                    {author: 'RolexFan', text: 'Se ve engañosamente real desde lejos.', rating: 4},
                    {author: 'RainVictim', text: 'Simplemente se derritió en la primera lluvia. Mala calidad.', rating: 1},
                    {author: 'AmanteIronía', text: 'Exactamente lo que quería. Lujo irónico.', rating: 5}
                ],
                variants: [{
                    name: 'Correa',
                    values: [
                        { name: 'Look Dorado', description: 'Plastilina teñida que brilla.', pros: ['Parece caro'], cons: ['Destiñe fácilmente'] },
                        { name: 'Rosa Neón', description: 'Para una entrada ruidosa.', pros: ['Muy llamativo'], cons: ['Invendible'] }
                    ]
                }]
            },
            { 
                id: 'p_4', name: 'Lata de Aire Fresco (Alpes)', price: 80, category: 'ABSURD', imageUrl: '💨', rating: 4.9, brand: 'AlpenAtem', inventoryType: 'COLLECTIBLE',
                description: 'Aire de montaña empaquetado a mano para escritorio, estante o pausas dramáticas en reuniones.',
                specs: { Origen: 'Alpes Ficticios', Contenido: '400 ml', VidaÚtil: 'Optimista' }, stock: 99, deliveryDays: 2,
                whyThisProduct: ['Da una breve ilusión de naturaleza', 'Buen tema de conversación'],
                relatedProductIds: ['p_9', 'p_5'],
                reviews: [
                    {author: 'BreathIn', text: 'Realmente sabe a montañas.', rating: 5},
                    {author: 'Realista', text: 'Es una lata vacía. ¿Por qué compré esto?', rating: 3}
                ],
                variants: [{
                    name: 'Altitud',
                    values: [
                        { name: '1000m', description: 'Aire alpino suave.', pros: ['Barato'], cons: ['Poco aroma'] },
                        { name: '3000m', description: 'Aire fino para expertos.', pros: ['Exclusivo'], cons: ['Respiras rápido'] }
                    ]
                }]
            },
            { 
                id: 'p_5', name: 'Papel Higiénico Estándar', price: 5, category: 'EVERYDAY', imageUrl: '🧻', rating: 4.0, brand: 'RollGut', inventoryType: 'DECOR',
                description: 'Inadvertido, confiable y sorprendentemente decorativo. Un verdadero clásico de crisis.',
                specs: { Capas: '4', Color: 'Blanco', Aroma: 'Ninguno, por suerte' }, stock: 250, deliveryDays: 1,
                whyThisProduct: ['Siempre lo necesitas', 'Sin adornos, solo función'],
                relatedProductIds: ['p_4'],
                reviews: [
                    {author: 'Cliente', text: 'Hace lo que debe.', rating: 4},
                    {author: 'Prepper', text: 'Pedí 500 piezas. Más vale prevenir.', rating: 5}
                ],
                variants: [{
                    name: 'Paquete',
                    values: [
                        { name: '1 Rollo', description: 'Para minimalistas.', pros: ['Ahorra espacio'], cons: ['Se acaba rápido'] },
                        { name: '8 Rollos', description: 'El estándar.', pros: ['Seguro'], cons: ['Aburrido'] },
                        { name: 'Palacio Familiar', description: '100 Rollos.', pros: ['Dura un año'], cons: ['Habitación llena'] }
                    ]
                }]
            },
            { 
                id: 'p_6', name: 'Implante Cibernético (Defectuoso)', price: 15000, category: 'LUXURY', imageUrl: '🦾', rating: 2.1, brand: 'CyberKoala', inventoryType: 'OUTFIT',
                description: 'Un accesorio cibernético puramente cosmético sin función médica. Tiembla aleatoriamente.',
                specs: { Condición: 'Defectuoso', LEDs: '7', Garantía: 'Muy teórica' }, stock: 2, deliveryDays: 5,
                whyThisProduct: ['Se ve peligroso', 'Parpadea salvajemente', 'Genial vibra distópica'],
                relatedProductIds: ['p_14', 'p_3'],
                reviews: [
                    {author: 'Edgerunner', text: 'Tiembla incontrolablemente a veces. Derramó mi café.', rating: 2},
                    {author: 'CyberFan', text: 'El aspecto usado es fantástico.', rating: 4}
                ],
                variants: [{
                    name: 'Lado',
                    values: [
                        { name: 'Izquierdo', description: 'Para zurdos.', pros: ['Llamativo'], cons: ['Pesado'] },
                        { name: 'Derecho', description: 'Para diestros.', pros: ['Buen equilibrio'], cons: ['Caro'] }
                    ]
                }]
            },
            { 
                id: 'p_7', name: 'Estación Espacial Propia', price: 2500000, category: 'ABSURD', imageUrl: '🛰️', rating: 5.0, brand: 'OrbitHome', inventoryType: 'DECOR',
                description: 'Una estación espacial compacta para una sala de estar virtual muy grande. Lujo definitivo.',
                specs: { Órbita: 'Decorativa', Habitaciones: '12', Vista: 'Invaluable' }, stock: 1, deliveryDays: 14,
                whyThisProduct: ['La máxima presunción', 'Vista invaluable', 'Microgravedad incluida'],
                relatedProductIds: ['p_9'],
                reviews: [
                    {author: 'Elon M.', text: 'Buena relación calidad-precio. Me llevo dos.', rating: 5},
                    {author: 'Astronauta', text: 'Un poco de corriente en el baño, pero la vista de la Tierra es bonita.', rating: 4}
                ],
                variants: [{
                    name: 'Equipamiento',
                    values: [
                        { name: 'Básico', description: 'Solo lo esencial.', pros: ['"Barato"'], cons: ['Sin piscina'] },
                        { name: 'Lujo', description: 'Con piscina gravedad cero.', pros: ['¡Piscina espacial!'], cons: ['Invaluable'] }
                    ]
                }]
            },
            { 
                id: 'p_8', name: 'Silla Gaming (RGB)', price: 400, category: 'EVERYDAY', imageUrl: '🪑', rating: 4.6, brand: 'SeatRGB', inventoryType: 'DECOR',
                description: 'Silla ergonómica para juegos con más iluminación que algunos centros urbanos. Electricidad no incluida.',
                specs: { RGB: '16.7M Colores', CargaMax: '150 kg', Confort: 'Legendario' }, stock: 18, deliveryDays: 2,
                whyThisProduct: ['Aumenta los FPS (percibido)', 'Muy cómoda', 'Ciega a los vecinos'],
                relatedProductIds: ['p_14', 'p_1'],
                reviews: [
                    {author: 'GamerGirl', text: 'Se ilumina en 16M de colores. Mi habitación parece una discoteca.', rating: 5},
                    {author: 'NoScope', text: 'Chirría un poco al reclinarse.', rating: 4}
                ],
                variants: [{
                    name: 'Edición',
                    values: [
                        { name: 'Negro/RGB', description: 'Negro clásico, luces coloridas.', pros: ['Atemporal'], cons: ['Atrapa polvo'] },
                        { name: 'Blanco/Neón', description: 'Extremadamente llamativo.', pros: ['Moderno'], cons: ['Sensible a la suciedad'] }
                    ]
                }]
            },
            { 
                id: 'p_9', name: 'Koala NFT Virtual', price: 8000, category: 'ABSURD', imageUrl: '🖼️', rating: 1.0, brand: 'ChainLeaf', inventoryType: 'COLLECTIBLE',
                description: 'Un objeto de colección digital almacenado localmente sin blockchain y sin especulación. Solo una imagen cara.',
                specs: { Formato: 'Casi PNG', Rareza: 'Afirmada', Reventa: 'No' }, stock: 999, deliveryDays: 1,
                whyThisProduct: ['Quemar dinero con estilo', 'Puedes imprimirlo'],
                relatedProductIds: ['p_7', 'p_3'],
                reviews: [
                    {author: 'CryptoBro', text: '¡A la luna! (El valor cayó a 0).', rating: 1},
                    {author: 'CríticoDeArte', text: 'Un comentario magistral sobre la fugacidad digital.', rating: 5}
                ],
                variants: [{
                    name: 'Motivo',
                    values: [
                        { name: 'Koala Aburrido', description: 'Bosteza.', pros: ['Auténtico'], cons: ['Caro'] },
                        { name: 'Ojos Láser', description: 'Con ojos rojos.', pros: ['Valor meme'], cons: ['Aún más caro'] }
                    ]
                }]
            },
            { 
                id: 'p_10', name: 'Sudadera Koala Streetwear', price: 180, category: 'EVERYDAY', imageUrl: '🧥', rating: 4.7, brand: 'SoftLeaf', inventoryType: 'OUTFIT',
                description: 'Sudadera oversize pesada para tu atuendo virtual. Hecha de algodón orgánico fino.',
                specs: { Material: 'Algodón Orgánico', Corte: 'Oversize' }, stock: 44, deliveryDays: 2,
                whyThisProduct: ['Extremadamente suave', 'Look casual', 'Capucha grande para esconderse'],
                relatedProductIds: ['p_11', 'p_2'],
                reviews: [
                    { author: 'Mira', text: 'Muy suave y agradablemente grande. Perfecto.', rating: 5 },
                    { author: 'FashionFail', text: 'La tela hace bolitas tras el primer lavado.', rating: 4 }
                ],
                variants: [{
                    name: 'Color',
                    values: [
                        { name: 'Lila', description: 'Sutil y fresco.', pros: ['Vibra de primavera'], cons: ['Sensible a manchas'] },
                        { name: 'Negro Noche', description: 'El look ninja.', pros: ['Adelgaza'], cons: ['Pelos de perro se pegan'] }
                    ]
                }]
            },
            { 
                id: 'p_11', name: 'Runner Eucalipto', price: 220, category: 'LUXURY', imageUrl: '👟', rating: 4.6, brand: 'LeafStep', inventoryType: 'OUTFIT',
                description: 'Zapatilla limitada para looks completos de koala. Suela extra gruesa para pisada suave.',
                specs: { Suela: 'Espuma Nube', Edición: '2026' }, stock: 17, deliveryDays: 3,
                whyThisProduct: ['Limitado', 'Camina como en las nubes', 'Combina con todo'],
                relatedProductIds: ['p_10'],
                reviews: [
                    { author: 'SprintKoala', text: 'Se ven rápidas, eso es suficiente para mí.', rating: 5 },
                    { author: 'Sneakerhead', text: 'La caja llegó un poco abollada. Zapato ok.', rating: 3 }
                ],
                variants: [{
                    name: 'Talla y Ajuste',
                    values: [
                        { name: 'Estándar', description: 'Ancho normal.', pros: ['Suele quedar bien'], cons: ['Nada especial'] },
                        { name: 'Ancho (Oversize)', description: 'Para pies más anchos.', pros: ['Cómodo'], cons: ['Se ve tosco'] }
                    ]
                }]
            },
            { 
                id: 'p_12', name: 'Koala GT Eléctrico', price: 68000, category: 'LUXURY', imageUrl: '🏎️', rating: 4.9, brand: 'Koala Motors', inventoryType: 'VEHICLE',
                description: 'Gran Turismo eléctrico para el garaje de ensueño virtual. Acelera más rápido de lo que puedes mirar.',
                specs: { Potencia: '640 CV', Rango: '610 km', Asientos: '4' }, stock: 3, deliveryDays: 7,
                whyThisProduct: ['Sin emisiones', 'Aceleración increíble', 'Mucho espacio'],
                relatedProductIds: ['p_13'],
                reviews: [
                    { author: 'Volt', text: 'Se ve excelente en mi garaje virtual.', rating: 5 },
                    { author: 'PetrolHead', text: 'No tiene sonido de motor. Aburrido.', rating: 2 }
                ],
                variants: [{
                    name: 'Pintura',
                    values: [
                        { name: 'Medianoche', description: 'Negro profundo.', pros: ['Aspecto malvado'], cons: ['Se calienta rápido'] },
                        { name: 'Perla Eucalipto', description: 'Brilla verdoso.', pros: ['Único'], cons: ['Recargo'] }
                    ]
                }]
            },
            { 
                id: 'p_13', name: 'Scooter City Leaf', price: 3400, category: 'EVERYDAY', imageUrl: '🛵', rating: 4.4, brand: 'UrbanLeaf', inventoryType: 'VEHICLE',
                description: 'Scooter eléctrico silencioso para tu garaje. Perfecto para el atasco virtual.',
                specs: { Rango: '90 km', Velocidad: '80 km/h' }, stock: 9, deliveryDays: 4,
                whyThisProduct: ['Pasa por todas partes', 'Fácil de aparcar', 'Elegante'],
                relatedProductIds: ['p_12', 'p_10'],
                reviews: [
                    { author: 'CityKoala', text: 'Perfecto para viajes cortos virtuales a la cafetería.', rating: 5 },
                    { author: 'Corredor', text: 'Podría ser un poco más rápido.', rating: 3 }
                ],
                variants: [{
                    name: 'Equipamiento',
                    values: [
                        { name: 'City', description: 'Solo el vehículo.', pros: ['Barato'], cons: ['Poco almacenamiento'] },
                        { name: 'Pack Viajero', description: 'Con maletero superior.', pros: ['Práctico'], cons: ['Menos aerodinámico'] }
                    ]
                }]
            },
            { 
                id: 'p_14', name: 'Workstation Creator Ultra', price: 7900, category: 'LUXURY', imageUrl: '🖥️', rating: 4.8, brand: 'KoalaCompute', inventoryType: 'ELECTRONICS',
                description: 'Una estación de trabajo intransigente para tu setup. Renderiza todo en tiempo récord.',
                specs: { GPU: 'Leaf RTX 6090', Almacenamiento: '8 TB SSD', Enfriamiento: 'Silencioso' }, stock: 6, deliveryDays: 4,
                whyThisProduct: ['Poder infinito', 'A prueba de futuro', 'Se ve muy profesional'],
                relatedProductIds: ['p_1', 'p_8'],
                reviews: [
                    { author: 'RenderKid', text: 'Renderiza mi lista de deseos en 8K sin sudar.', rating: 5 },
                    { author: 'MacFan', text: 'Demasiado grande y torpe.', rating: 2 }
                ],
                variants: [{
                    name: 'RAM',
                    values: [
                        { name: '64 GB', description: 'Para profesionales normales.', pros: ['Suficiente'], cons: ['Quizás pronto muy poco'] },
                        { name: '256 GB', description: 'Para artistas 3D.', pros: ['A prueba de futuro'], cons: ['Muy caro'] }
                    ]
                }]
            },
            { 
                id: 'p_15', name: 'Sofá Modular Cloud', price: 2400, category: 'LUXURY', imageUrl: '🛋️', rating: 4.7, brand: 'Nest', inventoryType: 'DECOR',
                description: 'Gran sofá modular para propiedades compradas. Te hundes y nunca vuelves a levantarte.',
                specs: { Módulos: '5', Ancho: '320 cm' }, stock: 8, deliveryDays: 5,
                whyThisProduct: ['Ultra cómodo', 'Ampliable', 'Fundas lavables'],
                relatedProductIds: ['p_5', 'p_8'],
                reviews: [
                    { author: 'HomeKoala', text: 'Mi loft parece instantáneamente más caro. Muy suave.', rating: 5 },
                    { author: 'Minimalista', text: 'Ocupa la mitad de la habitación.', rating: 3 }
                ],
                variants: [{
                    name: 'Funda',
                    values: [
                        { name: 'Arena (Lino)', description: 'Natural y transpirable.', pros: ['Hermoso'], cons: ['Pica un poco'] },
                        { name: 'Musgo (Terciopelo)', description: 'Muy lujoso.', pros: ['Suave'], cons: ['Difícil de limpiar'] }
                    ]
                }]
            },
            {
                id: 'p_mystery_gold', name: 'Caja Misteriosa de Oro', price: 750, category: 'MYSTERY', imageUrl: '🎁', rating: 4.9, brand: 'KoalaShip', inventoryType: 'COLLECTIBLE',
                description: 'Una misteriosa caja dorada. Nadie sabe qué hay dentro (Spoiler: algún otro producto).',
                specs: { Tensión: 'Extremadamente alta', Devolución: 'No posible' }, stock: 100, deliveryDays: 1,
                whyThisProduct: ['Emoción pura', 'La oportunidad de algo caro', 'Abrirlo es divertido'],
                relatedProductIds: [],
                reviews: [
                    { author: 'LuckyLeaf', text: 'La tensión fue casi mejor que el contenido real.', rating: 5 },
                    { author: 'MalaSuerte', text: 'Obtuve papel higiénico estándar por 750 KC. Estoy furioso.', rating: 1 }
                ],
                variants: [{
                    name: 'Empaque',
                    values: [
                        { name: 'Oro Estándar', description: 'Papel dorado.', pros: ['Brilla'], cons: ['Se rompe rápido'] },
                        { name: 'Lazo Premium', description: 'Con lazo rojo.', pros: ['Aún más emocionante'], cons: ['Recargo'] }
                    ]
                }]
            }
        ];
    }
    
    // Default DE
    return [
        { 
            id: 'p_1', name: 'KoalaPad Pro Max', price: 1200, category: 'LUXURY', imageUrl: '📱', rating: 4.8, brand: 'KoalaTech', inventoryType: 'ELECTRONICS',
            description: 'Ein großes Premium-Tablet für Streaming, Zeichnen und sehr wichtige Warenkorb-Recherche.',
            specs: { Display: '13 Zoll OLED', Speicher: '512 GB', Akku: '20 Stunden' }, stock: 12, deliveryDays: 2,
            whyThisProduct: ['Gestochen scharfes Display', 'Perfekt um so zu tun, als würde man arbeiten', 'Statussymbol im Café'],
            relatedProductIds: ['p_2', 'p_14'],
            reviews: [
                {author: 'TechGuru', text: 'Bestes Tablet, mein Koala wischt stundenlang.', rating: 5},
                {author: 'Hater99', text: 'Akku hält nur 20 Stunden. Viel zu wenig für einen echten Marathon.', rating: 4},
                {author: 'Skeptiker', text: 'Ist eigentlich nur ein überteuertes Brett mit Glas.', rating: 3}
            ],
            variants: [{
                name: 'Farbe',
                values: [
                    { name: 'Space Grau', description: 'Der Klassiker für Business-Koalas.', pros: ['Fingerabdrücke fallen nicht auf', 'Seriös'], cons: ['Langweilig'] },
                    { name: 'Eukalyptus Grün', description: 'Die Signature-Edition.', pros: ['Sieht fantastisch aus', 'Selten'], cons: ['Passt nicht zu jedem Outfit'], priceModifier: 50 },
                    { name: 'Polar Weiß', description: 'Minimalistisch und clean.', pros: ['Ästhetisch'], cons: ['Wird schnell schmutzig'] }
                ]
            }]
        },
        { 
            id: 'p_2', name: 'Noise-Cancelling Eukalyptus', price: 350, category: 'EVERYDAY', imageUrl: '🎧', rating: 4.5, brand: 'LeafAudio', inventoryType: 'ELECTRONICS',
            description: 'Kabellose Kopfhörer mit aktiver Geräuschunterdrückung und speziellem Blattgeräusch-Transparenz-Modus.',
            specs: { Laufzeit: '38 Stunden', Verbindung: 'Bluetooth 5.3', Gewicht: '248 g' }, stock: 31, deliveryDays: 1,
            whyThisProduct: ['Blendet Großstadtlärm aus', 'Extrem leicht und bequem', 'Lange Akkulaufzeit'],
            relatedProductIds: ['p_1', 'p_10'],
            reviews: [
                {author: 'Sleepy', text: 'Endlich absolute Ruhe beim Kauen. 10/10.', rating: 5},
                {author: 'Audiophil', text: 'Die Bässe sind etwas flach, aber das Noise-Cancelling ist Magie.', rating: 4}
            ],
            variants: [{
                name: 'Farbe',
                values: [
                    { name: 'Schwarz', description: 'Unauffällig und elegant.', pros: ['Passt zu allem'], cons: ['Standard'] },
                    { name: 'Creme', description: 'Sanft und edel.', pros: ['Sehr modern'], cons: ['Kratzer sichtbar'] }
                ]
            }]
        },
        { 
            id: 'p_3', name: 'Smartwatch (Knetmasse Edition)', price: 4500, category: 'LUXURY', imageUrl: '⌚', rating: 3.2, brand: 'SoftTime', inventoryType: 'OUTFIT',
            description: 'Eine luxuriös wirkende Uhr, die hauptsächlich durch Selbstbewusstsein und Knetmasse zusammengehalten wird.',
            specs: { Material: 'Premium-Knetmasse', Wasserfest: 'Auf keinen Fall', Anzeige: 'Fast immer' }, stock: 4, deliveryDays: 3,
            whyThisProduct: ['Setzt ein Statement', 'Absolutes Unikat', 'Zieht garantiert Blicke auf sich'],
            relatedProductIds: ['p_6', 'p_10'],
            reviews: [
                {author: 'RolexFan', text: 'Sieht von weitem täuschend echt aus.', rating: 4},
                {author: 'RegenOpfer', text: 'Ist im ersten Regen einfach weggeschmolzen. Schlechte Qualität.', rating: 1},
                {author: 'IronieLiebhaber', text: 'Genau das, was ich wollte. Ironischer Luxus.', rating: 5}
            ],
            variants: [{
                name: 'Armband',
                values: [
                    { name: 'Gold-Look', description: 'Gefärbte Knete, die glänzt.', pros: ['Sieht teuer aus'], cons: ['Färbt leicht ab'] },
                    { name: 'Neon-Pink', description: 'Für den lauten Auftritt.', pros: ['Sehr auffällig'], cons: ['Unverkäuflich'] }
                ]
            }]
        },
        { 
            id: 'p_4', name: 'Dose frische Luft (Alpen)', price: 80, category: 'ABSURD', imageUrl: '💨', rating: 4.9, brand: 'AlpenAtem', inventoryType: 'COLLECTIBLE',
            description: 'Handverpackte Bergluft für Schreibtisch, Regal oder dramatische Atempausen während Meetings.',
            specs: { Herkunft: 'Fiktive Alpen', Inhalt: '400 ml', Haltbarkeit: 'Optimistisch' }, stock: 99, deliveryDays: 2,
            whyThisProduct: ['Spendet kurzfristige Illusion von Natur', 'Gutes Gesprächsthema im Büro'],
            relatedProductIds: ['p_9', 'p_5'],
            reviews: [
                {author: 'BreathIn', text: 'Schmeckt tatsächlich nach Bergen.', rating: 5},
                {author: 'Realist', text: 'Es ist eine leere Dose. Warum habe ich das gekauft?', rating: 3}
            ],
            variants: [{
                name: 'Höhenlage',
                values: [
                    { name: '1000m', description: 'Milde Alpenluft.', pros: ['Günstig'], cons: ['Wenig Aroma'] },
                    { name: '3000m', description: 'Dünne Luft für Experten.', pros: ['Exklusiv'], cons: ['Man atmet schnell'] }
                ]
            }]
        },
        { 
            id: 'p_5', name: 'Standard-Toilettenpapier', price: 5, category: 'EVERYDAY', imageUrl: '🧻', rating: 4.0, brand: 'RollGut', inventoryType: 'DECOR',
            description: 'Unauffällig, zuverlässig und erstaunlich dekorativ in minimalistischen Räumen. Ein echter Krisen-Klassiker.',
            specs: { Lagen: '4', Farbe: 'Weiß', Duft: 'Keiner, zum Glück' }, stock: 250, deliveryDays: 1,
            whyThisProduct: ['Man braucht es immer', 'Kein Schnickschnack, nur Funktion'],
            relatedProductIds: ['p_4'],
            reviews: [
                {author: 'Kunde', text: 'Tut was es soll.', rating: 4},
                {author: 'Prepper', text: 'Habe 500 Stück bestellt. Sicher ist sicher.', rating: 5}
            ],
            variants: [{
                name: 'Packung',
                values: [
                    { name: '1 Rolle', description: 'Für Minimalisten.', pros: ['Platzsparend'], cons: ['Schnell leer'] },
                    { name: '8 Rollen', description: 'Der Standard.', pros: ['Sicher'], cons: ['Langweilig'] },
                    { name: 'Familienpalast', description: '100 Rollen.', pros: ['Reicht ein Jahr'], cons: ['Zimmer ist voll'] }
                ]
            }]
        },
        { 
            id: 'p_6', name: 'Cyber-Implantat (defekt)', price: 15000, category: 'LUXURY', imageUrl: '🦾', rating: 2.1, brand: 'CyberKoala', inventoryType: 'OUTFIT',
            description: 'Ein rein kosmetisches Cyber-Accessoire ohne medizinische Funktion. Zuckt manchmal grundlos.',
            specs: { Zustand: 'Defekt', LEDs: '7', Garantie: 'Sehr theoretisch' }, stock: 2, deliveryDays: 5,
            whyThisProduct: ['Sieht gefährlich aus', 'Blinkt wild', 'Cooler Dystopie-Vibe'],
            relatedProductIds: ['p_14', 'p_3'],
            reviews: [
                {author: 'Edgerunner', text: 'Zuckt manchmal unkontrolliert. Hat meinen Kaffee umgestoßen.', rating: 2},
                {author: 'CyberFan', text: 'Der Used-Look ist fantastisch.', rating: 4}
            ],
            variants: [{
                name: 'Seite',
                values: [
                    { name: 'Links', description: 'Für Linkshänder.', pros: ['Auffällig'], cons: ['Schwer'] },
                    { name: 'Rechts', description: 'Für Rechtshänder.', pros: ['Gute Balance'], cons: ['Teuer'] }
                ]
            }]
        },
        { 
            id: 'p_7', name: 'Eigene Raumstation (Orbital)', price: 2500000, category: 'ABSURD', imageUrl: '🛰️', rating: 5.0, brand: 'OrbitHome', inventoryType: 'DECOR',
            description: 'Eine kompakte Raumstation für das sehr große virtuelle Wohnzimmer. Endgültiger Luxus.',
            specs: { Umlaufbahn: 'Dekorativ', Zimmer: '12', Aussicht: 'Unbezahlbar' }, stock: 1, deliveryDays: 14,
            whyThisProduct: ['Der ultimative Flex', 'Unbezahlbare Aussicht', 'Mikrogravitation inklusive'],
            relatedProductIds: ['p_9'],
            reviews: [
                {author: 'Elon M.', text: 'Gutes Preis-Leistungs-Verhältnis. Nehme zwei.', rating: 5},
                {author: 'Astronaut', text: 'Etwas zugig im Bad, aber der Blick auf die Erde ist nett.', rating: 4}
            ],
            variants: [{
                name: 'Ausstattung',
                values: [
                    { name: 'Basis', description: 'Nur das Nötigste.', pros: ['Günstig'], cons: ['Kein Pool'] },
                    { name: 'Luxus', description: 'Mit Schwerelosigkeits-Pool.', pros: ['Pool in Space!'], cons: ['Unbezahlbar'] }
                ]
            }]
        },
        { 
            id: 'p_8', name: 'Gaming-Stuhl (RGB)', price: 400, category: 'EVERYDAY', imageUrl: '🪑', rating: 4.6, brand: 'SeatRGB', inventoryType: 'DECOR',
            description: 'Ergonomischer Gaming-Stuhl mit mehr Beleuchtung als manche Innenstädte. Stromkosten exklusive.',
            specs: { RGB: '16,7 Mio. Farben', Belastung: '150 kg', Komfort: 'Legendär' }, stock: 18, deliveryDays: 2,
            whyThisProduct: ['Erhöht die FPS (gefühlt)', 'Sehr bequem', 'Blendet die Nachbarn'],
            relatedProductIds: ['p_14', 'p_1'],
            reviews: [
                {author: 'GamerGirl', text: 'Leuchtet in 16 Mio Farben. Mein Zimmer sieht aus wie eine Disko.', rating: 5},
                {author: 'NoScope', text: 'Quietscht ein bisschen beim Zurücklehnen.', rating: 4}
            ],
            variants: [{
                name: 'Edition',
                values: [
                    { name: 'Schwarz/RGB', description: 'Klassisches Schwarz, bunte Lichter.', pros: ['Zeitlos'], cons: ['Staubfalle'] },
                    { name: 'Weiß/Neon', description: 'Extrem auffällig.', pros: ['Modern'], cons: ['Schmutzempfindlich'] }
                ]
            }]
        },
        { 
            id: 'p_9', name: 'Virtueller NFT Koala', price: 8000, category: 'ABSURD', imageUrl: '🖼️', rating: 1.0, brand: 'ChainLeaf', inventoryType: 'COLLECTIBLE',
            description: 'Ein lokal gespeichertes digitales Sammlerstück ohne Blockchain und ohne Spekulation. Einfach nur ein teures Bild.',
            specs: { Format: 'PNG-ish', Seltenheit: 'Behauptet', Wiederverkauf: 'Nein' }, stock: 999, deliveryDays: 1,
            whyThisProduct: ['Geld verbrennen mit Stil', 'Man kann es ausdrucken'],
            relatedProductIds: ['p_7', 'p_3'],
            reviews: [
                {author: 'CryptoBro', text: 'To the moon! (Wert ist auf 0 gefallen).', rating: 1},
                {author: 'ArtCritic', text: 'Ein meisterhafter Kommentar zur digitalen Vergänglichkeit.', rating: 5}
            ],
            variants: [{
                name: 'Motiv',
                values: [
                    { name: 'Bored Koala', description: 'Gähnt.', pros: ['Authentisch'], cons: ['Teuer'] },
                    { name: 'Laser Eyes', description: 'Mit roten Augen.', pros: ['Memewert'], cons: ['Noch teurer'] }
                ]
            }]
        },
        { 
            id: 'p_10', name: 'Koala Streetwear Hoodie', price: 180, category: 'EVERYDAY', imageUrl: '🧥', rating: 4.7, brand: 'SoftLeaf', inventoryType: 'OUTFIT',
            description: 'Schwerer Oversize-Hoodie für dein virtuelles Outfit. Gemacht aus feinster Bio-Baumwolle.',
            specs: { Material: 'Bio-Baumwolle', Schnitt: 'Oversize' }, stock: 44, deliveryDays: 2,
            whyThisProduct: ['Extrem weich', 'Lässiger Look', 'Große Kapuze zum Verstecken'],
            relatedProductIds: ['p_11', 'p_2'],
            reviews: [
                { author: 'Mira', text: 'Sehr weich und angenehm übertrieben groß. Perfekt.', rating: 5 },
                { author: 'FashionFail', text: 'Der Stoff fusselt leicht beim ersten Waschen.', rating: 4 }
            ],
            variants: [{
                name: 'Farbe',
                values: [
                    { name: 'Flieder', description: 'Dezent und frisch.', pros: ['Frühlings-Vibe'], cons: ['Fleckenempfindlich'] },
                    { name: 'Nachtschwarz', description: 'Der Ninja-Look.', pros: ['Macht schlank'], cons: ['Hundehaare haften'] }
                ]
            }]
        },
        { 
            id: 'p_11', name: 'Eucalyptus Runner', price: 220, category: 'LUXURY', imageUrl: '👟', rating: 4.6, brand: 'LeafStep', inventoryType: 'OUTFIT',
            description: 'Limitierter Sneaker für komplette Koala-Looks. Mit extra dicker Sohle für weiches Auftreten.',
            specs: { Sohle: 'Cloud Foam', Edition: '2026' }, stock: 17, deliveryDays: 3,
            whyThisProduct: ['Limitiert', 'Läuft sich wie auf Wolken', 'Passt zu allem'],
            relatedProductIds: ['p_10'],
            reviews: [
                { author: 'SprintKoala', text: 'Sieht schnell aus, das reicht mir schon.', rating: 5 },
                { author: 'Sneakerhead', text: 'Die Box kam leicht eingedellt an. Schuh ist ok.', rating: 3 }
            ],
            variants: [{
                name: 'Größe & Passform',
                values: [
                    { name: 'Standard', description: 'Normale Breite.', pros: ['Passt meistens'], cons: ['Nichts Besonderes'] },
                    { name: 'Wide (Oversize)', description: 'Für breitere Füße.', pros: ['Bequem'], cons: ['Wirkt klobig'] }
                ]
            }]
        },
        { 
            id: 'p_12', name: 'Koala GT Electric', price: 68000, category: 'LUXURY', imageUrl: '🏎️', rating: 4.9, brand: 'Koala Motors', inventoryType: 'VEHICLE',
            description: 'Elektrischer Grand Tourer für die virtuelle Traumgarage. Beschleunigt schneller als man schauen kann.',
            specs: { Leistung: '640 PS', Reichweite: '610 km', Sitze: '4' }, stock: 3, deliveryDays: 7,
            whyThisProduct: ['Keine Emissionen', 'Unfassbare Beschleunigung', 'Viel Platz'],
            relatedProductIds: ['p_13'],
            reviews: [
                { author: 'Volt', text: 'Steht hervorragend in meiner virtuellen Garage.', rating: 5 },
                { author: 'PetrolHead', text: 'Hat keinen Motorsound. Langweilig.', rating: 2 }
            ],
            variants: [{
                name: 'Lackierung',
                values: [
                    { name: 'Midnight', description: 'Tiefschwarz.', pros: ['Böse Optik'], cons: ['Wird schnell heiß'] },
                    { name: 'Eukalyptus Pearl', description: 'Schimmert grünlich.', pros: ['Einzigartig'], cons: ['Aufpreis'] }
                ]
            }]
        },
        { 
            id: 'p_13', name: 'City Leaf Scooter', price: 3400, category: 'EVERYDAY', imageUrl: '🛵', rating: 4.4, brand: 'UrbanLeaf', inventoryType: 'VEHICLE',
            description: 'Leiser Elektro-Scooter für deine Garage. Perfekt für den virtuellen Stau.',
            specs: { Reichweite: '90 km', Tempo: '80 km/h' }, stock: 9, deliveryDays: 4,
            whyThisProduct: ['Kommt überall durch', 'Leicht zu parken', 'Stylisch'],
            relatedProductIds: ['p_12', 'p_10'],
            reviews: [
                { author: 'CityKoala', text: 'Perfekt für kurze virtuelle Wege ins Café.', rating: 5 },
                { author: 'Raser', text: 'Könnte etwas schneller sein.', rating: 3 }
            ],
            variants: [{
                name: 'Ausstattung',
                values: [
                    { name: 'City', description: 'Nur das Fahrzeug.', pros: ['Günstig'], cons: ['Wenig Stauraum'] },
                    { name: 'Commuter Bundle', description: 'Mit Topcase.', pros: ['Praktisch'], cons: ['Weniger windschnittig'] }
                ]
            }]
        },
        { 
            id: 'p_14', name: 'Creator Workstation Ultra', price: 7900, category: 'LUXURY', imageUrl: '🖥️', rating: 4.8, brand: 'KoalaCompute', inventoryType: 'ELECTRONICS',
            description: 'Eine kompromisslose Workstation für dein Elektronik-Setup. Rendert alles in Rekordzeit.',
            specs: { GPU: 'Leaf RTX 6090', Speicher: '8 TB SSD', Kühlung: 'Flüsterleise' }, stock: 6, deliveryDays: 4,
            whyThisProduct: ['Unendlich Leistung', 'Zukunftssicher', 'Sieht extrem professionell aus'],
            relatedProductIds: ['p_1', 'p_8'],
            reviews: [
                { author: 'RenderKid', text: 'Rendert meine Wunschliste in 8K ohne zu schwitzen.', rating: 5 },
                { author: 'MacFan', text: 'Viel zu groß und klobig.', rating: 2 }
            ],
            variants: [{
                name: 'RAM',
                values: [
                    { name: '64 GB', description: 'Für normale Profis.', pros: ['Ausreichend'], cons: ['Vielleicht bald zu wenig'] },
                    { name: '256 GB', description: 'Für 3D Artists.', pros: ['Zukunftssicher'], cons: ['Sehr teuer'] }
                ]
            }]
        },
        { 
            id: 'p_15', name: 'Modulares Sofa Cloud', price: 2400, category: 'LUXURY', imageUrl: '🛋️', rating: 4.7, brand: 'Nest', inventoryType: 'DECOR',
            description: 'Großes modulares Sofa für gekaufte Immobilien. Man sinkt ein und kommt nie wieder hoch.',
            specs: { Module: '5', Breite: '320 cm' }, stock: 8, deliveryDays: 5,
            whyThisProduct: ['Ultra bequem', 'Erweiterbar', 'Waschbare Bezüge'],
            relatedProductIds: ['p_5', 'p_8'],
            reviews: [
                { author: 'HomeKoala', text: 'Mein Loft wirkt direkt viel teurer. Sehr weich.', rating: 5 },
                { author: 'Minimalist', text: 'Nimmt das halbe Zimmer ein.', rating: 3 }
            ],
            variants: [{
                name: 'Bezug',
                values: [
                    { name: 'Sand (Leinen)', description: 'Natürlich und atmungsaktiv.', pros: ['Schön'], cons: ['Kratzig'] },
                    { name: 'Moos (Samt)', description: 'Sehr luxuriös.', pros: ['Weich'], cons: ['Schwer zu reinigen'] }
                ]
            }]
        },
        {
            id: 'p_mystery_gold', name: 'Gold Mystery Box', price: 750, category: 'MYSTERY', imageUrl: '🎁', rating: 4.9, brand: 'KoalaShip', inventoryType: 'COLLECTIBLE',
            description: 'Eine geheimnisvolle goldene Box. Niemand weiß, was drin ist (Spoiler: irgendein anderes Produkt).',
            specs: { Spannung: 'Extrem hoch', Rückgabe: 'Nicht möglich' }, stock: 100, deliveryDays: 1,
            whyThisProduct: ['Nervenkitzel pur', 'Die Chance auf etwas Teures', 'Auspacken macht Spaß'],
            relatedProductIds: [],
            reviews: [
                { author: 'LuckyLeaf', text: 'Die Spannung war fast besser als der eigentliche Inhalt.', rating: 5 },
                { author: 'Pechvogel', text: 'Habe Standard-Toilettenpapier für 750 KC bekommen. Bin wütend.', rating: 1 }
            ],
            variants: [{
                name: 'Verpackung',
                values: [
                    { name: 'Standard Gold', description: 'Goldenes Papier.', pros: ['Glänzt'], cons: ['Reißt schnell'] },
                    { name: 'Premium Schleife', description: 'Mit roter Schleife.', pros: ['Noch spannender'], cons: ['Aufpreis'] }
                ]
            }]
        }
    ];
}
