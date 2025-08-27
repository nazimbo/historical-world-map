class ErrorNotification {
    constructor() {
        this.currentNotification = null;
        this.errorHandler = new ErrorHandler();
        this.displayTime = Utils.getNestedProperty(window.CONFIG, 'ui.errorDisplayTime', CONSTANTS.UI.ERROR_DISPLAY_TIME);
    }

    show(error, period, onRetry) {
        this.hide();
        
        // Process error through error handler
        const processedError = this.errorHandler.handleError(
            error, 
            this.errorHandler.createPeriodContext(period)
        );
        
        const notification = document.createElement('div');
        const notificationId = Utils.createSafeId(`error-notification-${Date.now()}`);
        notification.id = notificationId;
        notification.className = `${CONSTANTS.CLASSES.ERROR_NOTIFICATION} ${CONSTANTS.CLASSES.BACKDROP_BLUR_20}`;
        
        const canRetry = processedError.canRetry;
        const retryButtonHtml = canRetry ? 
            `<button id="retry-btn-${notificationId}" class="retry-button">Retry</button>` : '';
        
        notification.innerHTML = `
            <div class="error-content">
                <h4>⚠️ Unable to Load Historical Data</h4>
                <p>${Validators.sanitizeInput(processedError.userMessage)}</p>
                <div class="error-actions">
                    ${retryButtonHtml}
                    <button id="dismiss-btn-${notificationId}" class="dismiss-button">Dismiss</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        this.currentNotification = notification;
        
        const retryBtn = document.getElementById(`retry-btn-${notificationId}`);
        const dismissBtn = document.getElementById(`dismiss-btn-${notificationId}`);
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} User requested retry for ${period?.label || 'unknown period'}`);
                this.hide();
                if (onRetry) {
                    onRetry(period);
                }
            });
        }
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} User dismissed error notification`);
                this.hide();
            });
        }
        
        // Auto-hide after configured time
        setTimeout(() => {
            this.hide();
        }, this.displayTime);
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