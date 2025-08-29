/**
 * Validation utilities for the Historical World Map
 * Comprehensive data validation and error handling
 */

class Validators {
    /**
     * Validate GeoJSON data structure
     * @param {Object} data - GeoJSON data to validate
     * @param {string} filename - Filename for error context
     * @returns {Object} Validation result with success and error details
     */
    static validateGeoJSON(data, filename = 'unknown') {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Check if data exists
        if (!data) {
            result.isValid = false;
            result.errors.push('Data is null or undefined');
            return result;
        }

        // Check required GeoJSON properties
        const requiredProps = CONSTANTS.DATA.GEOJSON_REQUIRED_PROPS;
        for (const prop of requiredProps) {
            if (!data.hasOwnProperty(prop)) {
                result.isValid = false;
                result.errors.push(`Missing required property: ${prop}`);
            }
        }

        // Validate GeoJSON type
        if (data.type && data.type !== 'FeatureCollection') {
            result.warnings.push(`Expected type 'FeatureCollection', got '${data.type}'`);
        }

        // Validate features array
        if (data.features) {
            if (!Array.isArray(data.features)) {
                result.isValid = false;
                result.errors.push('Features must be an array');
            } else {
                // Validate individual features
                data.features.forEach((feature, index) => {
                    const featureValidation = this.validateFeature(feature, index);
                    if (!featureValidation.isValid) {
                        result.errors.push(...featureValidation.errors);
                    }
                    result.warnings.push(...featureValidation.warnings);
                });

                // Check if we have any valid features
                if (data.features.length === 0) {
                    result.warnings.push('No features found in GeoJSON data');
                }
            }
        }

        return result;
    }

