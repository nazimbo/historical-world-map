class EventHandler {
    constructor(mapRenderer, uiController) {
        this.mapRenderer = mapRenderer;
        this.uiController = uiController;
        this.onTerritoryClick = null;
    }

    setTerritoryClickHandler(callback) {
        this.onTerritoryClick = callback;
    }

    handleTerritoryClick(feature, layer) {
        this.mapRenderer.clearSelection();
        this.mapRenderer.setSelectedFeature(feature);
        this.mapRenderer.selectFeature(layer);
        
        if (this.onTerritoryClick) {
            this.onTerritoryClick(feature, layer);
        }
    }

    handleTerritoryMouseOver(layer) {
        this.mapRenderer.highlightFeature(layer);
    }

    handleTerritoryMouseOut(layer) {
        this.mapRenderer.resetHighlight(layer);
    }

    handleInfoPanelClose() {
        this.uiController.hideInfoPanel();
        this.mapRenderer.clearSelection();
    }

    handlePeriodNavigation(periodIndex) {
        this.uiController.navigateToPeriod(periodIndex);
        if (this.onPeriodChange) {
            this.onPeriodChange(periodIndex);
        }
    }

    setPeriodChangeHandler(callback) {
        this.onPeriodChange = callback;
    }

    getMapEventHandlers() {
        return {
            onClick: (feature, layer) => this.handleTerritoryClick(feature, layer),
            onMouseOver: (layer) => this.handleTerritoryMouseOver(layer),
            onMouseOut: (layer) => this.handleTerritoryMouseOut(layer)
        };
    }
}