/**
 * Historical Interactive World Map
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

        this.currentPeriodIndex = 0;
        this.currentLayer = null;
        this.map = null;
        this.isLoading = false;

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
        
        // Load the initial period
        this.loadPeriod(0);
    }

    /**
     * Initialize the Leaflet map
     */
    initMap() {
        // Create map centered on the world
        this.map = L.map('map', {
            center: [20, 0], // Centered on equator
            zoom: 2,
            minZoom: 1,
            maxZoom: 8,
            worldCopyJump: true
        });

        // Add base tile layer (light background for historical data)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 8
        }).addTo(this.map);

        // Add scale control
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

        // Set initial display
        currentPeriodDisplay.textContent = this.periods[0].label;

        // Handle slider changes
        slider.addEventListener('input', (e) => {
            const periodIndex = parseInt(e.target.value);
            this.currentPeriodIndex = periodIndex;
            currentPeriodDisplay.textContent = this.periods[periodIndex].label;
            
            // Load new period with debouncing
            this.debouncedLoadPeriod(periodIndex);
        });
    }

    /**
     * Initialize info panel controls
     */
    initInfoPanel() {
        const closeButton = document.getElementById('close-info');
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
     * Load and display a specific historical period
     * @param {number} periodIndex - Index of the period to load
     */
    async loadPeriod(periodIndex) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();

        try {
            const period = this.periods[periodIndex];
            console.log(`Loading period: ${period.label}`);

            // Fetch GeoJSON data
            const response = await fetch(`data/${period.file}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${period.file}: ${response.status} ${response.statusText}`);
            }

            const geoJsonData = await response.json();
            
            // Update the map
            this.updateMap(geoJsonData, period);
            
        } catch (error) {
            console.error('Error loading period:', error);
            this.showError(`Failed to load historical data for ${this.periods[periodIndex].label}. ${error.message}`);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * Update the map with new GeoJSON data
     * @param {Object} geoJsonData - GeoJSON data to display
     * @param {Object} period - Period information
     */
    updateMap(geoJsonData, period) {
        // Remove previous layer with fade out effect
        if (this.currentLayer) {
            this.map.removeLayer(this.currentLayer);
        }

        // Hide info panel when switching periods
        this.hideInfoPanel();

        // Create new layer with styling and interactions
        this.currentLayer = L.geoJSON(geoJsonData, {
            style: this.getFeatureStyle,
            onEachFeature: (feature, layer) => {
                // Add click handler for territory info
                layer.on('click', (e) => {
                    this.showTerritoryInfo(feature, layer);
                    L.DomEvent.stopPropagation(e);
                });

                // Add hover effects
                layer.on('mouseover', (e) => {
                    this.highlightFeature(e.target);
                });

                layer.on('mouseout', (e) => {
                    this.resetHighlight(e.target);
                });
            }
        });

        // Add layer to map with fade in effect
        this.currentLayer.addTo(this.map);

        console.log(`Loaded ${geoJsonData.features.length} territories for ${period.label}`);
    }

    /**
     * Get styling for map features
     * @param {Object} feature - GeoJSON feature
     * @returns {Object} - Leaflet style object
     */
    getFeatureStyle(feature) {
        return {
            fillColor: '#3498db',
            weight: 1,
            opacity: 0.8,
            color: '#2c3e50',
            fillOpacity: 0.6
        };
    }

    /**
     * Highlight a feature on hover
     * @param {Object} layer - Leaflet layer
     */
    highlightFeature(layer) {
        layer.setStyle({
            weight: 3,
            color: '#e74c3c',
            fillOpacity: 0.8
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    /**
     * Reset feature highlighting
     * @param {Object} layer - Leaflet layer
     */
    resetHighlight(layer) {
        if (this.currentLayer) {
            this.currentLayer.resetStyle(layer);
        }
    }

    /**
     * Show territory information in the info panel
     * @param {Object} feature - GeoJSON feature
     * @param {Object} layer - Leaflet layer
     */
    showTerritoryInfo(feature, layer) {
        const properties = feature.properties;
        const nameField = properties.NAME || properties.name || properties.NAME_EN || 'Unknown Territory';
        
        // Update info panel content
        document.getElementById('territory-name').textContent = nameField;
        
        let detailsHTML = `<strong>Territory:</strong> ${nameField}<br>`;
        
        // Add any additional properties
        if (properties.TYPE) {
            detailsHTML += `<strong>Type:</strong> ${properties.TYPE}<br>`;
        }
        if (properties.YEAR) {
            detailsHTML += `<strong>Year:</strong> ${properties.YEAR}<br>`;
        }
        
        // Add current period context
        detailsHTML += `<strong>Period:</strong> ${this.periods[this.currentPeriodIndex].label}<br>`;
        
        document.getElementById('territory-details').innerHTML = detailsHTML;
        
        // Show the panel
        this.showInfoPanel();

        // Highlight the selected territory
        this.highlightFeature(layer);
    }

    /**
     * Show the info panel
     */
    showInfoPanel() {
        document.getElementById('info-panel').classList.remove('hidden');
    }

    /**
     * Hide the info panel
     */
    hideInfoPanel() {
        document.getElementById('info-panel').classList.add('hidden');
        
        // Reset any highlighted features
        if (this.currentLayer) {
            this.currentLayer.eachLayer((layer) => {
                this.resetHighlight(layer);
            });
        }
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
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        // For now, just log and alert - in production would use a proper notification system
        console.error(message);
        alert(`Error: ${message}`);
    }

    /**
     * Utility function for debouncing
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Historical Interactive World Map...');
    
    // Check if required elements exist
    if (!document.getElementById('map')) {
        console.error('Map container not found!');
        return;
    }

    // Create the application instance
    window.historicalMap = new HistoricalMap();
    
    console.log('Historical Map initialized successfully');
});

// Handle any global errors
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoricalMap;
}