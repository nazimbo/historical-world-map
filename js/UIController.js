class UIController {
    constructor(periods) {
        this.periods = periods;
        this.currentPeriodIndex = 8;
        this.debounceTimeout = null;
        this.onPeriodChange = null;
        this.cacheMonitor = null;
    }

    initSlider(onInputCallback) {
        const slider = document.getElementById('time-slider');
        const currentPeriodDisplay = document.getElementById('current-period');

        slider.max = this.periods.length - 1;
        slider.value = this.currentPeriodIndex;
        currentPeriodDisplay.textContent = this.periods[this.currentPeriodIndex].label;

        slider.setAttribute('aria-label', 'Historical time period selector');
        slider.setAttribute('aria-valuetext', this.periods[this.currentPeriodIndex].label);

        slider.addEventListener('input', (e) => {
            const periodIndex = parseInt(e.target.value);
            this.currentPeriodIndex = periodIndex;
            const periodLabel = this.periods[periodIndex].label;
            
            currentPeriodDisplay.textContent = periodLabel;
            slider.setAttribute('aria-valuetext', periodLabel);
            
            if (onInputCallback) {
                onInputCallback(periodIndex);
            }
        });
    }

    initInfoPanel(onCloseCallback) {
        const closeButton = document.getElementById('close-info');
        const infoPanel = document.getElementById('info-panel');
        
        closeButton.setAttribute('aria-label', 'Close territory information panel');
        infoPanel.setAttribute('role', 'dialog');
        infoPanel.setAttribute('aria-live', 'polite');
        
        closeButton.addEventListener('click', () => {
            if (onCloseCallback) {
                onCloseCallback();
            }
        });
    }

    initKeyboardControls(navigationCallback, closeCallback) {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'Escape':
                    if (!document.getElementById('info-panel').classList.contains('hidden')) {
                        if (closeCallback) closeCallback();
                        e.preventDefault();
                    }
                    break;
                case 'ArrowLeft':
                    if (this.currentPeriodIndex > 0) {
                        if (navigationCallback) navigationCallback(this.currentPeriodIndex - 1);
                        e.preventDefault();
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentPeriodIndex < this.periods.length - 1) {
                        if (navigationCallback) navigationCallback(this.currentPeriodIndex + 1);
                        e.preventDefault();
                    }
                    break;
            }
        });
    }

    initCacheMonitor() {
        const monitor = document.createElement('div');
        monitor.id = 'cache-monitor';
        monitor.className = 'cache-monitor backdrop-blur-10';
        monitor.style.cssText = `
            position: absolute;
            top: 80px;
            left: 20px;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.7rem;
            z-index: 999;
            display: none;
        `;
        monitor.innerHTML = `
            <div>Cache: <span id="cache-size">0</span>/15</div>
            <div>Hit rate: <span id="cache-hit-rate">0</span>%</div>
        `;
        document.body.appendChild(monitor);
        
        if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
            monitor.style.display = 'block';
        }
        
        this.cacheMonitor = monitor;
    }

    updateCacheMonitor(cacheStats) {
        const sizeEl = document.getElementById('cache-size');
        const hitRateEl = document.getElementById('cache-hit-rate');
        
        if (sizeEl) sizeEl.textContent = cacheStats.cacheSize;
        if (hitRateEl) hitRateEl.textContent = cacheStats.hitRate.replace('%', '');
    }

    navigateToPeriod(periodIndex) {
        this.currentPeriodIndex = periodIndex;
        document.getElementById('time-slider').value = periodIndex;
        document.getElementById('current-period').textContent = this.periods[periodIndex].label;
    }

    showTerritoryInfo(feature, currentPeriod) {
        const properties = feature.properties;
        const nameField = properties.NAME || properties.name || properties.NAME_EN || 'Unknown Territory';
        
        document.getElementById('territory-name').textContent = nameField;
        
        let detailsHTML = `<strong>Territory:</strong> ${nameField}<br>`;
        
        Object.keys(properties).forEach(key => {
            if (key !== 'NAME' && key !== 'name' && properties[key] !== null && properties[key] !== '') {
                const value = properties[key];
                const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                detailsHTML += `<strong>${displayKey}:</strong> ${value}<br>`;
            }
        });
        
        detailsHTML += `<strong>Period:</strong> ${currentPeriod.label}<br>`;
        
        document.getElementById('territory-details').innerHTML = detailsHTML;
        
        this.showInfoPanel();
    }

    showInfoPanel() {
        const panel = document.getElementById('info-panel');
        panel.classList.remove('hidden');
        
        const closeButton = document.getElementById('close-info');
        setTimeout(() => closeButton.focus(), 100);
    }

    hideInfoPanel() {
        document.getElementById('info-panel').classList.add('hidden');
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    getCurrentPeriodIndex() {
        return this.currentPeriodIndex;
    }

    setCurrentPeriodIndex(index) {
        this.currentPeriodIndex = index;
    }

    debounce(func, wait) {
        return (...args) => {
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }
            this.debounceTimeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    destroy() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        if (this.cacheMonitor) {
            this.cacheMonitor.remove();
        }
    }
}