    /**
     * Validate individual GeoJSON feature
     * @param {Object} feature - GeoJSON feature to validate
     * @param {number} index - Feature index for error context
     * @returns {Object} Validation result
     */
    static validateFeature(feature, index = 0) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!feature) {
            result.isValid = false;
            result.errors.push(`Feature ${index}: Feature is null or undefined`);
            return result;
        }

        // Check feature type
        if (!feature.type || feature.type !== 'Feature') {
            result.isValid = false;
            result.errors.push(`Feature ${index}: Invalid or missing type property`);
        }

        // Check geometry
        if (!feature.geometry) {
            result.isValid = false;
            result.errors.push(`Feature ${index}: Missing geometry`);
        } else {
            const geometryValidation = this.validateGeometry(feature.geometry, index);
            if (!geometryValidation.isValid) {
                result.errors.push(...geometryValidation.errors);
            }
            result.warnings.push(...geometryValidation.warnings);
        }

        // Check properties
        if (!feature.properties) {
            result.warnings.push(`Feature ${index}: Missing properties object`);
        } else {
            // Check if properties has meaningful data
            const meaningfulProps = Object.keys(feature.properties).filter(key => 
                feature.properties[key] !== null && feature.properties[key] !== ''
            );
            
            if (meaningfulProps.length === 0) {
                result.warnings.push(`Feature ${index}: No meaningful properties found`);
            }
        }

        return result;
    }

    /**
     * Validate GeoJSON geometry
     * @param {Object} geometry - Geometry object to validate
     * @param {number} featureIndex - Feature index for error context
     * @returns {Object} Validation result
     */
    static validateGeometry(geometry, featureIndex = 0) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!geometry.type) {
            result.isValid = false;
            result.errors.push(`Feature ${featureIndex}: Geometry missing type`);
            return result;
        }

        if (!geometry.coordinates) {
            result.isValid = false;
            result.errors.push(`Feature ${featureIndex}: Geometry missing coordinates`);
            return result;
        }

        // Validate coordinates based on geometry type
        const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
        if (!validTypes.includes(geometry.type)) {
            result.isValid = false;
            result.errors.push(`Feature ${featureIndex}: Invalid geometry type '${geometry.type}'`);
        }

        // Basic coordinate validation
        if (!Array.isArray(geometry.coordinates)) {
            result.isValid = false;
            result.errors.push(`Feature ${featureIndex}: Coordinates must be an array`);
        }

        return result;
    }

    /**
     * Validate period object
     * @param {Object} period - Period object to validate
     * @returns {Object} Validation result
     */
    static validatePeriod(period) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!period) {
            result.isValid = false;
            result.errors.push('Period is null or undefined');
            return result;
        }

        // Check required properties
        const requiredProps = ['year', 'file', 'label'];
        for (const prop of requiredProps) {
            if (!period.hasOwnProperty(prop)) {
                result.isValid = false;
                result.errors.push(`Period missing required property: ${prop}`);
            }
        }

        // Validate year
        if (typeof period.year !== 'number') {
            result.isValid = false;
            result.errors.push('Period year must be a number');
        }

        // Validate file
        if (typeof period.file !== 'string' || !period.file.endsWith('.geojson')) {
            result.isValid = false;
            result.errors.push('Period file must be a string ending with .geojson');
        }

        // Validate label
        if (typeof period.label !== 'string' || period.label.trim() === '') {
            result.isValid = false;
            result.errors.push('Period label must be a non-empty string');
        }

        return result;
    }

    /**
     * Validate configuration object
     * @param {Object} config - Configuration object to validate
     * @returns {Object} Validation result
     */
    static validateConfiguration(config) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!config) {
            result.isValid = false;
            result.errors.push('Configuration is null or undefined');
            return result;
        }

        // Validate cache settings
        if (config.cache) {
            if (config.cache.maxSize && (typeof config.cache.maxSize !== 'number' || config.cache.maxSize < 1)) {
                result.warnings.push('Cache maxSize should be a positive number');
            }
            
            if (config.cache.preloadDistance && (typeof config.cache.preloadDistance !== 'number' || config.cache.preloadDistance < 0)) {
                result.warnings.push('Cache preloadDistance should be a non-negative number');
            }
        }

        // Validate map settings
        if (config.map) {
            if (config.map.center && (!Array.isArray(config.map.center) || config.map.center.length !== 2)) {
                result.warnings.push('Map center should be an array of two numbers [lat, lng]');
            }
            
            if (config.map.zoom && (typeof config.map.zoom !== 'number' || config.map.zoom < 0)) {
                result.warnings.push('Map zoom should be a non-negative number');
            }
        }

        return result;
    }

    /**
     * Validate HTTP response
     * @param {Response} response - Fetch API response object
     * @param {string} context - Context for error messages
     * @returns {Object} Validation result
     */
    static validateResponse(response, context = 'request') {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!response) {
            result.isValid = false;
            result.errors.push(`${context}: Response is null or undefined`);
            return result;
        }

        if (!response.ok) {
            result.isValid = false;
            if (response.status === 404) {
                result.errors.push(`${context}: Resource not found (404)`);
            } else if (response.status >= 500) {
                result.errors.push(`${context}: Server error (${response.status})`);
            } else if (response.status >= 400) {
                result.errors.push(`${context}: Client error (${response.status})`);
            } else {
                result.errors.push(`${context}: Request failed (${response.status})`);
            }
        }

        return result;
    }

    /**
     * Sanitize user input string
     * @param {string} input - Input string to sanitize
     * @param {number} maxLength - Maximum allowed length
     * @returns {string} Sanitized string
     */
    static sanitizeInput(input, maxLength = 1000) {
        if (typeof input !== 'string') {
            return '';
        }

        return input
            .substring(0, maxLength)
            .replace(/[&<>"']/g, (match) => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            }[match]))
            .trim();
    }

    /**
     * Validate element exists in DOM
     * @param {string} selector - CSS selector
     * @returns {boolean} Whether element exists
     */
    static validateElement(selector) {
        return document.querySelector(selector) !== null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validators;
}

// Make available globally
window.Validators = Validators;