/**
 * Centralized error handling for the Historical World Map
 * Provides user-friendly error messages and consistent error management
 */

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
    }

    /**
     * Handle and categorize errors
     * @param {Error|string} error - Error object or message
     * @param {string} context - Context where error occurred
     * @param {Object} metadata - Additional error metadata
     * @returns {Object} Processed error information
     */
    handleError(error, context = 'unknown', metadata = {}) {
        const processedError = this.processError(error, context, metadata);
        this.logError(processedError);
        
        return {
            type: processedError.type,
            userMessage: processedError.userMessage,
            technicalMessage: processedError.technicalMessage,
            canRetry: processedError.canRetry,
            timestamp: processedError.timestamp
        };
    }

    /**
     * Process raw error into categorized error object
     * @param {Error|string} error - Raw error
     * @param {string} context - Error context
     * @param {Object} metadata - Additional metadata
     * @returns {Object} Processed error object
     */
    processError(error, context, metadata) {
        const timestamp = new Date().toISOString();
        let type, userMessage, technicalMessage, canRetry = true;

        // Handle different error types
        if (error instanceof Error) {
            technicalMessage = `${error.name}: ${error.message}`;
            
            // Network-related errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                type = CONSTANTS.ERRORS.TYPES.NETWORK_ERROR;
                userMessage = CONSTANTS.ERRORS.MESSAGES.NETWORK_ERROR;
            }
            // JSON parsing errors
            else if (error instanceof SyntaxError) {
                type = CONSTANTS.ERRORS.TYPES.INVALID_DATA;
                userMessage = CONSTANTS.ERRORS.MESSAGES.INVALID_DATA;
            }
            // Generic error
            else {
                type = 'UNKNOWN_ERROR';
                userMessage = CONSTANTS.ERRORS.MESSAGES.GENERIC;
            }
        } 
        // Handle HTTP response errors
        else if (typeof error === 'object' && error.status) {
            technicalMessage = `HTTP ${error.status}: ${error.statusText}`;
            
            if (error.status === 404) {
                type = CONSTANTS.ERRORS.TYPES.DATA_NOT_FOUND;
                userMessage = CONSTANTS.ERRORS.MESSAGES.DATA_NOT_FOUND;
            } else if (error.status >= 500) {
                type = CONSTANTS.ERRORS.TYPES.NETWORK_ERROR;
                userMessage = 'The server is temporarily unavailable. Please try again later.';
            } else {
                type = CONSTANTS.ERRORS.TYPES.NETWORK_ERROR;
                userMessage = CONSTANTS.ERRORS.MESSAGES.NETWORK_ERROR;
            }
        }
        // Handle string errors
        else if (typeof error === 'string') {
            technicalMessage = error;
            
            // Categorize based on content
            if (error.toLowerCase().includes('not found') || error.includes('404')) {
                type = CONSTANTS.ERRORS.TYPES.DATA_NOT_FOUND;
                userMessage = CONSTANTS.ERRORS.MESSAGES.DATA_NOT_FOUND;
            } else if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('corrupt')) {
                type = CONSTANTS.ERRORS.TYPES.INVALID_DATA;
                userMessage = CONSTANTS.ERRORS.MESSAGES.INVALID_DATA;
            } else {
                type = 'UNKNOWN_ERROR';
                userMessage = CONSTANTS.ERRORS.MESSAGES.GENERIC;
            }
        }
        // Unknown error type
        else {
            type = 'UNKNOWN_ERROR';
            technicalMessage = 'Unknown error occurred';
            userMessage = CONSTANTS.ERRORS.MESSAGES.GENERIC;
        }

        // Context-specific adjustments
        if (context === 'cache') {
            type = CONSTANTS.ERRORS.TYPES.CACHE_ERROR;
            userMessage = CONSTANTS.ERRORS.MESSAGES.CACHE_ERROR;
            canRetry = true;
        } else if (context === 'render' || context === 'map') {
            type = CONSTANTS.ERRORS.TYPES.RENDER_ERROR;
            userMessage = CONSTANTS.ERRORS.MESSAGES.RENDER_ERROR;
            canRetry = false;
        }

        return {
            type,
            userMessage,
            technicalMessage,
            canRetry,
            context,
            timestamp,
            metadata
        };
    }

    /**
     * Log error to internal log and console
     * @param {Object} processedError - Processed error object
     */
    logError(processedError) {
        // Add to internal log
        this.errorLog.unshift(processedError);
        
        // Trim log if too large
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }

        // Console logging
        const logPrefix = CONSTANTS.DEVELOPMENT.LOG_PREFIX;
        console.error(`${logPrefix} Error in ${processedError.context}:`, {
            type: processedError.type,
            message: processedError.technicalMessage,
            timestamp: processedError.timestamp,
            metadata: processedError.metadata
        });
    }

    /**
     * Get user-friendly error message for specific error type
     * @param {string} errorType - Error type constant
     * @param {string} fallback - Fallback message
     * @returns {string} User-friendly message
     */
    getUserMessage(errorType, fallback = null) {
        return CONSTANTS.ERRORS.MESSAGES[errorType] || fallback || CONSTANTS.ERRORS.MESSAGES.GENERIC;
    }

    /**
     * Check if error type allows retry
     * @param {string} errorType - Error type
     * @returns {boolean} Whether retry is recommended
     */
    canRetry(errorType) {
        const nonRetryableErrors = [
            CONSTANTS.ERRORS.TYPES.INVALID_DATA,
            CONSTANTS.ERRORS.TYPES.RENDER_ERROR
        ];
        return !nonRetryableErrors.includes(errorType);
    }

    /**
     * Create error context from period information
     * @param {Object} period - Period object
     * @returns {string} Error context string
     */
    createPeriodContext(period) {
        if (!period) return 'unknown period';
        return `period ${period.label} (${period.file})`;
    }

    /**
     * Get recent error history
     * @param {number} limit - Maximum number of errors to return
     * @returns {Array} Recent errors
     */
    getRecentErrors(limit = 10) {
        return this.errorLog.slice(0, limit);
    }

    /**
     * Clear error log
     */
    clearLog() {
        this.errorLog = [];
        console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Error log cleared`);
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            byContext: {},
            recent: this.errorLog.slice(0, 5)
        };

        this.errorLog.forEach(error => {
            // Count by type
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            
            // Count by context
            stats.byContext[error.context] = (stats.byContext[error.context] || 0) + 1;
        });

        return stats;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}

// Make available globally
window.ErrorHandler = ErrorHandler;