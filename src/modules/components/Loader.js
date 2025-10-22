/**
 * Loader Component
 */
class Loader {
    constructor() {
        this.overlay = document.getElementById('loading-overlay');
        this.isVisible = false;
    }

    /**
     * Show loader
     */
    show(message = '加载中...') {
        if (this.isVisible) return;

        this.overlay.innerHTML = `
            <div class="loader-content">
                <div class="loader"></div>
                <p class="loader-message">${message}</p>
            </div>
        `;

        this.overlay.style.display = 'flex';
        this.isVisible = true;
    }

    /**
     * Hide loader
     */
    hide() {
        if (!this.isVisible) return;

        this.overlay.style.display = 'none';
        this.isVisible = false;
    }

    /**
     * Show for async operation
     */
    async wrap(promise, message = '处理中...') {
        this.show(message);
        try {
            const result = await promise;
            return result;
        } finally {
            this.hide();
        }
    }
}