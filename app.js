/**
 * Historical Interactive World Map - Modular Architecture
 * Main orchestrator class that coordinates all application modules
 */

class HistoricalMap {
    constructor() {
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

        this.isLoading = false;
        
        this.dataManager = new DataManager();
        this.mapRenderer = new MapRenderer();
        this.uiController = new UIController(this.periods);
        this.eventHandler = new EventHandler(this.mapRenderer, this.uiController);
        this.errorNotification = new ErrorNotification();
        this.errorHandler = new ErrorHandler();

        const debounceDelay = Utils.getNestedProperty(window.CONFIG, 'ui.debounceDelay', CONSTANTS.UI.DEFAULT_DEBOUNCE_DELAY);
        this.debouncedLoadPeriod = Utils.debounce((periodIndex) => {
            this.loadPeriod(periodIndex);
        }, debounceDelay);

        this.init();
    }

    init() {
        this.mapRenderer.initMap();
        this.setupEventHandlers();
        this.initUI();
        
        const initialPeriodIndex = this.uiController.getCurrentPeriodIndex();
        this.loadPeriod(initialPeriodIndex);
        
        const preloadDelay = Utils.getNestedProperty(window.CONFIG, 'performance.preloadDelay', CONSTANTS.UI.PRELOAD_DELAY);
        setTimeout(() => this.dataManager.preloadAdjacentPeriods(this.periods, initialPeriodIndex), preloadDelay);
    }

    setupEventHandlers() {
        this.eventHandler.setTerritoryClickHandler((feature, layer) => {
            this.uiController.showTerritoryInfo(feature, this.periods[this.uiController.getCurrentPeriodIndex()]);
        });

        this.eventHandler.setPeriodChangeHandler((periodIndex) => {
            this.debouncedLoadPeriod(periodIndex);
            this.dataManager.preloadAdjacentPeriods(this.periods, periodIndex);
        });
    }

    initUI() {
        const debounceDelay = Utils.getNestedProperty(window.CONFIG, 'ui.debounceDelay', CONSTANTS.UI.DEFAULT_DEBOUNCE_DELAY);
        const debouncedPeriodChange = Utils.debounce((periodIndex) => {
            this.eventHandler.handlePeriodNavigation(periodIndex);
        }, debounceDelay);

        this.uiController.initSlider(debouncedPeriodChange);
        this.uiController.initInfoPanel(() => this.eventHandler.handleInfoPanelClose());
        this.uiController.initKeyboardControls(
            (periodIndex) => this.navigateToPeriod(periodIndex),
            () => this.eventHandler.handleInfoPanelClose()
        );
        this.uiController.initCacheMonitor();
    }

    navigateToPeriod(periodIndex) {
        this.uiController.navigateToPeriod(periodIndex);
        this.debouncedLoadPeriod(periodIndex);
        this.dataManager.preloadAdjacentPeriods(this.periods, periodIndex);
    }







    async loadPeriod(periodIndex) {
        if (this.isLoading) return;
        
        const period = this.periods[periodIndex];
        this.isLoading = true;
        this.uiController.showLoading();
        this.errorNotification.hide();

        try {
            const geoJsonData = await this.dataManager.loadPeriod(period);
            this.updateMap(geoJsonData);
            this.uiController.updateCacheMonitor(this.dataManager.getCacheStats());
            
        } catch (error) {
            console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Error loading period:`, error);
            this.errorNotification.show(error, period, (retryPeriod) => {
                const cacheKey = Utils.getCacheKey(retryPeriod);
                this.dataManager.deleteCacheEntry(cacheKey);
                this.loadPeriod(this.uiController.getCurrentPeriodIndex());
            });
        } finally {
            this.isLoading = false;
            this.uiController.hideLoading();
        }
    }







    updateMap(geoJsonData) {
        this.uiController.hideInfoPanel();
        this.mapRenderer.updateMap(geoJsonData, this.eventHandler.getMapEventHandlers());
    }











    clearCache() {
        return this.dataManager.clearCache();
    }

    getCacheStats() {
        return this.dataManager.getCacheStats();
    }

    destroy() {
        this.uiController.destroy();
        this.errorNotification.hide();
        this.dataManager.clearCache();
        this.mapRenderer.destroy();
    }

}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.querySelector(CONSTANTS.SELECTORS.MAP);
    if (!mapContainer) {
        console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Map container not found!`);
        return;
    }

    // Validate configuration
    const configValidation = Validators.validateConfiguration(window.CONFIG);
    if (configValidation.warnings.length > 0) {
        console.warn(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Configuration warnings:`, configValidation.warnings);
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
    console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Global error:`, e.error);
    
    // Create global error handler if not exists
    if (!window.globalErrorHandler) {
        window.globalErrorHandler = new ErrorHandler();
    }
    
    window.globalErrorHandler.handleError(e.error, 'global');
});