class ErrorNotification {
    constructor() {
        this.currentNotification = null;
    }

    show(message, period, onRetry) {
        this.hide();
        
        const notification = document.createElement('div');
        notification.className = 'error-notification backdrop-blur-20';
        notification.innerHTML = `
            <div class="error-content">
                <h4>⚠️ Unable to Load Historical Data</h4>
                <p>${message}</p>
                <div class="error-actions">
                    <button id="retry-btn" class="retry-button">Retry</button>
                    <button id="dismiss-btn" class="dismiss-button">Dismiss</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        this.currentNotification = notification;
        
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.hide();
            if (onRetry) {
                onRetry(period);
            }
        });
        
        document.getElementById('dismiss-btn').addEventListener('click', () => {
            this.hide();
        });
        
        setTimeout(() => {
            this.hide();
        }, 10000);
    }

    hide() {
        if (this.currentNotification) {
            this.currentNotification.remove();
            this.currentNotification = null;
        }
    }

    isVisible() {
        return this.currentNotification !== null;
    }
}