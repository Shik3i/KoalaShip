import { createPRNG } from './random';

// Backward compatibility or for single-use seeds
export function getDeterministicRandom(seed: number | string): number {
    return createPRNG(seed)();
}

export function pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export function pickDeterministic<T>(array: T[], seed: string | number): T {
    return array[Math.floor(createPRNG(seed)() * array.length)];
}

export function fillTemplate(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`));
}

// -----------------------------------------------------------------------------
// REVIEWS
// -----------------------------------------------------------------------------
export const reviewNames = [
    'Günther K.', 'ShoppingQueen99', 'xX_ProGamer_Xx', 'Anonymer Käufer', 'Bastian M.', 
    'Lisa_M.', 'Ein zufriedener Kunde', 'Der Kritiker', 'Eukalyptus-Fan', 'TestAccount_01'
];
export const reviewTitles = [
    'Einfach WOW!', 'Naja, geht so.', 'Viel zu teuer.', 'Jeden Cent wert!', 
    'Meine Katze liebt es.', 'Besser als erwartet', 'Komplett sinnlos, aber geil.', 
    'Hat mein Leben verändert', 'Schlechte Verpackung', 'Perfekt für den Alltag'
];
export const reviewTexts = [
    'Ich habe mein gesamtes fiktives Erspartes dafür ausgegeben und bereue nichts.',
    'Das Paket kam leicht verbeult an, aber der Inhalt ist intakt. Irgendwer hat das Klebeband nicht im Griff.',
    'Ehrlich gesagt weiß ich nicht, warum ich das gekauft habe.',
    'Fühlt sich extrem hochwertig an! Würde ich sofort wieder bestellen.',
    'Der Kurier hat es einfach über den Zaun geworfen. Produkt ist trotzdem super.',
    'Fünf Sterne, weil es auf meinem digitalen Schreibtisch toll aussieht.',
    'Die Lieferzeit war in Ordnung. Produkt hält was es verspricht.',
    'Ich dachte es wäre größer. Ist aber auch okay.',
    'Meine Frau denkt, ich bin verrückt, dass ich dafür so viel Geld ausgeben habe.',
    'Ein Meisterwerk der modernen E-Commerce-Kultur.'
];

// -----------------------------------------------------------------------------
// TEASERS
// -----------------------------------------------------------------------------
export const productTeasers = [
    'Ein Muss für Leute mit zu viel fiktivem Geld.',
    'Das Must-Have dieser Saison.',
    'Niemand braucht es, jeder will es.',
    'Weil du es dir wert bist.',
    'Der absolute Bestseller (behaupten wir).',
    'Exklusiv und völlig überflüssig.',
    'Reduziert! (Nicht wirklich, aber klingt gut).',
    'Mach deine Freunde neidisch.'
];

// -----------------------------------------------------------------------------
// NEWSTICKER
// -----------------------------------------------------------------------------
export const newstickerMessages = [
    'EILMELDUNG: KoalaShip-Aktie explodiert, nachdem Praktikant aus Versehen alles um 50% teurer gemacht hat.',
    'WIRTSCHAFT: Analysten warnen vor Inflation des virtuellen Koala-Coins.',
    'LOGISTIK: NightKoala Delivery fordert mehr nächtliche Straßenbeleuchtung.',
    'GESELLSCHAFT: Immer mehr Menschen kaufen Dinge, die sie nicht brauchen.',
    'INTERN: Mitarbeiter Günther zum "Mitarbeiter des Monats" gewählt, weil er den Klebebandabroller repariert hat.',
    'LOKALES: ParcelPaws-Kurier von echtem Hund gejagt. Paket wurde erfolgreich über die Hecke geworfen.',
    'TRENDS: Mystery-Boxen beliebter als je zuvor - Was ist wohl drin?'
];

// -----------------------------------------------------------------------------
// CART & CHECKOUT
// -----------------------------------------------------------------------------
export const cartComments = [
    'Dein Warenkorb sieht heute besonders exklusiv aus.',
    'Eine exzellente Wahl!',
    'Gönn dir was, es ist ja nur Spielgeld.',
    'Die Wirtschaft muss wachsen. Danke für deinen Beitrag!',
    'Wir haben die Kartons schon mal gefaltet.'
];
export const checkoutConfirmations = [
    'Zahlung autorisiert. Geld ist weg. Danke!',
    'Bestellung erfolgreich in die unendlichen Weiten der Logistik entlassen.',
    'Dein Auftrag wurde soeben ausgedruckt und an den Kurier gefaxt.',
    'Bestellung bestätigt. Hoffen wir, dass der Kurier den Weg findet.'
];

// -----------------------------------------------------------------------------
// TRACKING
// -----------------------------------------------------------------------------
export const trackingMilestones = {
    received: [
        'Auftragsdaten elektronisch an KoalaShip übermittelt.',
        'Sendung wurde elektronisch angekündigt.',
        'Bestellbestätigung gedruckt und gefaltet.'
    ],
    preparation: [
        'Sendung in der Vorbereitung beim Absender.',
        'Paket ist abholbereit für den Transport.',
        'Mitarbeiter sucht das passende Klebeband.'
    ],
    pickup: [
        'Sendung wurde vom Transporteur entgegengenommen.',
        'Paket in den LKW geworfen (vorsichtig).'
    ],
    startHub: [
        'Label wurde erneut gescannt.',
        'Sendung hat das Start-Versandzentrum verlassen.'
    ],
    transit: [
        'Paket befindet sich im Transit auf dem Hauptlauf.',
        'Der LKW ist auf der Autobahn (und steht vermutlich im Stau).'
    ],
    intermediateHub: [
        'Zwischenstopp im Verteilnetzwerk passiert.',
        'Route für den Weitertransport bestätigt.'
    ]
};

export const refreshTexts = [
    'Prüfe Satelliten-Uplink...',
    'Wecke den Server-Koala...',
    'Frage den Kurier nach dem Weg...',
    'Aktualisiere GPS-Koordinaten...',
    'Synchronisiere mit der Matrix...'
];

// -----------------------------------------------------------------------------
// INBOX MESSAGES
// -----------------------------------------------------------------------------
export const inboxTemplates = {
    ORDER_CONFIRMATION: [
        `Hallo {{userName}},\n\nwir haben deine Bestellung (Order-ID: {{orderId}}) dankend erhalten. Unser Mitarbeiter Günther hat dein Paket bereits gefunden und bereitet es für {{carrierName}} vor.\n\nViele Grüße,\nDein KoalaShip Team`,
        `Hallo {{userName}},\n\ngroßartige Neuigkeiten: Deine Zahlung ging durch! Das Paket (Order-ID: {{orderId}}) wird nun für {{carrierName}} verpackt.\n\nViele Grüße,\nDein KoalaShip Team`
    ],
    SHIPPING_ANNOUNCEMENT: [
        `Das Klebeband hat verloren! Deine Bestellung (Order-ID: {{orderId}}) wurde sicher verpackt und an {{carrierName}} übergeben.\n\nVerfolge es live auf der Karte!`,
        `Dein Paket ist auf dem Weg! {{carrierName}} hat es entgegengenommen (Order-ID: {{orderId}}). Hoffen wir, dass es heil ankommt.`
    ],
    SORTING_CENTER: [
        `Dein Paket hat unser lokales Verteilzentrum erreicht. Es wurde erfolgreich gescannt, gewogen und auf ein kleineres Förderband geschoben.\n\nDer Endspurt beginnt!`,
        `Wir haben dein Paket im Sortierzentrum gesichtet. Es sieht noch ganz gut aus. Es wird in Kürze in das Zustellfahrzeug geladen.`
    ],
    DELIVERY_TODAY: [
        `Gute Nachrichten: Unser Fahrer ist in deiner Region unterwegs! \nBitte bereite dich auf die Annahme vor. Stelle sicher, dass du Hosen trägst (optional, aber empfohlen).\n\nWir sehen uns gleich!`,
        `Dein Paket befindet sich in der Zustellung! Unser Kurier hat noch ca. {{stops}} Stopps vor dir.`
    ],
    DELIVERED: [
        `Es ist vollbracht! Deine Bestellung wurde erfolgreich übergeben. \n\nWir hoffen, das Unboxing wird spektakulär. Gehe in dein Inventar, um das Paket zu öffnen!`,
        `Das Paket wurde zugestellt. Du kannst es nun aufreißen und begutachten.`
    ],
    INVOICE: [
        `Hier ist deine (fiktive) Rechnung über {{totalPrice}} KC.\n\nDa alles über dein unendliches Spielgeld läuft, haben wir den Betrag bereits abgebucht. Keine Mahnungen, keine Zinsen.\nDanke für den Einkauf!`,
        `Rechnung {{invoiceNumber}}.\nBetrag: {{totalPrice}} KC.\nStatus: Bezahlt.\n\nVielen Dank für deinen Beitrag zur KoalaShip-Wirtschaft.`
    ],
    REVIEW: [
        `Du hast dein Paket geöffnet! \nIst das Produkt so gut wie beschrieben? Hast du es schon fallen gelassen?\n\nViel Spaß damit!`,
        `Bitte bewerte deinen Kauf! (Nicht wirklich, wir speichern eh nichts, aber wir fragen trotzdem höflich).`
    ]
};

// -----------------------------------------------------------------------------
// UNBOXING STEPS
// -----------------------------------------------------------------------------
export const unboxingSteps = {
    MYSTERY: [
        ['Warnhinweise ignorieren', 'Schweres Schloss knacken', 'Deckel anheben'],
        ['Kiste misstrauisch betrachten', 'Mit einem Stock anstupsen', 'Augen zu und aufmachen']
    ],
    VEHICLE: [
        ['Speditions-Palette sichten', 'Schwerlastgurte durchschneiden', 'Schutzfolie abreißen'],
        ['Garagentor öffnen', 'Lieferpapiere blind unterschreiben', 'Plane abziehen']
    ],
    OUTFIT: [
        ['Luftpolsterumschlag angrabbeln', 'Aufreißen (Vorsicht!)', 'Papier-Füllmaterial wühlen'],
        ['Schicken Karton öffnen', 'Seidenpapier entfalten', 'Stoff fühlen']
    ],
    ELECTRONICS: [
        ['Premium-Karton bewundern', 'Siegel mit dem Messer durchtrennen', 'Styropor knirschen lassen'],
        ['Karton vorsichtig aufschieben', 'Neugeräte-Duft einatmen', 'Schutzfolie abziehen']
    ],
    DEFAULT: [
        ['Versandlabel prüfen', 'Klebeband lösen', 'Schutzmaterial entfernen'],
        ['Karton schütteln', 'Mit Schere aufstechen', 'Inhalt herausziehen']
    ]
};

// -----------------------------------------------------------------------------
// WISHLIST & INVENTORY
// -----------------------------------------------------------------------------
export const wishlistComments = [
    'Für später (also nie) gemerkt.',
    'Sicher ist sicher, falls du im Lotto gewinnst.',
    'Gute Wahl. Passt auf die Träumer-Liste.',
    'Aufgeschoben ist nicht aufgehoben.'
];

export const inventoryComments = [
    'Hier lagert dein ganzer Stolz (und Staub).',
    'Ein beeindruckendes Portfolio an Konsumgütern.',
    'Ein Blick in deine kapitalistische Seele.',
    'Hier bewahrst du Dinge auf, die du nur in der Theorie brauchst.'
];
