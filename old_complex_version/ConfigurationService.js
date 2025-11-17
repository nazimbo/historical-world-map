/**
 * Configuration Service
 * Centralized configuration management to replace global CONFIG access
 */

class ConfigurationService {
    constructor(userConfig = {}) {
        this.config = this.mergeWithDefaults(userConfig);
        this.validated = false;
        this.validationResult = null;
        
        // Validate configuration on creation
        this.validate();
    }

    /**
     * Merge user configuration with defaults from CONSTANTS
     * @param {Object} userConfig - User provided configuration
     * @returns {Object} Merged configuration
     */
    mergeWithDefaults(userConfig) {
        if (!window.CONSTANTS) {
            throw new Error('CONSTANTS not available. Ensure constants.js is loaded before ConfigurationService.');
        }

        const defaults = {
            cache: {
                maxSize: CONSTANTS.CACHE.DEFAULT_MAX_SIZE,
                preloadDistance: CONSTANTS.CACHE.DEFAULT_PRELOAD_DISTANCE,
                optimizationThreshold: CONSTANTS.CACHE.DEFAULT_OPTIMIZATION_THRESHOLD
            },
            map: {
                center: CONSTANTS.MAP.DEFAULT_CENTER,
                zoom: CONSTANTS.MAP.DEFAULT_ZOOM,
                minZoom: CONSTANTS.MAP.MIN_ZOOM,
                maxZoom: CONSTANTS.MAP.MAX_ZOOM,
                keyboardPanDelta: CONSTANTS.MAP.KEYBOARD_PAN_DELTA
            },
            ui: {
                debounceDelay: CONSTANTS.UI.DEFAULT_DEBOUNCE_DELAY,
                loadingTimeout: CONSTANTS.UI.LOADING_TIMEOUT,
                errorDisplayTime: CONSTANTS.UI.ERROR_DISPLAY_TIME,
                focusDelay: CONSTANTS.UI.FOCUS_DELAY
            },
            performance: {
                coordinatePrecision: CONSTANTS.DATA.COORDINATE_PRECISION,
                preloadDelay: CONSTANTS.UI.PRELOAD_DELAY,
                preloadStagger: CONSTANTS.UI.PRELOAD_STAGGER
            },
            development: {
                showCacheMonitor: true,
                enableLogging: true,
                logCacheStats: true
            },
            accessibility: {
                enableKeyboardNav: true,
                enableScreenReader: true,
                enableFocusManagement: true
            }
        };

        return this.deepMerge(defaults, userConfig);
    }

    /**
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    /**
     * Get configuration value by path
     * @param {string} path - Dot notation path (e.g., 'cache.maxSize')
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} Configuration value
     */
    get(path, defaultValue = null) {
        if (!this.validated) {
            console.warn('[ConfigurationService] Configuration not validated yet');
        }

        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : defaultValue;
        }, this.config);
    }

    /**
     * Set configuration value by path
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, this.config);
        
        target[lastKey] = value;
        
        // Re-validate after changes
        this.validate();
    }

    /**
     * Validate the configuration
     * @returns {Object} Validation result
     */
    validate() {
        if (!window.Validators) {
            console.warn('[ConfigurationService] Validators not available for validation');
            this.validated = false;
            this.validationResult = {
                isValid: false,
                errors: ['Validators not available'],
                warnings: []
            };
            return this.validationResult;
        }

        this.validationResult = window.Validators.validateConfiguration(this.config);
        this.validated = true;

        if (!this.validationResult.isValid) {
            console.error('[ConfigurationService] Configuration validation failed:', this.validationResult.errors);
        }

        if (this.validationResult.warnings.length > 0) {
            console.warn('[ConfigurationService] Configuration warnings:', this.validationResult.warnings);
        }

        return this.validationResult;
    }

    /**
     * Get validation result
     * @returns {Object} Validation result
     */
    getValidationResult() {
        return this.validationResult;
    }

    /**
     * Check if configuration is valid
     * @returns {boolean} Whether configuration is valid
     */
    isValid() {
        return this.validated && this.validationResult && this.validationResult.isValid;
    }

    /**
     * Get full configuration object (read-only)
     * @returns {Object} Configuration object
     */
    getAll() {
        return JSON.parse(JSON.stringify(this.config)); // Return deep copy to prevent mutations
    }

    /**
     * Reset configuration to defaults
     */
    reset() {
        this.config = this.mergeWithDefaults({});
        this.validate();
    }

    /**
     * Export configuration for debugging
     * @returns {string} JSON string of configuration
     */
    export() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Import configuration from JSON string
     * @param {string} configJson - JSON string of configuration
     */
    import(configJson) {
        try {
            const importedConfig = JSON.parse(configJson);
            this.config = this.mergeWithDefaults(importedConfig);
            this.validate();
        } catch (error) {
            console.error('[ConfigurationService] Failed to import configuration:', error);
            throw new Error('Invalid configuration JSON: ' + error.message);
        }
    }

    /**
     * Create a configuration service instance from global CONFIG
     * @returns {ConfigurationService} Configuration service instance
     */
    static fromGlobalConfig() {
        const globalConfig = window.CONFIG || {};
        return new ConfigurationService(globalConfig);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigurationService;
}

// Make available globally
window.ConfigurationService = ConfigurationService;