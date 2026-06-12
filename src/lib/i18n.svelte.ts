export type Locale = 'DE' | 'EN' | 'ES';

export const i18nState = $state({
    locale: 'DE' as Locale
});

export function setLocale(loc: Locale) {
    i18nState.locale = loc;
    if (typeof window !== 'undefined') {
        localStorage.setItem('koala_locale', loc);
    }
}

export function initI18n() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('koala_locale') as Locale;
    if (['DE', 'EN', 'ES'].includes(saved)) {
        i18nState.locale = saved;
    }
}

const dictionaries: Record<Locale, Record<string, string>> = {
    DE: {
        'nav.dashboard': 'Übersicht',
        'nav.shop': 'Marktplatz',
        'nav.history': 'Bestellungen',
        'nav.map': 'Live Radar',
        'nav.inventory': 'Inventar',
        'shop.title': 'Premium Marktplatz',
        'shop.buy': 'Kaufen',
        'shop.outofstock': 'Zu Teuer',
        'shop.express': 'Express (+50 KC)',
        'shop.standard': 'Standard (Gratis)',
        'shop.reviews': 'Kundenrezensionen',
        'shop.authorizing': 'Zahlung wird autorisiert...',
        'shop.ordered': 'Bestellt!',
        'onboarding.title': 'Kontoeröffnung',
        'onboarding.start': 'Konto erstellen',
        'onboarding.randomize': 'Alles zufällig ausfüllen',
        'onboarding.language': 'Sprache auswählen',
        'onboarding.imprint': 'Impressum',
        'onboarding.privacy': 'Datenschutz',
        'onboarding.subtitle': 'Erstelle dein Profil und erhalte 5.000 KC Startbonus.',
        'onboarding.name': 'Vorname / Alias', 'onboarding.name_placeholder': 'z. B. Max Mustermann',
        'onboarding.optional': 'optional', 'onboarding.pronouns': 'Pronomen', 'onboarding.pronouns_placeholder': 'z. B. sie/ihr',
        'onboarding.avatar': 'Avatarfarbe', 'onboarding.bio': 'Kurz über dich',
        'onboarding.bio_placeholder': 'Was sollte die KoalaShip-Community über dich wissen?',
        'onboarding.job': 'Berufsprofil (Einkommen)', 'onboarding.job_description': 'Eigene Jobbeschreibung',
        'onboarding.job_placeholder': 'Was machst du den ganzen Tag wirklich?',
        'onboarding.favorite': 'Lieblingskategorie', 'onboarding.everyday': 'Alltag', 'onboarding.luxury': 'Luxus',
        'onboarding.absurd': 'Absurd', 'onboarding.mystery': 'Mystery', 'onboarding.delivery_note': 'Lieferhinweis',
        'onboarding.delivery_placeholder': 'z. B. beim Nachbarn abgeben',
        'onboarding.map': 'Lieferpunkt markieren (Klick auf Karte)',
        'onboarding.map_privacy': 'Du musst nicht deine echte Adresse auswählen. Ein beliebiger Kartenpunkt reicht für die Simulation. Die gewählten Start- und Zielkoordinaten werden bei der Routenberechnung über unseren Proxy an OSRM übertragen.',
        'onboarding.map_required': 'Bitte einen Lieferpunkt auf der Karte markieren.',
        'onboarding.week': 'Woche', 'onboarding.month': 'Monat',
        'job.j_1': 'Minijobber (Kisten stapeln)',
        'job.j_2': 'Junior Frontend Dev',
        'job.j_3': 'Senior Backend Architekt',
        'job.j_4': 'CEO (KoalaShip)',
        'job.j_5': 'Eukalyptus-Influencer',
        'dashboard.balance': 'Guthaben',
        'dashboard.next_salary': 'Nächstes Gehalt',
        'common.close': 'Schließen',
    },
    EN: {
        'nav.dashboard': 'Dashboard',
        'nav.shop': 'Marketplace',
        'nav.history': 'Orders',
        'nav.map': 'Live Radar',
        'nav.inventory': 'Inventory',
        'shop.title': 'Premium Marketplace',
        'shop.buy': 'Buy Now',
        'shop.outofstock': 'Too Expensive',
        'shop.express': 'Express (+50 KC)',
        'shop.standard': 'Standard (Free)',
        'shop.reviews': 'Customer Reviews',
        'shop.authorizing': 'Authorizing Payment...',
        'shop.ordered': 'Ordered!',
        'onboarding.title': 'Account Setup',
        'onboarding.start': 'Create Account',
        'onboarding.randomize': 'Randomize everything',
        'onboarding.language': 'Choose language',
        'onboarding.imprint': 'Legal notice',
        'onboarding.privacy': 'Privacy',
        'onboarding.subtitle': 'Create your profile and receive a 5,000 KC welcome bonus.',
        'onboarding.name': 'First name / alias', 'onboarding.name_placeholder': 'e.g. Alex Example',
        'onboarding.optional': 'optional', 'onboarding.pronouns': 'Pronouns', 'onboarding.pronouns_placeholder': 'e.g. they/them',
        'onboarding.avatar': 'Avatar color', 'onboarding.bio': 'About you',
        'onboarding.bio_placeholder': 'What should the KoalaShip community know about you?',
        'onboarding.job': 'Career profile (income)', 'onboarding.job_description': 'Your job description',
        'onboarding.job_placeholder': 'What do you actually do all day?',
        'onboarding.favorite': 'Favorite category', 'onboarding.everyday': 'Everyday', 'onboarding.luxury': 'Luxury',
        'onboarding.absurd': 'Absurd', 'onboarding.mystery': 'Mystery', 'onboarding.delivery_note': 'Delivery note',
        'onboarding.delivery_placeholder': 'e.g. leave with a neighbor',
        'onboarding.map': 'Choose a delivery point (click the map)',
        'onboarding.map_privacy': 'You do not need to select your real address. Any map point works for the simulation. The selected start and destination coordinates are transmitted to OSRM through our proxy when calculating a route.',
        'onboarding.map_required': 'Please select a delivery point on the map.',
        'onboarding.week': 'week', 'onboarding.month': 'month',
        'job.j_1': 'Part-time warehouse worker',
        'job.j_2': 'Junior Frontend Developer',
        'job.j_3': 'Senior Backend Architect',
        'job.j_4': 'CEO (KoalaShip)',
        'job.j_5': 'Eucalyptus Influencer',
        'dashboard.balance': 'Balance',
        'dashboard.next_salary': 'Next Salary',
        'common.close': 'Close',
    },
    ES: {
        'nav.dashboard': 'Resumen',
        'nav.shop': 'Mercado',
        'nav.history': 'Pedidos',
        'nav.map': 'Radar en vivo',
        'nav.inventory': 'Inventario',
        'shop.title': 'Mercado Premium',
        'shop.buy': 'Comprar',
        'shop.outofstock': 'Muy Caro',
        'shop.express': 'Exprés (+50 KC)',
        'shop.standard': 'Estándar (Gratis)',
        'shop.reviews': 'Reseñas de clientes',
        'shop.authorizing': 'Autorizando pago...',
        'shop.ordered': '¡Pedido!',
        'onboarding.title': 'Crear Cuenta',
        'onboarding.start': 'Crear Cuenta',
        'onboarding.randomize': 'Rellenar todo al azar',
        'onboarding.language': 'Elegir idioma',
        'onboarding.imprint': 'Aviso legal',
        'onboarding.privacy': 'Privacidad',
        'onboarding.subtitle': 'Crea tu perfil y recibe un bono inicial de 5.000 KC.',
        'onboarding.name': 'Nombre / alias', 'onboarding.name_placeholder': 'p. ej. Alex Ejemplo',
        'onboarding.optional': 'opcional', 'onboarding.pronouns': 'Pronombres', 'onboarding.pronouns_placeholder': 'p. ej. ella',
        'onboarding.avatar': 'Color del avatar', 'onboarding.bio': 'Sobre ti',
        'onboarding.bio_placeholder': '¿Qué debería saber de ti la comunidad de KoalaShip?',
        'onboarding.job': 'Perfil profesional (ingresos)', 'onboarding.job_description': 'Descripción de tu trabajo',
        'onboarding.job_placeholder': '¿Qué haces realmente durante todo el día?',
        'onboarding.favorite': 'Categoría favorita', 'onboarding.everyday': 'Diario', 'onboarding.luxury': 'Lujo',
        'onboarding.absurd': 'Absurdo', 'onboarding.mystery': 'Misterio', 'onboarding.delivery_note': 'Nota de entrega',
        'onboarding.delivery_placeholder': 'p. ej. dejar con un vecino',
        'onboarding.map': 'Elige un punto de entrega (haz clic en el mapa)',
        'onboarding.map_privacy': 'No tienes que seleccionar tu dirección real. Cualquier punto del mapa sirve para la simulación. Las coordenadas elegidas se transmiten a OSRM mediante nuestro proxy al calcular una ruta.',
        'onboarding.map_required': 'Selecciona un punto de entrega en el mapa.',
        'onboarding.week': 'semana', 'onboarding.month': 'mes',
        'job.j_1': 'Empleado de almacén a tiempo parcial',
        'job.j_2': 'Desarrollador Frontend Junior',
        'job.j_3': 'Arquitecto Backend Senior',
        'job.j_4': 'CEO (KoalaShip)',
        'job.j_5': 'Influencer de eucalipto',
        'dashboard.balance': 'Saldo',
        'dashboard.next_salary': 'Próximo Salario',
        'common.close': 'Cerrar',
    }
};

export function t(key: string): string {
    return dictionaries[i18nState.locale][key] || key;
}
