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
     * Simplify coordinates using Douglas-Peucker algorithm and precision rounding
     * Phase 2 optimization: Removes unnecessary points while preserving shape
     * @param {Array} coords - Coordinate array
     * @param {number} precision - Decimal places (default: 6)
     * @param {number} tolerance - Simplification tolerance (default: 0.0001)
     * @returns {Array} Simplified coordinates
     */
    static simplifyCoordinates(coords, precision = 6, tolerance = 0.0001) {
        if (typeof coords[0] === 'number') {
            // Base case: single coordinate pair [lon, lat]
            return coords.map(c =>
                Math.round(c * Math.pow(10, precision)) / Math.pow(10, precision)
            );
        }

        if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
            // Array of coordinate pairs - apply Douglas-Peucker then round
            const simplified = this.douglasPeucker(coords, tolerance);
            return simplified.map(coord => this.simplifyCoordinates(coord, precision));
        }

        // Nested arrays (Polygon, MultiPolygon, etc.) - recurse
        return coords.map(c => this.simplifyCoordinates(c, precision, tolerance));
    }

    /**
     * Douglas-Peucker algorithm for line simplification
     * Reduces number of points in a polyline while preserving shape
     * @param {Array} points - Array of [lon, lat] coordinates
     * @param {number} tolerance - Maximum distance from simplified line
     * @returns {Array} Simplified array of coordinates
     */
    static douglasPeucker(points, tolerance) {
        if (!points || points.length <= 2) {
            return points;
        }

        const end = points.length - 1;
        let maxDist = 0;
        let maxIndex = 0;

        // Find point with maximum distance from line
        for (let i = 1; i < end; i++) {
            const dist = this.perpendicularDistance(
                points[i],
                points[0],
                points[end]
            );
            if (dist > maxDist) {
                maxDist = dist;
                maxIndex = i;
            }
        }

        // If max distance is greater than tolerance, recursively simplify
        if (maxDist > tolerance) {
            // Recursively simplify both segments
            const left = this.douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
            const right = this.douglasPeucker(points.slice(maxIndex), tolerance);

            // Combine results (remove duplicate middle point)
            return [...left.slice(0, -1), ...right];
        }

        // All points are within tolerance, return only endpoints
        return [points[0], points[end]];
    }

    /**
     * Calculate perpendicular distance from point to line segment
     * @param {Array} point - [lon, lat] coordinate
     * @param {Array} lineStart - [lon, lat] start of line
     * @param {Array} lineEnd - [lon, lat] end of line
     * @returns {number} Perpendicular distance
     */
    static perpendicularDistance(point, lineStart, lineEnd) {
        const [x, y] = point;
        const [x1, y1] = lineStart;
        const [x2, y2] = lineEnd;

        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;

        // Find closest point on line segment
        let param = -1;
        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;

        return Math.sqrt(dx * dx + dy * dy);
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