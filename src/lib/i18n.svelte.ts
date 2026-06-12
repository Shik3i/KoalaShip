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
        'dashboard.balance': 'Guthaben',
        'dashboard.next_salary': 'Nächstes Gehalt',
        'common.close': 'Schließen',
    },
    EN: {
        'nav.dashboard': 'Dashboard',
        'nav.shop': 'Marketplace',
        'nav.history': 'Orders',
        'nav.map': 'Live Radar',
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
        'dashboard.balance': 'Balance',
        'dashboard.next_salary': 'Next Salary',
        'common.close': 'Close',
    },
    ES: {
        'nav.dashboard': 'Resumen',
        'nav.shop': 'Mercado',
        'nav.history': 'Pedidos',
        'nav.map': 'Radar en vivo',
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
        'dashboard.balance': 'Saldo',
        'dashboard.next_salary': 'Próximo Salario',
        'common.close': 'Cerrar',
    }
};

export function t(key: string): string {
    return dictionaries[i18nState.locale][key] || key;
}
