/**
 * Historical Interactive World Map - Simplified Version
 * Direct and simple implementation without unnecessary abstractions
 */

class HistoricalMap {
    constructor() {
        // Load periods configuration
        this.periods = window.PeriodsConfig.getHistoricalPeriods();
        this.currentPeriodIndex = 0;
        this.isLoading = false;

        // Simple cache for loaded data
        this.dataCache = new Map();
        this.maxCacheSize = 25;

        // Request management
        this.pendingIndex = null;
        this.abortController = null;

        // Components
        this.map = null;
        this.currentLayer = null;
        this.selectedLayer = null;

        // DOM elements
        this.elements = {
            slider: document.querySelector('#time-slider'),
            currentPeriod: document.querySelector('#current-period'),
            infoPanel: document.querySelector('#info-panel'),
            territoryName: document.querySelector('#territory-name'),
            territoryDetails: document.querySelector('#territory-details'),
            closeButton: document.querySelector('#close-info'),
            loading: document.querySelector('#loading')
        };

        this.init();
    }

    init() {
        this.initMap();
        this.initUI();
        this.loadPeriod(this.currentPeriodIndex);
    }

    initMap() {
        // Create map
        this.map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 6,
            worldCopyJump: false,
            preferCanvas: true
        });

        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 6
        }).addTo(this.map);

        // Add scale
        L.control.scale({ position: 'bottomleft' }).addTo(this.map);
    }

    initUI() {
        const { slider, currentPeriod, closeButton } = this.elements;

        // Setup slider
        slider.max = this.periods.length - 1;
        slider.value = this.currentPeriodIndex;
        currentPeriod.textContent = this.periods[this.currentPeriodIndex].label;

        // Debounced slider change
        let sliderTimeout = null;
        slider.addEventListener('input', (e) => {
            const index = parseInt(e.target.value);
            this.currentPeriodIndex = index;
            currentPeriod.textContent = this.periods[index].label;
            slider.setAttribute('aria-valuetext', this.periods[index].label);

            clearTimeout(sliderTimeout);
            sliderTimeout = setTimeout(() => {
                this.loadPeriod(index);
            }, 300);
        });

        // Close button
        closeButton.addEventListener('click', () => {
            this.hideInfoPanel();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;

            switch(e.key) {
                case 'Escape':
                    this.hideInfoPanel();
                    break;
                case 'ArrowLeft':
                    if (this.currentPeriodIndex > 0) {
                        this.navigateToPeriod(this.currentPeriodIndex - 1);
                    }
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    if (this.currentPeriodIndex < this.periods.length - 1) {
                        this.navigateToPeriod(this.currentPeriodIndex + 1);
                    }
                    e.preventDefault();
                    break;
            }
        });
    }

    navigateToPeriod(index) {
        this.currentPeriodIndex = index;
        this.elements.slider.value = index;
        this.elements.currentPeriod.textContent = this.periods[index].label;
        this.elements.slider.setAttribute('aria-valuetext', this.periods[index].label);
        this.loadPeriod(index);
    }

    async loadPeriod(index) {
        this.pendingIndex = index;

        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();
        this.hideInfoPanel();

        try {
            while (this.pendingIndex !== null) {
                const targetIndex = this.pendingIndex;
                this.pendingIndex = null;

                const period = this.periods[targetIndex];
                const cacheKey = period.file;
                let geoJsonData;

                if (this.dataCache.has(cacheKey)) {
                    geoJsonData = this.dataCache.get(cacheKey);
                } else {
                    // Abort any in-flight fetch
                    if (this.abortController) {
                        this.abortController.abort();
                    }
                    this.abortController = new AbortController();

                    const response = await fetch(`data/${period.file}`, {
                        signal: this.abortController.signal
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to load ${period.file}: ${response.statusText}`);
                    }

                    geoJsonData = await response.json();
                    this.addToCache(cacheKey, geoJsonData);
                }

                // Only render if no newer request arrived during fetch
                if (this.pendingIndex === null) {
                    this.updateMap(geoJsonData, period);
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            this.showError(`Failed to load data. Please try again.`);
        } finally {
            this.isLoading = false;
            this.abortController = null;
            this.hideLoading();
        }
    }

    addToCache(key, data) {
        // Remove oldest if cache is full
        if (this.dataCache.size >= this.maxCacheSize) {
            const firstKey = this.dataCache.keys().next().value;
            this.dataCache.delete(firstKey);
        }
        this.dataCache.set(key, data);
    }

    updateMap(geoJsonData, period) {
        // Clear selection
        this.selectedLayer = null;

        // Remove old layer
        if (this.currentLayer) {
            this.map.removeLayer(this.currentLayer);
        }

        // Create new layer
        this.currentLayer = L.geoJSON(geoJsonData, {
            style: (feature) => this.getFeatureStyle(feature),
            onEachFeature: (feature, layer) => {
                // Click handler
                layer.on('click', (e) => {
                    this.handleTerritoryClick(feature, layer, period);
                    L.DomEvent.stopPropagation(e);
                });

                // Hover handlers
                layer.on('mouseover', () => {
                    if (this.selectedLayer !== layer) {
                        this.highlightFeature(layer);
                    }
                });

                layer.on('mouseout', () => {
                    if (this.selectedLayer !== layer) {
                        this.resetHighlight(layer);
                    }
                });
            }
        });

        this.currentLayer.addTo(this.map);
    }

    getFeatureStyle(feature) {
        const hasName = feature.properties &&
                       (feature.properties.NAME ||
                        feature.properties.name ||
                        feature.properties.NAME_EN);

        return {
            fillColor: hasName ? '#3498db' : '#95a5a6',
            weight: 2,
            opacity: 1,
            color: 'rgba(255, 255, 255, 0.8)',
            fillOpacity: hasName ? 0.7 : 0.4
        };
    }

    highlightFeature(layer) {
        layer.setStyle({
            weight: 3,
            color: 'rgba(255, 255, 255, 1)',
            fillOpacity: 0.9,
            dashArray: '3'
        });
        layer.bringToFront();
    }

    resetHighlight(layer) {
        if (this.currentLayer) {
            this.currentLayer.resetStyle(layer);
        }
    }

    handleTerritoryClick(feature, layer, period) {
        // Clear previous selection
        if (this.selectedLayer && this.currentLayer) {
            this.currentLayer.resetStyle(this.selectedLayer);
        }

        // Highlight selected territory
        this.selectedLayer = layer;
        layer.setStyle({
            weight: 4,
            color: 'rgba(255, 255, 255, 1)',
            fillColor: '#f39c12',
            fillOpacity: 0.9
        });
        layer.bringToFront();

        // Show info panel
        this.showTerritoryInfo(feature, period);
    }

    showTerritoryInfo(feature, period) {
        const props = feature.properties;
        const name = props.NAME || props.name || props.NAME_EN || 'Unknown Territory';

        this.elements.territoryName.textContent = name;

        // Build details
        let details = `<div><strong>Territory:</strong> ${this.sanitize(name)}</div>`;

        // Add other properties
        for (const [key, value] of Object.entries(props)) {
            if (key !== 'NAME' && key !== 'name' && key !== 'NAME_EN' && value) {
                const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                details += `<div><strong>${this.sanitize(displayKey)}:</strong> ${this.sanitize(String(value))}</div>`;
            }
        }

        details += `<div><strong>Period:</strong> ${this.sanitize(period.label)}</div>`;

        this.elements.territoryDetails.innerHTML = details;
        this.elements.infoPanel.classList.remove('hidden');
    }

    hideInfoPanel() {
        this.elements.infoPanel.classList.add('hidden');

        // Clear selection
        if (this.selectedLayer && this.currentLayer) {
            this.currentLayer.resetStyle(this.selectedLayer);
            this.selectedLayer = null;
        }
    }

    showLoading() {
        this.elements.loading.classList.remove('hidden');
    }

    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }

    showError(message) {
        const existing = document.querySelector('.error-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = '';

        const content = document.createElement('div');
        content.className = 'error-content';

        const heading = document.createElement('h4');
        heading.textContent = 'Loading Error';
        content.appendChild(heading);

        const text = document.createElement('p');
        text.textContent = message;
        content.appendChild(text);

        const actions = document.createElement('div');
        actions.className = 'error-actions';

        const retryBtn = document.createElement('button');
        retryBtn.className = 'retry-button';
        retryBtn.textContent = 'Retry';
        retryBtn.addEventListener('click', () => {
            notification.remove();
            this.loadPeriod(this.currentPeriodIndex);
        });

        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'dismiss-button';
        dismissBtn.textContent = 'Dismiss';
        dismissBtn.addEventListener('click', () => notification.remove());

        actions.appendChild(retryBtn);
        actions.appendChild(dismissBtn);
        content.appendChild(actions);
        notification.appendChild(content);
        document.body.appendChild(notification);
    }

    sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    destroy() {
        if (this.abortController) {
            this.abortController.abort();
        }
        if (this.map) {
            this.map.remove();
        }
        this.dataCache.clear();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.historicalMap = new HistoricalMap();
    } catch (error) {
        const el = document.getElementById('map');
        if (el) {
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.color = '#fff';
            el.style.fontSize = '1.2rem';
            el.textContent = 'Failed to load the Historical World Map. Please refresh the page.';
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.historicalMap) {
        window.historicalMap.destroy();
    }
});
