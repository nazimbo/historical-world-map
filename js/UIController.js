class UIController {
    constructor(periods) {
        this.periods = periods;
        this.currentPeriodIndex = 8; // Default to 1000 BC
        this.debounceTimeout = null;
        this.onPeriodChange = null;
        this.cacheMonitor = null;
        this.focusDelay = Utils.getNestedProperty(window.CONFIG, 'ui.focusDelay', CONSTANTS.UI.FOCUS_DELAY);
    }

    initSlider(onInputCallback) {
        const slider = document.querySelector(CONSTANTS.SELECTORS.TIME_SLIDER);
        const currentPeriodDisplay = document.querySelector(CONSTANTS.SELECTORS.CURRENT_PERIOD);
        
        if (!slider || !currentPeriodDisplay) {
            console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Required slider elements not found`);
            return;
        }

        slider.max = this.periods.length - 1;
        slider.value = this.currentPeriodIndex;
        currentPeriodDisplay.textContent = this.periods[this.currentPeriodIndex].label;

        slider.setAttribute(CONSTANTS.ACCESSIBILITY.ARIA.LABEL, 'Historical time period selector');
        slider.setAttribute(CONSTANTS.ACCESSIBILITY.ARIA.VALUE_TEXT, this.periods[this.currentPeriodIndex].label);

        slider.addEventListener('input', (e) => {
            const periodIndex = parseInt(e.target.value);
            this.currentPeriodIndex = periodIndex;
            const periodLabel = this.periods[periodIndex].label;
            
            currentPeriodDisplay.textContent = periodLabel;
            slider.setAttribute(CONSTANTS.ACCESSIBILITY.ARIA.VALUE_TEXT, periodLabel);
            
            if (onInputCallback) {
                onInputCallback(periodIndex);
            }
        });
    }

    initInfoPanel(onCloseCallback) {
        const closeButton = document.querySelector(CONSTANTS.SELECTORS.CLOSE_INFO);
        const infoPanel = document.querySelector(CONSTANTS.SELECTORS.INFO_PANEL);
        
        if (!closeButton || !infoPanel) {
            console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Info panel elements not found`);
            return;
        }
        
        closeButton.setAttribute(CONSTANTS.ACCESSIBILITY.ARIA.LABEL, 'Close territory information panel');
        infoPanel.setAttribute('role', CONSTANTS.ACCESSIBILITY.ROLES.DIALOG);
        infoPanel.setAttribute(CONSTANTS.ACCESSIBILITY.ARIA.LIVE, CONSTANTS.ACCESSIBILITY.LIVE_REGIONS.POLITE);
        
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
                case CONSTANTS.KEYS.ESCAPE:
                    const infoPanel = document.querySelector(CONSTANTS.SELECTORS.INFO_PANEL);
                    if (infoPanel && !infoPanel.classList.contains(CONSTANTS.CLASSES.HIDDEN)) {
                        if (closeCallback) closeCallback();
                        e.preventDefault();
                    }
                    break;
                case CONSTANTS.KEYS.ARROW_LEFT:
                    if (this.currentPeriodIndex > 0) {
                        if (navigationCallback) navigationCallback(this.currentPeriodIndex - 1);
                        e.preventDefault();
                    }
                    break;
                case CONSTANTS.KEYS.ARROW_RIGHT:
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
        monitor.id = CONSTANTS.DEVELOPMENT.CACHE_MONITOR_ID;
        monitor.className = `${CONSTANTS.CLASSES.CACHE_MONITOR} ${CONSTANTS.CLASSES.BACKDROP_BLUR_10}`;
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
        
        const maxCacheSize = Utils.getNestedProperty(window.CONFIG, 'cache.maxSize', CONSTANTS.CACHE.DEFAULT_MAX_SIZE);
        monitor.innerHTML = `
            <div>Cache: <span id="cache-size">0</span>/${maxCacheSize}</div>
            <div>Hit rate: <span id="cache-hit-rate">0</span>%</div>
        `;
        document.body.appendChild(monitor);
        
        if (Utils.isDevelopment()) {
            monitor.style.display = 'block';
        }
        
        this.cacheMonitor = monitor;
    }

    updateCacheMonitor(cacheStats) {
        const sizeEl = document.querySelector(CONSTANTS.SELECTORS.CACHE_SIZE);
        const hitRateEl = document.querySelector(CONSTANTS.SELECTORS.CACHE_HIT_RATE);
        
        if (sizeEl) sizeEl.textContent = cacheStats.cacheSize;
        if (hitRateEl) hitRateEl.textContent = cacheStats.hitRate.replace('%', '');
    }

    navigateToPeriod(periodIndex) {
        this.currentPeriodIndex = periodIndex;
        const slider = document.querySelector(CONSTANTS.SELECTORS.TIME_SLIDER);
        const display = document.querySelector(CONSTANTS.SELECTORS.CURRENT_PERIOD);
        
        if (slider) {
            slider.value = periodIndex;
            slider.setAttribute(CONSTANTS.ACCESSIBILITY.ARIA.VALUE_TEXT, this.periods[periodIndex].label);
        }
        if (display) {
            display.textContent = this.periods[periodIndex].label;
        }
    }

    showTerritoryInfo(feature, currentPeriod) {
        const properties = feature.properties;
        const nameField = Utils.getTerritoryName(properties);
        
        const nameEl = document.querySelector(CONSTANTS.SELECTORS.TERRITORY_NAME);
        const detailsEl = document.querySelector(CONSTANTS.SELECTORS.TERRITORY_DETAILS);
        
        if (!nameEl || !detailsEl) {
            console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Territory info elements not found`);
            return;
        }
        
        nameEl.textContent = nameField;
        
        let detailsHTML = `<strong>Territory:</strong> ${Validators.sanitizeInput(nameField)}<br>`;
        
        Object.keys(properties).forEach(key => {
            if (key !== 'NAME' && key !== 'name' && key !== 'NAME_EN' && properties[key] !== null && properties[key] !== '') {
                const value = Validators.sanitizeInput(String(properties[key]));
                const displayKey = Utils.formatPropertyKey(key);
                detailsHTML += `<strong>${displayKey}:</strong> ${value}<br>`;
            }
        });
        
        detailsHTML += `<strong>Period:</strong> ${Validators.sanitizeInput(currentPeriod.label)}<br>`;
        
        detailsEl.innerHTML = detailsHTML;
        
        this.showInfoPanel();
    }

    showInfoPanel() {
        const panel = document.querySelector(CONSTANTS.SELECTORS.INFO_PANEL);
        if (!panel) return;
        
        panel.classList.remove(CONSTANTS.CLASSES.HIDDEN);
        
        const closeButton = document.querySelector(CONSTANTS.SELECTORS.CLOSE_INFO);
        if (closeButton) {
            setTimeout(() => closeButton.focus(), this.focusDelay);
        }
    }

    hideInfoPanel() {
        const panel = document.querySelector(CONSTANTS.SELECTORS.INFO_PANEL);
        if (panel) {
            panel.classList.add(CONSTANTS.CLASSES.HIDDEN);
        }
    }

    showLoading() {
        const loading = document.querySelector(CONSTANTS.SELECTORS.LOADING);
        if (loading) {
            loading.classList.remove(CONSTANTS.CLASSES.HIDDEN);
        }
    }

    hideLoading() {
        const loading = document.querySelector(CONSTANTS.SELECTORS.LOADING);
        if (loading) {
            loading.classList.add(CONSTANTS.CLASSES.HIDDEN);
        }
    }

    getCurrentPeriodIndex() {
        return this.currentPeriodIndex;
    }

    setCurrentPeriodIndex(index) {
        this.currentPeriodIndex = index;
    }

    debounce(func, wait) {
        return Utils.debounce(func, wait);
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