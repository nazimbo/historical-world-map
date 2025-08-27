/**
 * Utility functions for the Historical World Map application
 * Common helper functions used across multiple modules
 */

class Utils {
    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
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

    /**
     * Get territory name from feature properties with fallbacks
     * @param {Object} properties - Feature properties object
     * @returns {string} Territory name
     */
    static getTerritoryName(properties) {
        if (!properties) return 'Unknown Territory';
        return properties.NAME || properties.name || properties.NAME_EN || 'Unknown Territory';
    }

    /**
     * Format property key for display
     * @param {string} key - Property key
     * @returns {string} Formatted display key
     */
    static formatPropertyKey(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Check if feature has valid data
     * @param {Object} feature - GeoJSON feature
     * @returns {boolean} Whether feature has valid data
     */
    static hasValidFeatureData(feature) {
        const props = feature.properties;
        if (!props) return false;
        
        const name = this.getTerritoryName(props);
        if (!name || name.trim() === '' || name === 'Unknown Territory') return false;
        
        const keyFields = Object.keys(props).filter(key => 
            key !== 'NAME' && key !== 'name' && key !== 'NAME_EN' && props[key] !== null
        );
        
        return keyFields.length > 0;
    }

    /**
     * Simplify coordinates to specified precision
     * @param {Array} coords - Coordinate array
     * @param {number} precision - Decimal places
     * @returns {Array} Simplified coordinates
     */
    static simplifyCoordinates(coords, precision) {
        if (typeof coords[0] === 'number') {
            return coords.map(c => 
                Math.round(c * Math.pow(10, precision)) / Math.pow(10, precision)
            );
        }
        return coords.map(c => this.simplifyCoordinates(c, precision));
    }

    /**
     * Format file size in human readable format
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Generate cache key for period
     * @param {Object} period - Period object
     * @returns {string} Cache key
     */
    static getCacheKey(period) {
        return period.file;
    }

    /**
     * Check if running in development environment
     * @returns {boolean} Whether in development mode
     */
    static isDevelopment() {
        return window.location.href.includes('localhost') || 
               window.location.href.includes('127.0.0.1') ||
               window.location.href.includes('file://');
    }

    /**
     * Safely access nested object properties
     * @param {Object} obj - Object to access
     * @param {string} path - Dot-notation path (e.g., 'cache.maxSize')
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} Property value or default
     */
    static getNestedProperty(obj, path, defaultValue = null) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : defaultValue;
        }, obj);
    }

    /**
     * Create safe element ID from string
     * @param {string} str - Input string
     * @returns {string} Safe element ID
     */
    static createSafeId(str) {
        return str.toLowerCase()
                  .replace(/[^a-z0-9]/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');
    }

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Make available globally
window.Utils = Utils;