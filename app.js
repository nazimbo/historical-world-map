/**
 * Historical Interactive World Map - Modular Architecture
 * Main orchestrator class that coordinates all application modules
 */

class HistoricalMap {
    constructor(dependencies = {}) {
        // Use dependency injection instead of hardcoding dependencies
        this.configService = dependencies.configService || ConfigurationService.fromGlobalConfig();
        this.eventBus = dependencies.eventBus || new EventBus();
        this.periods = dependencies.periods || window.PeriodsConfig.getHistoricalPeriods();
        
        // State management
        this.isLoading = false;
        this.currentPeriodIndex = this.configService.get('ui.defaultPeriodIndex', CONSTANTS.UI.DEFAULT_PERIOD_INDEX);
        
        // Inject dependencies with configuration service
        this.dataManager = dependencies.dataManager || new DataManager(this.configService, this.eventBus);
        this.mapRenderer = dependencies.mapRenderer || new MapRenderer(this.configService, this.eventBus);
        this.uiController = dependencies.uiController || new UIController(this.periods, this.configService, this.eventBus);
        this.eventHandler = dependencies.eventHandler || new EventHandler(this.eventBus);
        this.errorNotification = dependencies.errorNotification || new ErrorNotification(this.eventBus);
        this.errorHandler = dependencies.errorHandler || new ErrorHandler();

        // Create debounced function with configuration
        const debounceDelay = this.configService.get('ui.debounceDelay', CONSTANTS.UI.DEFAULT_DEBOUNCE_DELAY);
        this.debouncedLoadPeriod = Utils.debounce((periodIndex) => {
            this.loadPeriod(periodIndex);
        }, debounceDelay);

        // Set up event bus in debug mode if in development
        if (Utils.isDevelopment()) {
            this.eventBus.setDebugMode(true);
        }

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
        // Subscribe to EventBus events instead of direct coupling
        this.eventBus.on(this.eventBus.EVENTS.TERRITORY_CLICKED, (event) => {
            const { feature, layer } = event.data;
            const currentPeriod = this.periods[this.currentPeriodIndex];
            this.eventBus.emit(this.eventBus.EVENTS.INFO_PANEL_OPENED, { feature, currentPeriod });
        });

        this.eventBus.on(this.eventBus.EVENTS.PERIOD_CHANGED, (event) => {
            const { periodIndex } = event.data;
            this.currentPeriodIndex = periodIndex;
            this.debouncedLoadPeriod(periodIndex);
            this.eventBus.emit(this.eventBus.EVENTS.DATA_PRELOADED, { periods: this.periods, currentIndex: periodIndex });
        });

        this.eventBus.on(this.eventBus.EVENTS.PERIOD_LOAD_ERROR, (event) => {
            const { error, period } = event.data;
            this.errorNotification.show(error, period, (retryPeriod) => {
                const cacheKey = Utils.getCacheKey(retryPeriod);
                this.dataManager.deleteCacheEntry(cacheKey);
                this.loadPeriod(this.currentPeriodIndex);
            });
        });

        this.eventBus.on(this.eventBus.EVENTS.CACHE_UPDATED, (event) => {
            this.eventBus.emit(this.eventBus.EVENTS.CACHE_UPDATED, event.data);
        });
    }

    initUI() {
        // UI initialization is now handled by UIController through EventBus
        // No need for direct callback passing - everything goes through events
        const debounceDelay = this.configService.get('ui.debounceDelay', CONSTANTS.UI.DEFAULT_DEBOUNCE_DELAY);
        const debouncedPeriodChange = Utils.debounce((periodIndex) => {
            this.eventBus.emit(this.eventBus.EVENTS.PERIOD_CHANGED, { periodIndex });
        }, debounceDelay);

        this.uiController.initSlider(debouncedPeriodChange);
        this.uiController.initInfoPanel();
        this.uiController.initKeyboardControls((periodIndex) => this.navigateToPeriod(periodIndex));
        this.uiController.initCacheMonitor();
    }

    navigateToPeriod(periodIndex) {
        this.currentPeriodIndex = periodIndex;
        this.eventBus.emit(this.eventBus.EVENTS.PERIOD_CHANGED, { periodIndex });
    }







