/**
 * Toast Notification Component
 */
class Toast {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = [];
        this.maxToasts = AppConfig.ui.maxToasts || 3;
    }

    /**
     * Show success toast
     */
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error toast
     */
    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning toast
     */
    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info toast
     */
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    /**
     * Show toast
     */
    show(message, type = 'info', duration = 3000) {
        // Remove oldest toast if at max limit
        if (this.toasts.length >= this.maxToasts) {
            this.remove(this.toasts[0]);
        }

        const toast = this.create(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * Create toast element
     */
    create(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon(type)}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        // Add close handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(toast);
        });

        return toast;
    }

    /**
     * Remove toast
     */
    remove(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                const index = this.toasts.indexOf(toast);
                if (index > -1) {
                    this.toasts.splice(index, 1);
                }
            }, 300);
        }
    }

    /**
     * Get icon for toast type
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Clear all toasts
     */
    clearAll() {
        this.toasts.forEach(toast => this.remove(toast));
    }
}