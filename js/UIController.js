class UIController {
    constructor(periods) {
        this.periods = periods;
        this.currentPeriodIndex = CONSTANTS.UI.DEFAULT_PERIOD_INDEX;
        this.debounceTimeout = null;
        this.onPeriodChange = null;
        this.cacheMonitor = null;
        this.focusDelay = Utils.getNestedProperty(window.CONFIG, 'ui.focusDelay', CONSTANTS.UI.FOCUS_DELAY);
        
        // Cache frequently accessed DOM elements
        this.elements = {
            slider: document.querySelector(CONSTANTS.SELECTORS.TIME_SLIDER),
            currentPeriodDisplay: document.querySelector(CONSTANTS.SELECTORS.CURRENT_PERIOD),
            infoPanel: document.querySelector(CONSTANTS.SELECTORS.INFO_PANEL),
            closeButton: document.querySelector(CONSTANTS.SELECTORS.CLOSE_INFO),
            loading: document.querySelector(CONSTANTS.SELECTORS.LOADING),
            territoryName: document.querySelector(CONSTANTS.SELECTORS.TERRITORY_NAME),
            territoryDetails: document.querySelector(CONSTANTS.SELECTORS.TERRITORY_DETAILS),
            cacheSize: document.querySelector(CONSTANTS.SELECTORS.CACHE_SIZE),
            cacheHitRate: document.querySelector(CONSTANTS.SELECTORS.CACHE_HIT_RATE)
        };
    }

    initSlider(onInputCallback) {
        const { slider, currentPeriodDisplay } = this.elements;
        
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
        const { closeButton, infoPanel } = this.elements;
        
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
                    if (this.elements.infoPanel && !this.elements.infoPanel.classList.contains(CONSTANTS.CLASSES.HIDDEN)) {
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
        const { cacheSize, cacheHitRate } = this.elements;
        
        if (cacheSize) cacheSize.textContent = cacheStats.cacheSize;
        if (cacheHitRate) cacheHitRate.textContent = cacheStats.hitRate.replace('%', '');
    }

    navigateToPeriod(periodIndex) {
        this.currentPeriodIndex = periodIndex;
        const { slider, currentPeriodDisplay } = this.elements;
        
        if (slider) {
            slider.value = periodIndex;
            slider.setAttribute(CONSTANTS.ACCESSIBILITY.ARIA.VALUE_TEXT, this.periods[periodIndex].label);
        }
        if (currentPeriodDisplay) {
            currentPeriodDisplay.textContent = this.periods[periodIndex].label;
        }
    }

    showTerritoryInfo(feature, currentPeriod) {
        const properties = feature.properties;
        const nameField = Utils.getTerritoryName(properties);
        const { territoryName, territoryDetails } = this.elements;
        
        if (!territoryName || !territoryDetails) {
            console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Territory info elements not found`);
            return;
        }
        
        territoryName.textContent = nameField;
        
        // Clear previous content
        territoryDetails.innerHTML = '';
        
        // Create territory info element
        this.createInfoElement(territoryDetails, 'Territory', Validators.sanitizeInput(nameField));
        
        // Add property information
        Object.keys(properties).forEach(key => {
            if (key !== 'NAME' && key !== 'name' && key !== 'NAME_EN' && properties[key] !== null && properties[key] !== '') {
                const value = Validators.sanitizeInput(String(properties[key]));
                const displayKey = Utils.formatPropertyKey(key);
                this.createInfoElement(territoryDetails, displayKey, value);
            }
        });
        
        // Add period information
        this.createInfoElement(territoryDetails, 'Period', Validators.sanitizeInput(currentPeriod.label));
        
        this.showInfoPanel();
    }

    /**
     * Create a safe info element without using innerHTML
     * @param {HTMLElement} container - Container to append to
     * @param {string} label - Label text
     * @param {string} value - Value text
     */
    createInfoElement(container, label, value) {
        const div = document.createElement('div');
        
        const strongElement = document.createElement('strong');
        strongElement.textContent = label + ':';
        
        const textNode = document.createTextNode(' ' + value);
        
        div.appendChild(strongElement);
        div.appendChild(textNode);
        div.appendChild(document.createElement('br'));
        
        container.appendChild(div);
    }

    showInfoPanel() {
        const { infoPanel, closeButton } = this.elements;
        if (!infoPanel) return;
        
        infoPanel.classList.remove(CONSTANTS.CLASSES.HIDDEN);
        
        if (closeButton) {
            setTimeout(() => closeButton.focus(), this.focusDelay);
        }
    }

    hideInfoPanel() {
        if (this.elements.infoPanel) {
            this.elements.infoPanel.classList.add(CONSTANTS.CLASSES.HIDDEN);
        }
    }

    showLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.remove(CONSTANTS.CLASSES.HIDDEN);
        }
    }

    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.add(CONSTANTS.CLASSES.HIDDEN);
        }
    }

    getCurrentPeriodIndex() {
        return this.currentPeriodIndex;
    }

    setCurrentPeriodIndex(index) {
        this.currentPeriodIndex = index;
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