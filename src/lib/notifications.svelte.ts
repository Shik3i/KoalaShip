export type NotificationKind = 'success' | 'info' | 'warning';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    kind: NotificationKind;
}

export const notifications = $state<AppNotification[]>([]);

export function notify(title: string, message: string, kind: NotificationKind = 'info') {
    if (typeof window === 'undefined') return;
    const item = { id: crypto.randomUUID(), title, message, kind };
    notifications.push(item);
    window.setTimeout(() => dismissNotification(item.id), 4500);
}

export function dismissNotification(id: string) {
    const index = notifications.findIndex(item => item.id === id);
    if (index >= 0) notifications.splice(index, 1);
}
