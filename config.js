/**
 * Configuration settings for Historical World Map
 * Modify these values to customize the application behavior
 */

const CONFIG = {
  // Cache settings
  cache: {
    maxSize: CONSTANTS?.CACHE?.DEFAULT_MAX_SIZE || 15,
    preloadDistance: CONSTANTS?.CACHE?.DEFAULT_PRELOAD_DISTANCE || 2,
    optimizationThreshold: CONSTANTS?.CACHE?.DEFAULT_OPTIMIZATION_THRESHOLD || 500000
  },

  // Map settings
  map: {
    center: CONSTANTS?.MAP?.DEFAULT_CENTER || [20, 0],
    zoom: CONSTANTS?.MAP?.DEFAULT_ZOOM || 2,
    minZoom: CONSTANTS?.MAP?.MIN_ZOOM || 1,
    maxZoom: CONSTANTS?.MAP?.MAX_ZOOM || 8,
    keyboardPanDelta: CONSTANTS?.MAP?.KEYBOARD_PAN_DELTA || 80
  },

  // UI settings
  ui: {
    debounceDelay: CONSTANTS?.UI?.DEFAULT_DEBOUNCE_DELAY || 300,
    loadingTimeout: CONSTANTS?.UI?.LOADING_TIMEOUT || 10000,
    errorDisplayTime: CONSTANTS?.UI?.ERROR_DISPLAY_TIME || 10000,
    focusDelay: CONSTANTS?.UI?.FOCUS_DELAY || 100
  },

  // Performance settings
  performance: {
    coordinatePrecision: CONSTANTS?.DATA?.COORDINATE_PRECISION || 6,
    preloadDelay: CONSTANTS?.UI?.PRELOAD_DELAY || 1000,
    preloadStagger: CONSTANTS?.UI?.PRELOAD_STAGGER || 100
  },

  // Development settings
  development: {
    showCacheMonitor: true,
    enableLogging: true,
    logCacheStats: true
  },

  // Accessibility settings
  accessibility: {
    enableKeyboardNav: true,
    enableScreenReader: true,
    enableFocusManagement: true
  }
};

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Make available globally
window.CONFIG = CONFIG;