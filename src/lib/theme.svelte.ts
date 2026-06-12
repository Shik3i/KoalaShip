export type Theme = 'light' | 'dark';

export const themeState = $state({
    current: 'light' as Theme
});

export function initTheme() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('koala_theme') as Theme;
    if (saved === 'light' || saved === 'dark') {
        themeState.current = saved;
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeState.current = prefersDark ? 'dark' : 'light';
    }
    applyTheme();
}

export function toggleTheme() {
    themeState.current = themeState.current === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
        localStorage.setItem('koala_theme', themeState.current);
        applyTheme();
    }
}

function applyTheme() {
    if (typeof document === 'undefined') return;
    if (themeState.current === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
