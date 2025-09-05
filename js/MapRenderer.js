class MapRenderer {
    constructor(configService, eventBus) {
        this.configService = configService || ConfigurationService.fromGlobalConfig();
        this.eventBus = eventBus || new EventBus();
        
        this.map = null;
        this.currentLayer = null;
        this.selectedFeature = null;
        this.selectedLayer = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for map update events
        this.eventBus.on(this.eventBus.EVENTS.MAP_UPDATED, (event) => {
            const { data } = event.data;
            this.updateMapFromEvent(data);
        });
        
        // Listen for selection events
        this.eventBus.on(this.eventBus.EVENTS.MAP_SELECTION_CLEARED, () => {
            this.clearSelection();
        });
        
        // Listen for territory interaction events
        this.eventBus.on(this.eventBus.EVENTS.TERRITORY_HOVERED, (event) => {
            const { layer } = event.data;
            this.highlightFeature(layer);
        });
        
        this.eventBus.on(this.eventBus.EVENTS.TERRITORY_UNHOVERED, (event) => {
            const { layer } = event.data;
            this.resetHighlight(layer);
        });
        
        this.eventBus.on(this.eventBus.EVENTS.TERRITORY_CLICKED, (event) => {
            const { feature, layer } = event.data;
            this.clearSelection();
            this.setSelectedFeature(feature);
            this.selectFeature(layer);
        });
    }

    initMap() {
        const worldBounds = L.latLngBounds(
            L.latLng(...CONSTANTS.MAP.WORLD_BOUNDS.SOUTH_WEST),
            L.latLng(...CONSTANTS.MAP.WORLD_BOUNDS.NORTH_EAST)
        );

        this.map = L.map(CONSTANTS.SELECTORS.MAP.replace('#', ''), {
            center: this.configService.get('map.center', CONSTANTS.MAP.DEFAULT_CENTER),
            zoom: this.configService.get('map.zoom', CONSTANTS.MAP.DEFAULT_ZOOM),
            minZoom: this.configService.get('map.minZoom', CONSTANTS.MAP.MIN_ZOOM),
            maxZoom: this.configService.get('map.maxZoom', CONSTANTS.MAP.MAX_ZOOM),
            worldCopyJump: false,
            maxBounds: worldBounds,
            maxBoundsViscosity: 1.0,
            keyboard: true,
            keyboardPanDelta: this.configService.get('map.keyboardPanDelta', CONSTANTS.MAP.KEYBOARD_PAN_DELTA)
        });

        L.tileLayer(CONSTANTS.TILES.CARTO_LIGHT, {
            attribution: CONSTANTS.TILES.ATTRIBUTION,
            subdomains: CONSTANTS.TILES.SUBDOMAINS,
            maxZoom: this.configService.get('map.maxZoom', CONSTANTS.MAP.MAX_ZOOM)
        }).addTo(this.map);

        L.control.scale({
            position: 'bottomleft'
        }).addTo(this.map);

        return this.map;
    }

    updateMap(geoJsonData, eventHandlers = {}) {
        this.clearSelection();
        
        if (this.currentLayer) {
            this.map.removeLayer(this.currentLayer);
        }

        this.currentLayer = L.geoJSON(geoJsonData, {
            style: (feature) => this.getFeatureStyle(feature),
            onEachFeature: (feature, layer) => {
                if (eventHandlers.onClick) {
                    layer.on('click', (e) => {
                        eventHandlers.onClick(feature, layer);
                        L.DomEvent.stopPropagation(e);
                    });
                }

                if (eventHandlers.onMouseOver) {
                    layer.on('mouseover', (e) => {
                        if (this.selectedLayer !== e.target) {
                            eventHandlers.onMouseOver(e.target);
                        }
                    });
                }

                if (eventHandlers.onMouseOut) {
                    layer.on('mouseout', (e) => {
                        if (this.selectedLayer !== e.target) {
                            eventHandlers.onMouseOut(e.target);
                        }
                    });
                }

                this.setAccessibilityAttributes(layer, feature);
            }
        });

        this.currentLayer.addTo(this.map);
    }
    
    /**
     * Update map from event data (used by EventBus)
     */
    updateMapFromEvent(geoJsonData) {
        // Get event handlers from EventHandler (maintains compatibility)
        const eventHandlers = {
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
        
        this.updateMap(geoJsonData, eventHandlers);
    }

    setAccessibilityAttributes(layer, feature) {
        const element = layer.getElement();
        if (element) {
            element.setAttribute('tabindex', '0');
            element.setAttribute('role', CONSTANTS.ACCESSIBILITY.ROLES.BUTTON);
            element.setAttribute(CONSTANTS.ACCESSIBILITY.ARIA.LABEL, 
                `Territory: ${Utils.getTerritoryName(feature.properties)}`);
        }
    }

    getFeatureStyle(feature) {
        const hasData = Utils.hasValidFeatureData(feature);
        
        return {
            fillColor: hasData ? CONSTANTS.TERRITORY.DEFAULT_FILL_COLOR : CONSTANTS.TERRITORY.INACTIVE_FILL_COLOR,
            weight: CONSTANTS.TERRITORY.DEFAULT_WEIGHT,
            opacity: CONSTANTS.TERRITORY.DEFAULT_OPACITY,
            color: 'rgba(255, 255, 255, 0.8)',
            fillOpacity: hasData ? CONSTANTS.TERRITORY.ACTIVE_FILL_OPACITY : CONSTANTS.TERRITORY.INACTIVE_FILL_OPACITY,
            dashArray: null,
            className: CONSTANTS.CLASSES.TERRITORY_FEATURE
        };
    }

    highlightFeature(layer) {
        layer.setStyle({
            weight: CONSTANTS.TERRITORY.HOVER_WEIGHT,
            color: 'rgba(255, 255, 255, 1)',
            fillOpacity: CONSTANTS.TERRITORY.ACTIVE_FILL_OPACITY + 0.2,
            dashArray: CONSTANTS.TERRITORY.HOVER_DASH_ARRAY,
            className: `${CONSTANTS.CLASSES.TERRITORY_FEATURE} ${CONSTANTS.CLASSES.TERRITORY_HOVER}`
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    selectFeature(layer) {
        this.selectedLayer = layer;
        layer.setStyle({
            weight: CONSTANTS.TERRITORY.SELECTED_WEIGHT,
            color: 'rgba(255, 255, 255, 1)',
            fillColor: CONSTANTS.TERRITORY.SELECTED_FILL_COLOR,
            fillOpacity: CONSTANTS.TERRITORY.ACTIVE_FILL_OPACITY + 0.2,
            dashArray: null,
            className: `${CONSTANTS.CLASSES.TERRITORY_FEATURE} ${CONSTANTS.CLASSES.TERRITORY_SELECTED}`
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    clearSelection() {
        if (this.selectedLayer && this.currentLayer) {
            this.currentLayer.resetStyle(this.selectedLayer);
        }
        this.selectedFeature = null;
        this.selectedLayer = null;
    }

    resetHighlight(layer) {
        if (this.selectedLayer && this.selectedLayer === layer) {
            return;
        }
        
        if (this.currentLayer) {
            this.currentLayer.resetStyle(layer);
        }
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    getMap() {
        return this.map;
    }

    getCurrentLayer() {
        return this.currentLayer;
    }

    getSelectedFeature() {
        return this.selectedFeature;
    }

    setSelectedFeature(feature) {
        this.selectedFeature = feature;
    }
}