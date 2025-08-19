class MapRenderer {
    constructor() {
        this.map = null;
        this.currentLayer = null;
        this.selectedFeature = null;
        this.selectedLayer = null;
    }

    initMap() {
        const worldBounds = L.latLngBounds(
            L.latLng(-85, -180),
            L.latLng(85, 180)
        );

        this.map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            minZoom: 1,
            maxZoom: 8,
            worldCopyJump: false,
            maxBounds: worldBounds,
            maxBoundsViscosity: 1.0,
            keyboard: true,
            keyboardPanDelta: 80
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 8
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
            element.setAttribute('role', 'button');
            element.setAttribute('aria-label', 
                `Territory: ${feature.properties.NAME || feature.properties.name || 'Unknown'}`);
        }
    }

    getFeatureStyle(feature) {
        const hasData = this.hasValidData(feature);
        
        return {
            fillColor: hasData ? '#3498db' : '#95a5a6',
            weight: 1.5,
            opacity: 0.9,
            color: 'rgba(255, 255, 255, 0.8)',
            fillOpacity: hasData ? 0.7 : 0.4,
            dashArray: null,
            className: 'territory-feature'
        };
    }
    
    hasValidData(feature) {
        const props = feature.properties;
        if (!props) return false;
        
        const name = props.NAME || props.name;
        if (!name || name.trim() === '') return false;
        
        const keyFields = Object.keys(props).filter(key => 
            key !== 'NAME' && key !== 'name' && props[key] !== null
        );
        
        return keyFields.length > 0;
    }

    highlightFeature(layer) {
        layer.setStyle({
            weight: 3,
            color: 'rgba(255, 255, 255, 1)',
            fillOpacity: 0.9,
            dashArray: '5, 5',
            className: 'territory-feature territory-hover'
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    selectFeature(layer) {
        this.selectedLayer = layer;
        layer.setStyle({
            weight: 4,
            color: 'rgba(255, 255, 255, 1)',
            fillColor: 'rgba(255, 215, 0, 0.8)',
            fillOpacity: 0.9,
            dashArray: null,
            className: 'territory-feature territory-selected'
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