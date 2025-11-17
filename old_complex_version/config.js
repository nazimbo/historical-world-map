/**
 * Configuration settings for Historical World Map
 * Modify these values to customize the application behavior
 */

const CONFIG = {
  // Cache settings
  cache: {
    maxSize: CONSTANTS.CACHE.DEFAULT_MAX_SIZE,
    preloadDistance: CONSTANTS.CACHE.DEFAULT_PRELOAD_DISTANCE,
    optimizationThreshold: CONSTANTS.CACHE.DEFAULT_OPTIMIZATION_THRESHOLD
  },

  // Map settings
  map: {
    center: CONSTANTS.MAP.DEFAULT_CENTER,
    zoom: CONSTANTS.MAP.DEFAULT_ZOOM,
    minZoom: CONSTANTS.MAP.MIN_ZOOM,
    maxZoom: CONSTANTS.MAP.MAX_ZOOM,
    keyboardPanDelta: CONSTANTS.MAP.KEYBOARD_PAN_DELTA
  },

  // UI settings
  ui: {
    debounceDelay: CONSTANTS.UI.DEFAULT_DEBOUNCE_DELAY,
    loadingTimeout: CONSTANTS.UI.LOADING_TIMEOUT,
    errorDisplayTime: CONSTANTS.UI.ERROR_DISPLAY_TIME,
    focusDelay: CONSTANTS.UI.FOCUS_DELAY
  },

  // Performance settings
  performance: {
    coordinatePrecision: CONSTANTS.DATA.COORDINATE_PRECISION,
    preloadDelay: CONSTANTS.UI.PRELOAD_DELAY,
    preloadStagger: CONSTANTS.UI.PRELOAD_STAGGER
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