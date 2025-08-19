/**
 * Configuration settings for Historical World Map
 * Modify these values to customize the application behavior
 */

const CONFIG = {
  // Cache settings
  cache: {
    maxSize: 15,              // Maximum number of periods to cache
    preloadDistance: 2,       // Number of adjacent periods to preload
    optimizationThreshold: 500000  // File size threshold for optimization (bytes)
  },

  // Map settings
  map: {
    center: [20, 0],          // Default map center [lat, lng]
    zoom: 2,                  // Default zoom level
    minZoom: 1,               // Minimum zoom level
    maxZoom: 8,               // Maximum zoom level
    keyboardPanDelta: 80      // Keyboard pan distance
  },

  // UI settings
  ui: {
    debounceDelay: 300,       // Debounce delay for slider (ms)
    loadingTimeout: 10000,    // Loading timeout (ms)
    errorDisplayTime: 10000,  // Error notification display time (ms)
    focusDelay: 100          // Focus delay for accessibility (ms)
  },

  // Performance settings
  performance: {
    coordinatePrecision: 6,   // Decimal places for coordinate precision
    preloadDelay: 1000,      // Initial preload delay (ms)
    preloadStagger: 100      // Stagger between preloads (ms)
  },

  // Development settings
  development: {
    showCacheMonitor: true,   // Show cache monitor in dev mode
    enableLogging: true,      // Enable console logging
    logCacheStats: true      // Log cache statistics
  },

  // Accessibility settings
  accessibility: {
    enableKeyboardNav: true,  // Enable keyboard navigation
    enableScreenReader: true, // Enable screen reader support
    enableFocusManagement: true // Enable focus management
  }
};

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Make available globally
window.CONFIG = CONFIG;