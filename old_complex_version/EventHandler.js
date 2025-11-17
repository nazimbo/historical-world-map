/**
 * EventHandler - Decoupled event handling using EventBus pattern
 * No longer directly couples MapRenderer and UIController
 */
class EventHandler {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
    }

    /**
     * Set up all event listeners using the EventBus
     * This replaces direct coupling with loose coupling through events
     */
    setupEventListeners() {
        // Subscribe to map interaction events
        this.eventBus.on(this.eventBus.EVENTS.TERRITORY_CLICKED, (event) => {
            this.handleTerritoryClick(event.data);
        });

        this.eventBus.on(this.eventBus.EVENTS.TERRITORY_HOVERED, (event) => {
            this.handleTerritoryMouseOver(event.data);
        });

        this.eventBus.on(this.eventBus.EVENTS.TERRITORY_UNHOVERED, (event) => {
            this.handleTerritoryMouseOut(event.data);
        });

        // Subscribe to UI events
        this.eventBus.on(this.eventBus.EVENTS.INFO_PANEL_CLOSED, (event) => {
            this.handleInfoPanelClose();
        });

        this.eventBus.on(this.eventBus.EVENTS.PERIOD_CHANGED, (event) => {
            this.handlePeriodNavigation(event.data);
        });
    }

    /**
     * Handle territory click by emitting appropriate events
     * @param {Object} data - Contains feature and layer
     */
    handleTerritoryClick(data) {
        const { feature, layer } = data;
        
        // Emit events instead of direct method calls
        this.eventBus.emit(this.eventBus.EVENTS.MAP_SELECTION_CLEARED);
        this.eventBus.emit(this.eventBus.EVENTS.TERRITORY_CLICKED, { feature, layer });
    }

    /**
     * Handle territory mouse over
     * @param {Object} data - Contains layer
     */
    handleTerritoryMouseOver(data) {
        const { layer } = data;
        // Emit hover event to be handled by MapRenderer
        this.eventBus.emit(this.eventBus.EVENTS.TERRITORY_HOVERED, { layer });
    }

    /**
     * Handle territory mouse out
     * @param {Object} data - Contains layer
     */
    handleTerritoryMouseOut(data) {
        const { layer } = data;
        // Emit unhover event to be handled by MapRenderer
        this.eventBus.emit(this.eventBus.EVENTS.TERRITORY_UNHOVERED, { layer });
    }

    /**
     * Handle info panel close
     */
    handleInfoPanelClose() {
        this.eventBus.emit(this.eventBus.EVENTS.INFO_PANEL_CLOSED);
        this.eventBus.emit(this.eventBus.EVENTS.MAP_SELECTION_CLEARED);
    }

    /**
     * Handle period navigation
     * @param {Object} data - Contains periodIndex
     */
    handlePeriodNavigation(data) {
        const { periodIndex } = data;
        // Navigation is now handled through events
        this.eventBus.emit(this.eventBus.EVENTS.PERIOD_CHANGED, { periodIndex });
    }

    /**
     * Get map event handlers that emit events instead of direct calls
     * This maintains compatibility with MapRenderer while using EventBus
     */
    getMapEventHandlers() {
        return {
            onClick: (feature, layer) => {
                this.eventBus.emit(this.eventBus.EVENTS.TERRITORY_CLICKED, { feature, layer });
            },
            onMouseOver: (layer) => {
                this.eventBus.emit(this.eventBus.EVENTS.TERRITORY_HOVERED, { layer });
            },
            onMouseOut: (layer) => {
                this.eventBus.emit(this.eventBus.EVENTS.TERRITORY_UNHOVERED, { layer });
            }
        };
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        // EventBus handles cleanup automatically, but we can be explicit
        this.eventBus.off(this.eventBus.EVENTS.TERRITORY_CLICKED, this.handleTerritoryClick);
        this.eventBus.off(this.eventBus.EVENTS.TERRITORY_HOVERED, this.handleTerritoryMouseOver);
        this.eventBus.off(this.eventBus.EVENTS.TERRITORY_UNHOVERED, this.handleTerritoryMouseOut);
        this.eventBus.off(this.eventBus.EVENTS.INFO_PANEL_CLOSED, this.handleInfoPanelClose);
        this.eventBus.off(this.eventBus.EVENTS.PERIOD_CHANGED, this.handlePeriodNavigation);
    }
}