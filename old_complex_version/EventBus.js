/**
 * EventBus - Centralized event management system
 * Implements Observer/Publisher-Subscriber pattern to decouple components
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Set();
        this.maxListeners = 10; // Prevent memory leaks
        this.debugMode = false;
        
        // Event types registry for better debugging
        this.eventTypes = {
            // Territory events
            TERRITORY_CLICKED: 'territory:clicked',
            TERRITORY_HOVERED: 'territory:hovered',
            TERRITORY_UNHOVERED: 'territory:unhovered',
            
            // Period navigation events
            PERIOD_CHANGED: 'period:changed',
            PERIOD_LOADING: 'period:loading',
            PERIOD_LOADED: 'period:loaded',
            PERIOD_LOAD_ERROR: 'period:loadError',
            
            // Map events
            MAP_UPDATED: 'map:updated',
            MAP_SELECTION_CLEARED: 'map:selectionCleared',
            
            // UI events
            INFO_PANEL_OPENED: 'ui:infoPanelOpened',
            INFO_PANEL_CLOSED: 'ui:infoPanelClosed',
            LOADING_SHOWN: 'ui:loadingShown',
            LOADING_HIDDEN: 'ui:loadingHidden',
            
            // Data events
            CACHE_UPDATED: 'cache:updated',
            DATA_PRELOADED: 'data:preloaded',
            
            // Error events
            ERROR_OCCURRED: 'error:occurred',
            ERROR_CLEARED: 'error:cleared'
        };
        
        // Make event types easily accessible
        this.EVENTS = this.eventTypes;
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {Object} options - Options (once: boolean, priority: number)
     * @returns {Function} Unsubscribe function
     */
    on(event, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error(`EventBus: Callback must be a function for event "${event}"`);
        }

        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        const listeners = this.events.get(event);
        
        // Check max listeners limit
        if (listeners.length >= this.maxListeners) {
            console.warn(`EventBus: Maximum listeners (${this.maxListeners}) exceeded for event "${event}"`);
        }

        const listener = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            id: `${event}_${Date.now()}_${Math.random()}`
        };

        // Handle once events
        if (options.once) {
            this.onceEvents.add(listener.id);
        }

        // Insert listener based on priority (higher priority first)
        const insertIndex = listeners.findIndex(l => l.priority < listener.priority);
        if (insertIndex === -1) {
            listeners.push(listener);
        } else {
            listeners.splice(insertIndex, 0, listener);
        }

        if (this.debugMode) {
            console.log(`EventBus: Subscribed to "${event}" (priority: ${listener.priority})`);
        }

        // Return unsubscribe function
        return () => this.off(event, listener.id);
    }

    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    once(event, callback) {
        return this.on(event, callback, { once: true });
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {string|Function} callbackOrId - Callback function or listener ID
     */
    off(event, callbackOrId) {
        if (!this.events.has(event)) {
            return;
        }

        const listeners = this.events.get(event);
        let removedCount = 0;

        if (typeof callbackOrId === 'string') {
            // Remove by listener ID
            const index = listeners.findIndex(l => l.id === callbackOrId);
            if (index !== -1) {
                listeners.splice(index, 1);
                this.onceEvents.delete(callbackOrId);
                removedCount = 1;
            }
        } else if (typeof callbackOrId === 'function') {
            // Remove by callback function
            for (let i = listeners.length - 1; i >= 0; i--) {
                if (listeners[i].callback === callbackOrId) {
                    const listener = listeners.splice(i, 1)[0];
                    this.onceEvents.delete(listener.id);
                    removedCount++;
                }
            }
        }

        // Clean up empty event arrays
        if (listeners.length === 0) {
            this.events.delete(event);
        }

        if (this.debugMode && removedCount > 0) {
            console.log(`EventBus: Unsubscribed ${removedCount} listener(s) from "${event}"`);
        }
    }

    /**
     * Publish an event to all subscribers
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @param {Object} options - Options (async: boolean)
     */
    emit(event, data = null, options = {}) {
        if (!this.events.has(event)) {
            if (this.debugMode) {
                console.log(`EventBus: No listeners for event "${event}"`);
            }
            return;
        }

        const listeners = [...this.events.get(event)]; // Copy to avoid modification during iteration
        const eventData = {
            type: event,
            data,
            timestamp: Date.now(),
            preventDefault: false,
            stopPropagation: false
        };

        if (this.debugMode) {
            console.log(`EventBus: Emitting "${event}" to ${listeners.length} listener(s)`, data);
        }

        if (options.async) {
            // Execute callbacks asynchronously
            setTimeout(() => this.executeCallbacks(listeners, eventData, event), 0);
        } else {
            // Execute callbacks synchronously
            this.executeCallbacks(listeners, eventData, event);
        }
    }

    /**
     * Execute callbacks for an event
     * @param {Array} listeners - Array of listeners
     * @param {Object} eventData - Event data object
     * @param {string} event - Event name
     * @private
     */
    executeCallbacks(listeners, eventData, event) {
        const listenersToRemove = [];

        for (const listener of listeners) {
            if (eventData.stopPropagation) {
                break;
            }

            try {
                // Add control methods to event data
                const controlledEventData = {
                    ...eventData,
                    preventDefault: () => { eventData.preventDefault = true; },
                    stopPropagation: () => { eventData.stopPropagation = true; }
                };

                listener.callback(controlledEventData);

                // Mark once listeners for removal
                if (listener.once) {
                    listenersToRemove.push(listener.id);
                }
            } catch (error) {
                console.error(`EventBus: Error in listener for "${event}":`, error);
                // Continue executing other listeners even if one fails
            }
        }

        // Remove once listeners
        listenersToRemove.forEach(id => this.off(event, id));
    }

    /**
     * Remove all listeners for an event or all events
     * @param {string} event - Optional event name. If not provided, clears all events
     */
    clear(event = null) {
        if (event) {
            this.events.delete(event);
            // Clean up once events
            this.onceEvents.forEach(id => {
                if (id.startsWith(event + '_')) {
                    this.onceEvents.delete(id);
                }
            });
            
            if (this.debugMode) {
                console.log(`EventBus: Cleared all listeners for "${event}"`);
            }
        } else {
            this.events.clear();
            this.onceEvents.clear();
            
            if (this.debugMode) {
                console.log('EventBus: Cleared all events and listeners');
            }
        }
    }

    /**
     * Get list of all registered events
     * @returns {Array} Array of event names
     */
    getEvents() {
        return Array.from(this.events.keys());
    }

    /**
     * Get listener count for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    getListenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }

    /**
     * Check if event has any listeners
     * @param {string} event - Event name
     * @returns {boolean} Whether event has listeners
     */
    hasListeners(event) {
        return this.getListenerCount(event) > 0;
    }

    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = !!enabled;
        if (enabled) {
            console.log('EventBus: Debug mode enabled');
        }
    }

    /**
     * Set maximum number of listeners per event
     * @param {number} max - Maximum number of listeners
     */
    setMaxListeners(max) {
        if (typeof max !== 'number' || max < 1) {
            throw new Error('EventBus: Max listeners must be a positive number');
        }
        this.maxListeners = max;
    }

    /**
     * Get debug information about the event bus
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        const events = {};
        this.events.forEach((listeners, event) => {
            events[event] = {
                listenerCount: listeners.length,
                listeners: listeners.map(l => ({
                    priority: l.priority,
                    once: l.once,
                    id: l.id
                }))
            };
        });

        return {
            totalEvents: this.events.size,
            totalListeners: Array.from(this.events.values()).reduce((sum, listeners) => sum + listeners.length, 0),
            maxListeners: this.maxListeners,
            debugMode: this.debugMode,
            events
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBus;
}

// Make available globally
window.EventBus = EventBus;