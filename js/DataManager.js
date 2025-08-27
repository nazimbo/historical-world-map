class DataManager {
    constructor() {
        this.dataCache = new Map();
        this.maxCacheSize = Utils.getNestedProperty(window.CONFIG, 'cache.maxSize', CONSTANTS.CACHE.DEFAULT_MAX_SIZE);
        this.optimizationThreshold = Utils.getNestedProperty(window.CONFIG, 'cache.optimizationThreshold', CONSTANTS.CACHE.DEFAULT_OPTIMIZATION_THRESHOLD);
        this.coordinatePrecision = Utils.getNestedProperty(window.CONFIG, 'performance.coordinatePrecision', CONSTANTS.DATA.COORDINATE_PRECISION);
        this.cacheStats = {
            hits: 0,
            misses: 0,
            totalBytesLoaded: 0,
            totalLoadTime: 0
        };
        this.preloadQueue = new Set();
        this.isPreloading = false;
        this.errorHandler = new ErrorHandler();
    }

    async loadPeriod(period) {
        const cacheKey = Utils.getCacheKey(period);
        
        if (this.dataCache.has(cacheKey)) {
            console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Cache hit for ${period.label}`);
            this.cacheStats.hits++;
            
            // Move to end (LRU)
            const cachedData = this.dataCache.get(cacheKey);
            this.dataCache.delete(cacheKey);
            this.dataCache.set(cacheKey, cachedData);
            
            return cachedData;
        }
        
        console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Cache miss for ${period.label} - loading from network`);
        this.cacheStats.misses++;
        
        const startTime = performance.now();

        try {
            const response = await fetch(`data/${period.file}`);
            
            const responseValidation = Validators.validateResponse(response, `loading ${period.file}`);
            if (!responseValidation.isValid) {
                throw new Error(responseValidation.errors[0]);
            }

            const geoJsonData = await response.json();
            
            const dataValidation = Validators.validateGeoJSON(geoJsonData, period.file);
            if (!dataValidation.isValid) {
                throw new Error(`Invalid GeoJSON in ${period.file}: ${dataValidation.errors[0]}`);
            }
            
            // Log warnings if any
            if (dataValidation.warnings.length > 0) {
                console.warn(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Warnings for ${period.file}:`, dataValidation.warnings);
            }
            
            const optimizedData = this.optimizeGeoJSON(geoJsonData);
            this.addToCache(cacheKey, optimizedData);
            
            const loadTime = performance.now() - startTime;
            this.cacheStats.totalLoadTime += loadTime;
            const sizeInBytes = JSON.stringify(optimizedData).length;
            this.cacheStats.totalBytesLoaded += sizeInBytes;
            console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Loaded ${period.label} in ${Math.round(loadTime)}ms (${Utils.formatFileSize(sizeInBytes)})`);
            
            return optimizedData;
            
        } catch (error) {
            const processedError = this.errorHandler.handleError(error, this.errorHandler.createPeriodContext(period));
            throw new Error(processedError.technicalMessage);
        }
    }

    optimizeGeoJSON(data) {
        const dataSize = JSON.stringify(data).length;
        if (dataSize < this.optimizationThreshold) {
            return data;
        }
        
        console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Optimizing GeoJSON data (${Utils.formatFileSize(dataSize)})`);
        
        return {
            ...data,
            features: data.features.map(feature => ({
                ...feature,
                geometry: {
                    ...feature.geometry,
                    coordinates: Utils.simplifyCoordinates(feature.geometry.coordinates, this.coordinatePrecision)
                },
                properties: { ...feature.properties }
            }))
        };
    }

    addToCache(key, data) {
        // LRU eviction
        if (this.dataCache.size >= this.maxCacheSize) {
            const firstKey = this.dataCache.keys().next().value;
            console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Cache full - evicting ${firstKey}`);
            this.dataCache.delete(firstKey);
        }
        
        this.dataCache.set(key, data);
        
        const sizeInBytes = JSON.stringify(data).length;
        console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Cached ${key} (${Utils.formatFileSize(sizeInBytes)}). Cache size: ${this.dataCache.size}/${this.maxCacheSize}`);
    }

    async preloadAdjacentPeriods(periods, currentIndex) {
        if (this.isPreloading) return;
        
        this.isPreloading = true;
        const preloadDistance = Utils.getNestedProperty(window.CONFIG, 'cache.preloadDistance', CONSTANTS.CACHE.DEFAULT_PRELOAD_DISTANCE);
        
        const indicesToPreload = [];
        for (let i = 1; i <= preloadDistance; i++) {
            indicesToPreload.push(currentIndex - i, currentIndex + i);
        }
        const validIndices = indicesToPreload.filter(i => i >= 0 && i < periods.length);
        
        for (const index of validIndices) {
            const period = periods[index];
            const cacheKey = Utils.getCacheKey(period);
            
            if (!this.dataCache.has(cacheKey) && !this.preloadQueue.has(cacheKey)) {
                this.preloadQueue.add(cacheKey);
                
                const delay = Utils.getNestedProperty(window.CONFIG, 'performance.preloadStagger', CONSTANTS.UI.PRELOAD_STAGGER) * Math.abs(currentIndex - index);
                
                setTimeout(async () => {
                    if (!this.dataCache.has(cacheKey)) {
                        try {
                            console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Preloading ${period.label} in background`);
                            const response = await fetch(`data/${period.file}`);
                            if (response.ok) {
                                const data = await response.json();
                                const validation = Validators.validateGeoJSON(data, period.file);
                                if (validation.isValid) {
                                    const optimizedData = this.optimizeGeoJSON(data);
                                    this.addToCache(cacheKey, optimizedData);
                                } else {
                                    console.warn(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Invalid preloaded data for ${period.file}:`, validation.errors);
                                }
                            }
                        } catch (error) {
                            console.warn(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Failed to preload ${period.file}:`, error.message);
                        } finally {
                            this.preloadQueue.delete(cacheKey);
                        }
                    }
                }, delay);
            }
        }
        
        this.isPreloading = false;
    }

    getCacheStats() {
        const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
        const hitRate = totalRequests > 0 
            ? (this.cacheStats.hits / totalRequests * 100).toFixed(1)
            : 0;
        
        return {
            cacheSize: this.dataCache.size,
            maxSize: this.maxCacheSize,
            hits: this.cacheStats.hits,
            misses: this.cacheStats.misses,
            hitRate: `${hitRate}%`,
            avgLoadTime: totalRequests > 0 
                ? `${Math.round(this.cacheStats.totalLoadTime / this.cacheStats.misses)}ms`
                : 'N/A'
        };
    }

    clearCache() {
        const size = this.dataCache.size;
        this.dataCache.clear();
        this.preloadQueue.clear();
        console.log(`Cleared cache (removed ${size} entries)`);
        return size;
    }

    deleteCacheEntry(key) {
        return this.dataCache.delete(key);
    }
}