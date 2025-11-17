/**
 * Constants and configuration values for the Historical World Map
 * Centralized location for all magic numbers and configuration
 */

const CONSTANTS = {
    // Cache configuration
    CACHE: {
        DEFAULT_MAX_SIZE: 25, // Increased from 15 for better cache hit rate (48% coverage of 52 periods)
        DEFAULT_PRELOAD_DISTANCE: 2,
        DEFAULT_OPTIMIZATION_THRESHOLD: 500000, // 500KB
        LRU_EVICTION: true
    },

    // Map configuration
    MAP: {
        DEFAULT_CENTER: [20, 0],
        DEFAULT_ZOOM: 2,
        MIN_ZOOM: 1,
        MAX_ZOOM: 8,
        KEYBOARD_PAN_DELTA: 80,
        WORLD_BOUNDS: {
            SOUTH_WEST: [-85, -180],
            NORTH_EAST: [85, 180]
        }
    },

    // UI timing and behavior
    UI: {
        DEFAULT_PERIOD_INDEX: 8, // Default to 1000 BC (index 8 in periods array)
        DEFAULT_DEBOUNCE_DELAY: 300,
        LOADING_TIMEOUT: 10000,
        ERROR_DISPLAY_TIME: 10000,
        FOCUS_DELAY: 100,
        PRELOAD_DELAY: 1000,
        PRELOAD_STAGGER: 100
    },

    // Data processing
    DATA: {
        COORDINATE_PRECISION: 6,
        MIN_VALID_PROPERTIES: 1,
        GEOJSON_REQUIRED_PROPS: ['type', 'features']
    },

    // Territory styling
    TERRITORY: {
        DEFAULT_FILL_COLOR: '#3498db',
        INACTIVE_FILL_COLOR: '#95a5a6',
        SELECTED_FILL_COLOR: 'rgba(255, 215, 0, 0.8)',
        DEFAULT_WEIGHT: 1.5,
        HOVER_WEIGHT: 3,
        SELECTED_WEIGHT: 4,
        DEFAULT_OPACITY: 0.9,
        ACTIVE_FILL_OPACITY: 0.7,
        INACTIVE_FILL_OPACITY: 0.4,
        HOVER_DASH_ARRAY: '5, 5'
    },

    // Error types and messages
    ERRORS: {
        TYPES: {
            NETWORK_ERROR: 'NETWORK_ERROR',
            DATA_NOT_FOUND: 'DATA_NOT_FOUND',
            INVALID_DATA: 'INVALID_DATA',
            CACHE_ERROR: 'CACHE_ERROR',
            RENDER_ERROR: 'RENDER_ERROR'
        },
        MESSAGES: {
            NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
            DATA_NOT_FOUND: 'Historical data for this period is not available.',
            INVALID_DATA: 'The historical data appears to be corrupted.',
            CACHE_ERROR: 'There was a problem with data storage.',
            RENDER_ERROR: 'Unable to display the map. Please refresh and try again.',
            GENERIC: 'An unexpected error occurred. Please try again.'
        }
    },

    // Keyboard codes
    KEYS: {
        ESCAPE: 'Escape',
        ARROW_LEFT: 'ArrowLeft',
        ARROW_RIGHT: 'ArrowRight',
        ENTER: 'Enter',
        SPACE: ' '
    },

    // Element selectors (centralized to avoid magic strings)
    SELECTORS: {
        MAP: '#map',
        TIME_SLIDER: '#time-slider',
        CURRENT_PERIOD: '#current-period',
        INFO_PANEL: '#info-panel',
        TERRITORY_NAME: '#territory-name',
        TERRITORY_DETAILS: '#territory-details',
        CLOSE_INFO: '#close-info',
        LOADING: '#loading',
        CACHE_SIZE: '#cache-size',
        CACHE_HIT_RATE: '#cache-hit-rate'
    },

    // CSS classes
    CLASSES: {
        HIDDEN: 'hidden',
        TERRITORY_FEATURE: 'territory-feature',
        TERRITORY_HOVER: 'territory-hover',
        TERRITORY_SELECTED: 'territory-selected',
        ERROR_NOTIFICATION: 'error-notification',
        CACHE_MONITOR: 'cache-monitor',
        BACKDROP_BLUR_10: 'backdrop-blur-10',
        BACKDROP_BLUR_15: 'backdrop-blur-15',
        BACKDROP_BLUR_20: 'backdrop-blur-20'
    },

    // Tile layer configuration
    TILES: {
        CARTO_LIGHT: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
        ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        SUBDOMAINS: 'abcd'
    },

    // Accessibility
    ACCESSIBILITY: {
        ROLES: {
            BUTTON: 'button',
            DIALOG: 'dialog'
        },
        ARIA: {
            LABEL: 'aria-label',
            VALUE_TEXT: 'aria-valuetext',
            LIVE: 'aria-live'
        },
        LIVE_REGIONS: {
            POLITE: 'polite',
            ASSERTIVE: 'assertive'
        }
    },

    // Development
    DEVELOPMENT: {
        CACHE_MONITOR_ID: 'cache-monitor',
        LOG_PREFIX: '[HistoricalMap]'
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSTANTS;
}

// Make available globally
window.CONSTANTS = CONSTANTS;