/**
 * Historical Interactive World Map - Enhanced with Smart Caching
 * Core application logic for displaying changing political borders throughout history
 */

class HistoricalMap {
    constructor() {
        // Historical periods configuration - comprehensive timeline
        this.periods = [
            { year: -123000, file: 'world_bc123000.geojson', label: '123000 BC' },
            { year: -10000, file: 'world_bc10000.geojson', label: '10000 BC' },
            { year: -8000, file: 'world_bc8000.geojson', label: '8000 BC' },
            { year: -5000, file: 'world_bc5000.geojson', label: '5000 BC' },
            { year: -4000, file: 'world_bc4000.geojson', label: '4000 BC' },
            { year: -3000, file: 'world_bc3000.geojson', label: '3000 BC' },
            { year: -2000, file: 'world_bc2000.geojson', label: '2000 BC' },
            { year: -1500, file: 'world_bc1500.geojson', label: '1500 BC' },
            { year: -1000, file: 'world_bc1000.geojson', label: '1000 BC' },
            { year: -700, file: 'world_bc700.geojson', label: '700 BC' },
            { year: -500, file: 'world_bc500.geojson', label: '500 BC' },
            { year: -400, file: 'world_bc400.geojson', label: '400 BC' },
            { year: -323, file: 'world_bc323.geojson', label: '323 BC' },
            { year: -300, file: 'world_bc300.geojson', label: '300 BC' },
            { year: -200, file: 'world_bc200.geojson', label: '200 BC' },
            { year: -100, file: 'world_bc100.geojson', label: '100 BC' },
            { year: -1, file: 'world_bc1.geojson', label: '1 BC' },
            { year: 100, file: 'world_100.geojson', label: '100 AD' },
            { year: 200, file: 'world_200.geojson', label: '200 AD' },
            { year: 300, file: 'world_300.geojson', label: '300 AD' },
            { year: 400, file: 'world_400.geojson', label: '400 AD' },
            { year: 500, file: 'world_500.geojson', label: '500 AD' },
            { year: 600, file: 'world_600.geojson', label: '600 AD' },
            { year: 700, file: 'world_700.geojson', label: '700 AD' },
            { year: 800, file: 'world_800.geojson', label: '800 AD' },
            { year: 900, file: 'world_900.geojson', label: '900 AD' },
            { year: 1000, file: 'world_1000.geojson', label: '1000 AD' },
            { year: 1100, file: 'world_1100.geojson', label: '1100 AD' },
            { year: 1200, file: 'world_1200.geojson', label: '1200 AD' },
            { year: 1279, file: 'world_1279.geojson', label: '1279 AD' },
            { year: 1300, file: 'world_1300.geojson', label: '1300 AD' },
            { year: 1400, file: 'world_1400.geojson', label: '1400 AD' },
            { year: 1492, file: 'world_1492.geojson', label: '1492 AD' },
            { year: 1500, file: 'world_1500.geojson', label: '1500 AD' },
            { year: 1530, file: 'world_1530.geojson', label: '1530 AD' },
            { year: 1600, file: 'world_1600.geojson', label: '1600 AD' },
            { year: 1650, file: 'world_1650.geojson', label: '1650 AD' },
            { year: 1700, file: 'world_1700.geojson', label: '1700 AD' },
            { year: 1715, file: 'world_1715.geojson', label: '1715 AD' },
            { year: 1783, file: 'world_1783.geojson', label: '1783 AD' },
            { year: 1800, file: 'world_1800.geojson', label: '1800 AD' },
            { year: 1815, file: 'world_1815.geojson', label: '1815 AD' },
            { year: 1880, file: 'world_1880.geojson', label: '1880 AD' },
            { year: 1900, file: 'world_1900.geojson', label: '1900 AD' },
            { year: 1914, file: 'world_1914.geojson', label: '1914 AD' },
            { year: 1920, file: 'world_1920.geojson', label: '1920 AD' },
            { year: 1930, file: 'world_1930.geojson', label: '1930 AD' },
            { year: 1938, file: 'world_1938.geojson', label: '1938 AD' },
            { year: 1945, file: 'world_1945.geojson', label: '1945 AD' },
            { year: 1960, file: 'world_1960.geojson', label: '1960 AD' },
            { year: 1994, file: 'world_1994.geojson', label: '1994 AD' },
            { year: 2000, file: 'world_2000.geojson', label: '2000 AD' },
            { year: 2010, file: 'world_2010.geojson', label: '2010 AD' }
        ];

        this.currentPeriodIndex = 8; // Start at 1000 BC
        this.currentLayer = null;
        this.map = null;
        this.isLoading = false;
        this.selectedFeature = null;
        this.selectedLayer = null;
        this.errorNotification = null;
        this.debounceTimeout = null;

        // CRITICAL ADDITION: Smart caching system
        this.dataCache = new Map();
        this.maxCacheSize = 15; // Cache up to 15 periods
        this.cacheStats = {
            hits: 0,
            misses: 0,
            totalBytesLoaded: 0,
            totalLoadTime: 0
        };

        // Preloading queue for smooth transitions
        this.preloadQueue = new Set();
        this.isPreloading = false;

        // Initialize the application
        this.init();
    }

