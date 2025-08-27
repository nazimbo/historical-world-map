class MapRenderer {
    constructor() {
        this.map = null;
        this.currentLayer = null;
        this.selectedFeature = null;
        this.selectedLayer = null;
    }

    initMap() {
        const worldBounds = L.latLngBounds(
            L.latLng(...CONSTANTS.MAP.WORLD_BOUNDS.SOUTH_WEST),
            L.latLng(...CONSTANTS.MAP.WORLD_BOUNDS.NORTH_EAST)
        );

        const mapConfig = Utils.getNestedProperty(window.CONFIG, 'map', {});
        
        this.map = L.map(CONSTANTS.SELECTORS.MAP.replace('#', ''), {
            center: mapConfig.center || CONSTANTS.MAP.DEFAULT_CENTER,
            zoom: mapConfig.zoom || CONSTANTS.MAP.DEFAULT_ZOOM,
            minZoom: mapConfig.minZoom || CONSTANTS.MAP.MIN_ZOOM,
            maxZoom: mapConfig.maxZoom || CONSTANTS.MAP.MAX_ZOOM,
            worldCopyJump: false,
            maxBounds: worldBounds,
            maxBoundsViscosity: 1.0,
            keyboard: true,
            keyboardPanDelta: mapConfig.keyboardPanDelta || CONSTANTS.MAP.KEYBOARD_PAN_DELTA
        });

        L.tileLayer(CONSTANTS.TILES.CARTO_LIGHT, {
            attribution: CONSTANTS.TILES.ATTRIBUTION,
            subdomains: CONSTANTS.TILES.SUBDOMAINS,
            maxZoom: mapConfig.maxZoom || CONSTANTS.MAP.MAX_ZOOM
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