    async loadPeriod(periodIndex) {
        if (this.isLoading) return;
        
        const period = this.periods[periodIndex];
        this.isLoading = true;
        
        // Emit loading events instead of direct UI calls
        this.eventBus.emit(this.eventBus.EVENTS.PERIOD_LOADING, { period, periodIndex });
        this.eventBus.emit(this.eventBus.EVENTS.LOADING_SHOWN);
        this.eventBus.emit(this.eventBus.EVENTS.ERROR_CLEARED);

        try {
            const geoJsonData = await this.dataManager.loadPeriod(period);
            this.updateMap(geoJsonData);
            this.eventBus.emit(this.eventBus.EVENTS.PERIOD_LOADED, { period, periodIndex, data: geoJsonData });
            
        } catch (error) {
            console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Error loading period:`, error);
            this.eventBus.emit(this.eventBus.EVENTS.PERIOD_LOAD_ERROR, { error, period, periodIndex });
        } finally {
            this.isLoading = false;
            this.eventBus.emit(this.eventBus.EVENTS.LOADING_HIDDEN);
        }
    }







    updateMap(geoJsonData) {
        this.eventBus.emit(this.eventBus.EVENTS.INFO_PANEL_CLOSED);
        this.eventBus.emit(this.eventBus.EVENTS.MAP_UPDATED, { data: geoJsonData });
    }











    clearCache() {
        return this.dataManager.clearCache();
    }

    getCacheStats() {
        return this.dataManager.getCacheStats();
    }

    destroy() {
        // Clean up all components
        if (this.uiController) this.uiController.destroy();
        if (this.errorNotification) this.errorNotification.hide();
        if (this.dataManager) this.dataManager.clearCache();
        if (this.mapRenderer) this.mapRenderer.destroy();
        
        // Clear all event listeners
        if (this.eventBus) this.eventBus.clear();
    }

}

/**
 * Factory for creating HistoricalMap instances with proper dependency injection
 */
class HistoricalMapFactory {
    static create(options = {}) {
        // Create configuration service
        const configService = options.configService || ConfigurationService.fromGlobalConfig();
        
        if (!configService.isValid()) {
            const validation = configService.getValidationResult();
            console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Configuration validation failed:`, validation.errors);
            if (validation.warnings.length > 0) {
                console.warn(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Configuration warnings:`, validation.warnings);
            }
        }

        // Create event bus
        const eventBus = options.eventBus || new EventBus();
        
        // Get periods configuration
        const periods = options.periods || window.PeriodsConfig.getHistoricalPeriods();

        // Create dependencies with proper injection
        const dependencies = {
            configService,
            eventBus,
            periods,
            dataManager: options.dataManager,
            mapRenderer: options.mapRenderer,
            uiController: options.uiController,
            eventHandler: options.eventHandler,
            errorNotification: options.errorNotification,
            errorHandler: options.errorHandler
        };

        return new HistoricalMap(dependencies);
    }

    /**
     * Create instance for testing with mock dependencies
     */
    static createForTesting(mockDependencies = {}) {
        const defaultMocks = {
            configService: {
                get: (path, defaultValue) => defaultValue,
                isValid: () => true,
                getValidationResult: () => ({ errors: [], warnings: [] })
            },
            eventBus: {
                on: () => {},
                emit: () => {},
                clear: () => {},
                setDebugMode: () => {},
                EVENTS: {}
            },
            periods: [{ year: 2000, file: 'test.geojson', label: 'Test' }]
        };

        return HistoricalMapFactory.create({ ...defaultMocks, ...mockDependencies });
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.querySelector(CONSTANTS.SELECTORS.MAP);
    if (!mapContainer) {
        console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Map container not found!`);
        return;
    }

    try {
        // Create the application using the factory
        window.historicalMap = HistoricalMapFactory.create();
        
        // Expose debugging methods
        window.getCacheStats = () => window.historicalMap.getCacheStats();
        window.clearCache = () => window.historicalMap.clearCache();
        window.getEventBusDebugInfo = () => window.historicalMap.eventBus.getDebugInfo();

        // Register Service Worker for offline caching (Phase 1 optimization)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Service Worker registered successfully:`, registration.scope);

                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Service Worker update found`);

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} New Service Worker available. Refresh to update.`);
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.warn(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Service Worker registration failed:`, error);
                });
        }

        console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Application initialized successfully`);
    } catch (error) {
        console.error(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Failed to initialize application:`, error);
        
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #f5c6cb;
            max-width: 400px;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <h3>Application Failed to Load</h3>
            <p>There was an error initializing the Historical World Map. Please refresh the page and try again.</p>
            <small>Error: ${error.message}</small>
        `;
        document.body.appendChild(errorDiv);
    }
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