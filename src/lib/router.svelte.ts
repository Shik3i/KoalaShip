export type Route = 'ONBOARDING' | 'DASHBOARD' | 'SHOP' | 'HISTORY' | 'MAP';

export const routerState = $state({
    currentRoute: 'DASHBOARD' as Route
});

export function navigateTo(route: Route) {
    routerState.currentRoute = route;
    if (typeof window !== 'undefined') {
        window.location.hash = route;
    }
}

export function initRouter() {
    if (typeof window === 'undefined') return;
    
    function handleHashChange() {
        const hash = window.location.hash.replace('#', '');
        const validRoutes = ['ONBOARDING', 'DASHBOARD', 'SHOP', 'HISTORY', 'MAP'];
        if (validRoutes.includes(hash)) {
            routerState.currentRoute = hash as Route;
        } else {
            routerState.currentRoute = 'DASHBOARD';
        }
    }
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial
}
