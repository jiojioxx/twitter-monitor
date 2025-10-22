/**
 * Notification Manager
 */
class NotificationManager {
    constructor() {
        this.permission = 'default';
    }

    async init() {
        await this.requestPermission();
    }

    async requestPermission() {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
        }
    }

    show(options) {
        const { title, body, icon = '🔔', tag } = options;

        if (this.permission === 'granted') {
            new Notification(title, {
                body,
                icon,
                tag
            });
        }

        // Also show toast
        window.toastManager?.info(`${title}: ${body}`);
    }
}