    /**
     * Initialize the map and UI components
     */
    init() {
        this.initMap();
        this.initSlider();
        this.initInfoPanel();
        this.initKeyboardControls();
        this.initCacheMonitor(); // NEW: Add cache monitoring
        
        // Load the initial period (1000 BC)
        this.loadPeriod(this.currentPeriodIndex);
        
        // Start preloading adjacent periods after initial load
        setTimeout(() => this.preloadAdjacentPeriods(this.currentPeriodIndex), 1000);
    }

    /**
     * NEW: Initialize cache monitoring UI
     */
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
            <div>Cache: <span id="cache-size">0</span>/${this.maxCacheSize}</div>
            <div>Hit rate: <span id="cache-hit-rate">0</span>%</div>
        `;
        document.body.appendChild(monitor);
        
        // Show cache monitor in development/debug mode
        if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
            monitor.style.display = 'block';
        }
    }

    /**
     * Update cache statistics display
     */
    updateCacheMonitor() {
        const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
            ? Math.round((this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100)
            : 0;
        
        const sizeEl = document.getElementById('cache-size');
        const hitRateEl = document.getElementById('cache-hit-rate');
        
        if (sizeEl) sizeEl.textContent = this.dataCache.size;
        if (hitRateEl) hitRateEl.textContent = hitRate;
    }

    /**
     * Initialize keyboard controls for accessibility
     */
    initKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'Escape':
                    if (!document.getElementById('info-panel').classList.contains('hidden')) {
                        this.hideInfoPanel();
                        e.preventDefault();
                    }
                    break;
                case 'ArrowLeft':
                    if (this.currentPeriodIndex > 0) {
                        this.navigateToPeriod(this.currentPeriodIndex - 1);
                        e.preventDefault();
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentPeriodIndex < this.periods.length - 1) {
                        this.navigateToPeriod(this.currentPeriodIndex + 1);
                        e.preventDefault();
                    }
                    break;
            }
        });
    }

    /**
     * Navigate to a specific period and update UI
     */
    navigateToPeriod(periodIndex) {
        this.currentPeriodIndex = periodIndex;
        document.getElementById('time-slider').value = periodIndex;
        document.getElementById('current-period').textContent = this.periods[periodIndex].label;
        this.debouncedLoadPeriod(periodIndex);
        
        // Preload adjacent periods for smoother navigation
        this.preloadAdjacentPeriods(periodIndex);
    }

    /**
     * Initialize the Leaflet map
     */
    initMap() {
        const worldBounds = L.latLngBounds(
            L.latLng(-85, -180),
            L.latLng(85, 180)
        );

        this.map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            minZoom: 1,
            maxZoom: 8,
            worldCopyJump: false,
            maxBounds: worldBounds,
            maxBoundsViscosity: 1.0,
            keyboard: true,
            keyboardPanDelta: 80
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 8
        }).addTo(this.map);

        L.control.scale({
            position: 'bottomleft'
        }).addTo(this.map);
    }

    /**
     * Initialize the time slider controls
     */
    initSlider() {
        const slider = document.getElementById('time-slider');
        const currentPeriodDisplay = document.getElementById('current-period');

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
            
            this.debouncedLoadPeriod(periodIndex);
            this.preloadAdjacentPeriods(periodIndex);
        });
    }

    /**
     * Initialize info panel controls
     */
    initInfoPanel() {
        const closeButton = document.getElementById('close-info');
        const infoPanel = document.getElementById('info-panel');
        
        closeButton.setAttribute('aria-label', 'Close territory information panel');
        infoPanel.setAttribute('role', 'dialog');
        infoPanel.setAttribute('aria-live', 'polite');
        
        closeButton.addEventListener('click', () => {
            this.hideInfoPanel();
        });
    }

    /**
     * Debounced period loading to avoid rapid API calls
     */
    debouncedLoadPeriod = this.debounce((periodIndex) => {
        this.loadPeriod(periodIndex);
    }, 300);

    /**
     * ENHANCED: Load period with smart caching
     */
    async loadPeriod(periodIndex) {
        if (this.isLoading) return;
        
        const period = this.periods[periodIndex];
        const cacheKey = period.file;
        
        // Check cache first
        if (this.dataCache.has(cacheKey)) {
            console.log(`Cache hit for ${period.label}`);
            this.cacheStats.hits++;
            this.updateCacheMonitor();
            
            // Use cached data immediately
            const cachedData = this.dataCache.get(cacheKey);
            this.updateMap(cachedData, period);
            
            // Move to end of cache (LRU behavior)
            this.dataCache.delete(cacheKey);
            this.dataCache.set(cacheKey, cachedData);
            
            return;
        }
        
        // Cache miss - need to load from network
        console.log(`Cache miss for ${period.label} - loading from network`);
        this.cacheStats.misses++;
        this.updateCacheMonitor();
        
        this.isLoading = true;
        this.showLoading();
        this.hideErrorNotification();

        const startTime = performance.now();

        try {
            const response = await fetch(`data/${period.file}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Data file not found: ${period.file}. Please ensure the data directory contains all required GeoJSON files.`);
                } else {
                    throw new Error(`Failed to load ${period.file}: ${response.status} ${response.statusText}`);
                }
            }

            const geoJsonData = await response.json();
            
            // Validate GeoJSON structure
            if (!geoJsonData.type || !geoJsonData.features) {
                throw new Error(`Invalid GeoJSON format in ${period.file}`);
            }
            
            // Optimize data before caching
            const optimizedData = this.optimizeGeoJSON(geoJsonData);
            
            // Add to cache
            this.addToCache(cacheKey, optimizedData);
            
            // Track statistics
            const loadTime = performance.now() - startTime;
            this.cacheStats.totalLoadTime += loadTime;
            console.log(`Loaded ${period.label} in ${Math.round(loadTime)}ms`);
            
            // Update map with optimized data
            this.updateMap(optimizedData, period);
            
        } catch (error) {
            console.error('Error loading period:', error);
            this.showErrorNotification(error.message, period);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * NEW: Optimize GeoJSON data for better performance
     */
    optimizeGeoJSON(data) {
        // Skip optimization for now if data is small
        if (JSON.stringify(data).length < 500000) { // < 500KB
            return data;
        }
        
        return {
            ...data,
            features: data.features.map(feature => ({
                ...feature,
                geometry: {
                    ...feature.geometry,
                    // Reduce coordinate precision to 6 decimal places
                    coordinates: this.simplifyCoordinates(feature.geometry.coordinates, 6)
                },
                // KEEP ALL PROPERTIES - don't strip them out
                properties: { ...feature.properties }
            }))
        };
    }

    /**
     * NEW: Simplify coordinate precision
     */
    simplifyCoordinates(coords, precision) {
        if (typeof coords[0] === 'number') {
            return coords.map(c => 
                Math.round(c * Math.pow(10, precision)) / Math.pow(10, precision)
            );
        }
        return coords.map(c => this.simplifyCoordinates(c, precision));
    }

    /**
     * NEW: Add data to cache with LRU eviction
     */
    addToCache(key, data) {
        // Check if we need to evict old entries
        if (this.dataCache.size >= this.maxCacheSize) {
            // Remove the least recently used (first) entry
            const firstKey = this.dataCache.keys().next().value;
            console.log(`Cache full - evicting ${firstKey}`);
            this.dataCache.delete(firstKey);
        }
        
        this.dataCache.set(key, data);
        this.updateCacheMonitor();
        
        // Estimate memory usage (rough estimate)
        const sizeInMB = JSON.stringify(data).length / (1024 * 1024);
        console.log(`Cached ${key} (≈${sizeInMB.toFixed(2)} MB). Cache size: ${this.dataCache.size}/${this.maxCacheSize}`);
    }

    /**
     * NEW: Preload adjacent periods for smooth navigation
     */
    async preloadAdjacentPeriods(currentIndex) {
        if (this.isPreloading) return;
        
        this.isPreloading = true;
        
        // Determine which periods to preload
        const indicesToPreload = [
            currentIndex - 1,
            currentIndex + 1,
            currentIndex - 2,
            currentIndex + 2
        ].filter(i => i >= 0 && i < this.periods.length);
        
        // Preload in background (don't await)
        for (const index of indicesToPreload) {
            const period = this.periods[index];
            if (!this.dataCache.has(period.file) && !this.preloadQueue.has(period.file)) {
                this.preloadQueue.add(period.file);
                
                // Preload with lower priority
                setTimeout(async () => {
                    if (!this.dataCache.has(period.file)) {
                        try {
                            console.log(`Preloading ${period.label} in background`);
                            const response = await fetch(`data/${period.file}`);
                            if (response.ok) {
                                const data = await response.json();
                                const optimizedData = this.optimizeGeoJSON(data);
                                this.addToCache(period.file, optimizedData);
                            }
                        } catch (error) {
                            console.warn(`Failed to preload ${period.file}:`, error);
                        } finally {
                            this.preloadQueue.delete(period.file);
                        }
                    }
                }, 100 * (Math.abs(currentIndex - index))); // Stagger preloads
            }
        }
        
        this.isPreloading = false;
    }

    /**
     * Show error notification with retry option
     */
    showErrorNotification(message, period) {
        this.hideErrorNotification();
        
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
        this.errorNotification = notification;
        
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.hideErrorNotification();
            // Clear cache entry for failed load
            this.dataCache.delete(period.file);
            this.loadPeriod(this.currentPeriodIndex);
        });
        
        document.getElementById('dismiss-btn').addEventListener('click', () => {
            this.hideErrorNotification();
        });
        
        setTimeout(() => {
            this.hideErrorNotification();
        }, 10000);
    }

    /**
     * Hide error notification
     */
    hideErrorNotification() {
        if (this.errorNotification) {
            this.errorNotification.remove();
            this.errorNotification = null;
        }
    }

    /**
     * Update the map with new GeoJSON data
     */
    updateMap(geoJsonData, period) {
        this.clearSelection();
        
        if (this.currentLayer) {
            this.map.removeLayer(this.currentLayer);
        }

        this.hideInfoPanel();

        this.currentLayer = L.geoJSON(geoJsonData, {
            style: (feature) => this.getFeatureStyle(feature),
            onEachFeature: (feature, layer) => {
                layer.on('click', (e) => {
                    this.showTerritoryInfo(feature, layer);
                    L.DomEvent.stopPropagation(e);
                });

                layer.on('mouseover', (e) => {
                    if (this.selectedLayer !== e.target) {
                        this.highlightFeature(e.target);
                    }
                });

                layer.on('mouseout', (e) => {
                    if (this.selectedLayer !== e.target) {
                        this.resetHighlight(e.target);
                    }
                });

                layer.getElement()?.setAttribute('tabindex', '0');
                layer.getElement()?.setAttribute('role', 'button');
                layer.getElement()?.setAttribute('aria-label', 
                    `Territory: ${feature.properties.NAME || feature.properties.name || 'Unknown'}`);
            }
        });

        this.currentLayer.addTo(this.map);
    }

    /**
     * Get styling for map features
     */
    getFeatureStyle(feature) {
        const hasData = this.hasValidData(feature);
        
        return {
            fillColor: hasData ? '#3498db' : '#95a5a6',
            weight: 1.5,
            opacity: 0.9,
            color: 'rgba(255, 255, 255, 0.8)',
            fillOpacity: hasData ? 0.7 : 0.4,
            dashArray: null,
            className: 'territory-feature'
        };
    }
    
    /**
     * Check if a territory has valid data
     */
    hasValidData(feature) {
        const props = feature.properties;
        if (!props) return false;
        
        const name = props.NAME || props.name;
        if (!name || name.trim() === '') return false;
        
        const keyFields = Object.keys(props).filter(key => 
            key !== 'NAME' && key !== 'name' && props[key] !== null
        );
        
        return keyFields.length > 0;
    }

    /**
     * Highlight a feature on hover
     */
    highlightFeature(layer) {
        layer.setStyle({
            weight: 3,
            color: 'rgba(255, 255, 255, 1)',
            fillOpacity: 0.9,
            dashArray: '5, 5',
            className: 'territory-feature territory-hover'
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    /**
     * Select a feature (persistent highlight)
     */
    selectFeature(layer) {
        layer.setStyle({
            weight: 4,
            color: 'rgba(255, 255, 255, 1)',
            fillColor: 'rgba(255, 215, 0, 0.8)',
            fillOpacity: 0.9,
            dashArray: null,
            className: 'territory-feature territory-selected'
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        if (this.selectedLayer && this.currentLayer) {
            this.currentLayer.resetStyle(this.selectedLayer);
        }
        this.selectedFeature = null;
        this.selectedLayer = null;
    }

    /**
     * Reset feature highlighting
     */
    resetHighlight(layer) {
        if (this.selectedLayer && this.selectedLayer === layer) {
            return;
        }
        
        if (this.currentLayer) {
            this.currentLayer.resetStyle(layer);
        }
    }

    /**
     * Show territory information in the info panel
     */
    showTerritoryInfo(feature, layer) {
        this.clearSelection();
        
        this.selectedFeature = feature;
        this.selectedLayer = layer;
        
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
        
        detailsHTML += `<strong>Period:</strong> ${this.periods[this.currentPeriodIndex].label}<br>`;
        
        document.getElementById('territory-details').innerHTML = detailsHTML;
        
        this.showInfoPanel();
        this.selectFeature(layer);
    }

    /**
     * Show the info panel
     */
    showInfoPanel() {
        const panel = document.getElementById('info-panel');
        panel.classList.remove('hidden');
        
        const closeButton = document.getElementById('close-info');
        setTimeout(() => closeButton.focus(), 100);
    }

    /**
     * Hide the info panel
     */
    hideInfoPanel() {
        document.getElementById('info-panel').classList.add('hidden');
        this.clearSelection();
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    /**
     * NEW: Clear cache (useful for debugging or memory management)
     */
    clearCache() {
        const size = this.dataCache.size;
        this.dataCache.clear();
        this.preloadQueue.clear();
        console.log(`Cleared cache (removed ${size} entries)`);
        this.updateCacheMonitor();
    }

    /**
     * NEW: Get cache statistics
     */
    getCacheStats() {
        const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
        const hitRate = totalRequests > 0 
            ? (this.cacheStats.hits / totalRequests * 100).toFixed(1)
            : 0;
        
        return {
            cacheSize: this.dataCache.size,
            maxSize: this.maxCacheSize,
            hits: this.cacheStats.hits,
            misses: this.cacheStats.misses,
            hitRate: `${hitRate}%`,
            avgLoadTime: totalRequests > 0 
                ? `${Math.round(this.cacheStats.totalLoadTime / this.cacheStats.misses)}ms`
                : 'N/A'
        };
    }

    /**
     * Cleanup method for proper disposal
     */
    destroy() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        this.hideErrorNotification();
        this.clearCache();
        if (this.map) {
            this.map.remove();
        }
    }

    /**
     * Utility function for debouncing
     */
    debounce(func, wait) {
        return (...args) => {
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }
            this.debounceTimeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('map')) {
        console.error('Map container not found!');
        return;
    }

    window.historicalMap = new HistoricalMap();
    
    // Expose cache stats for debugging
    window.getCacheStats = () => window.historicalMap.getCacheStats();
    window.clearCache = () => window.historicalMap.clearCache();
});

// Handle page unload for cleanup
window.addEventListener('beforeunload', () => {
    if (window.historicalMap) {
        window.historicalMap.destroy();
    }
});

// Handle global errors
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});