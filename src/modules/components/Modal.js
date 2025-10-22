/**
 * Modal Component
 */
class Modal {
    constructor() {
        this.container = document.getElementById('modal-container');
        this.activeModals = [];
    }

    /**
     * Show modal
     */
    show(options = {}) {
        const modal = this.create(options);
        this.container.appendChild(modal);
        this.activeModals.push(modal);

        // Add to body for accessibility
        document.body.style.overflow = 'hidden';

        return modal;
    }

    /**
     * Create modal element
     */
    create(options) {
        const {
            title = '',
            content = '',
            size = 'medium',
            closable = true,
            actions = []
        } = options;

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;

        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                ${closable ? '<button class="modal-close">&times;</button>' : ''}
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length > 0 ? `
                <div class="modal-footer">
                    ${actions.map(action => `
                        <button class="btn ${action.class || 'btn-secondary'}"
                                data-action="${action.action}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        backdrop.appendChild(modal);

        // Event handlers
        if (closable) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.close(backdrop);
                }
            });

            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.close(backdrop);
                });
            }
        }

        // Action handlers
        actions.forEach(action => {
            const btn = modal.querySelector(`[data-action="${action.action}"]`);
            if (btn && action.handler) {
                btn.addEventListener('click', action.handler);
            }
        });

        return backdrop;
    }

    /**
     * Close modal
     */
    close(modal) {
        if (modal && modal.parentNode) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                const index = this.activeModals.indexOf(modal);
                if (index > -1) {
                    this.activeModals.splice(index, 1);
                }

                // Restore body scroll if no modals
                if (this.activeModals.length === 0) {
                    document.body.style.overflow = '';
                }
            }, 300);
        }
    }

    /**
     * Close all modals
     */
    closeAll() {
        this.activeModals.forEach(modal => this.close(modal));
    }

    /**
     * Confirm dialog
     */
    confirm(message, title = '确认') {
        return new Promise((resolve) => {
            this.show({
                title,
                content: `<p>${message}</p>`,
                actions: [
                    {
                        text: '取消',
                        class: 'btn-secondary',
                        action: 'cancel',
                        handler: () => {
                            resolve(false);
                            this.close(this.activeModals[this.activeModals.length - 1]);
                        }
                    },
                    {
                        text: '确认',
                        class: 'btn-primary',
                        action: 'confirm',
                        handler: () => {
                            resolve(true);
                            this.close(this.activeModals[this.activeModals.length - 1]);
                        }
                    }
                ]
            });
        });
    }

    /**
     * Alert dialog
     */
    alert(message, title = '提示') {
        return new Promise((resolve) => {
            this.show({
                title,
                content: `<p>${message}</p>`,
                actions: [
                    {
                        text: '确定',
                        class: 'btn-primary',
                        action: 'ok',
                        handler: () => {
                            resolve(true);
                            this.close(this.activeModals[this.activeModals.length - 1]);
                        }
                    }
                ]
            });
        });
    }
}