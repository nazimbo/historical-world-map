class DataManager {
    constructor(configService, eventBus) {
        this.configService = configService || ConfigurationService.fromGlobalConfig();
        this.eventBus = eventBus || new EventBus();
        
        this.dataCache = new Map();
        this.maxCacheSize = this.configService.get('cache.maxSize', CONSTANTS.CACHE.DEFAULT_MAX_SIZE);
        this.optimizationThreshold = this.configService.get('cache.optimizationThreshold', CONSTANTS.CACHE.DEFAULT_OPTIMIZATION_THRESHOLD);
        this.coordinatePrecision = this.configService.get('performance.coordinatePrecision', CONSTANTS.DATA.COORDINATE_PRECISION);
        this.simplificationTolerance = this.configService.get('performance.simplificationTolerance', CONSTANTS.DATA.SIMPLIFICATION_TOLERANCE);
        
        this.cacheStats = {
            hits: 0,
            misses: 0,
            totalBytesLoaded: 0,
            totalLoadTime: 0
        };
        
        this.preloadQueue = new Set();
        this.isPreloading = false;
        this.preloadTimers = [];  // Phase 2: Track timers to prevent memory leaks
        this.errorHandler = new ErrorHandler();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for preload requests
        this.eventBus.on(this.eventBus.EVENTS.DATA_PRELOADED, (event) => {
            const { periods, currentIndex } = event.data;
            this.preloadAdjacentPeriods(periods, currentIndex);
        });
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

            // Only calculate size in development mode for performance
            if (Utils.isDevelopment()) {
                const sizeInBytes = JSON.stringify(optimizedData).length;
                this.cacheStats.totalBytesLoaded += sizeInBytes;
                console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Loaded ${period.label} in ${Math.round(loadTime)}ms (${Utils.formatFileSize(sizeInBytes)})`);
            } else {
                console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Loaded ${period.label} in ${Math.round(loadTime)}ms`);
            }
            
            // Emit cache update event
            this.eventBus.emit(this.eventBus.EVENTS.CACHE_UPDATED, this.getCacheStats());
            
            return optimizedData;
            
        } catch (error) {
            const processedError = this.errorHandler.handleError(error, this.errorHandler.createPeriodContext(period));
            throw new Error(processedError.technicalMessage);
        }
    }

    optimizeGeoJSON(data) {
        // Estimate size without expensive JSON.stringify - based on features and coordinates count
        const estimatedSize = this.estimateGeoJSONSize(data);
        if (estimatedSize < this.optimizationThreshold) {
            return data;
        }

        console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Optimizing GeoJSON data (estimated ${Utils.formatFileSize(estimatedSize)})`);

        // Phase 2 optimization: Use Douglas-Peucker algorithm for better compression
        return {
            ...data,
            features: data.features.map(feature => ({
                ...feature,
                geometry: {
                    ...feature.geometry,
                    coordinates: Utils.simplifyCoordinates(
                        feature.geometry.coordinates,
                        this.coordinatePrecision,
                        this.simplificationTolerance
                    )
                },
                properties: { ...feature.properties }
            }))
        };
    }

    /**
     * Estimate GeoJSON size without expensive JSON.stringify
     * Based on feature count and coordinate counts for faster performance
     */
    estimateGeoJSONSize(data) {
        if (!data || !data.features) return 0;

        let totalSize = 100; // Base object overhead

        data.features.forEach(feature => {
            // Base feature overhead (~200 bytes)
            totalSize += 200;

            // Estimate coordinates size (each coordinate pair ~16 bytes as string)
            const coordCount = this.countCoordinates(feature.geometry?.coordinates || []);
            totalSize += coordCount * 16;

            // Properties overhead (rough estimate based on key count)
            if (feature.properties) {
                totalSize += Object.keys(feature.properties).length * 50;
            }
        });

        return totalSize;
    }

    /**
     * Recursively count coordinates in nested arrays
     */
    countCoordinates(coords) {
        if (!Array.isArray(coords)) return 0;
        if (coords.length === 0) return 0;

        // Base case: coordinate pair [lon, lat]
        if (typeof coords[0] === 'number') {
            return 1;
        }

        // Recursive case: array of coordinate arrays
        return coords.reduce((sum, c) => sum + this.countCoordinates(c), 0);
    }

    addToCache(key, data) {
        // LRU eviction
        if (this.dataCache.size >= this.maxCacheSize) {
            const firstKey = this.dataCache.keys().next().value;
            console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Cache full - evicting ${firstKey}`);
            this.dataCache.delete(firstKey);
        }
        
        this.dataCache.set(key, data);

        // Only calculate size in development mode for performance
        if (Utils.isDevelopment()) {
            const sizeInBytes = JSON.stringify(data).length;
            console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Cached ${key} (${Utils.formatFileSize(sizeInBytes)}). Cache size: ${this.dataCache.size}/${this.maxCacheSize}`);
        } else {
            console.log(`${CONSTANTS.DEVELOPMENT.LOG_PREFIX} Cached ${key}. Cache size: ${this.dataCache.size}/${this.maxCacheSize}`);
        }
        
        // Emit cache update event
        this.eventBus.emit(this.eventBus.EVENTS.CACHE_UPDATED, this.getCacheStats());
    }

    async preloadAdjacentPeriods(periods, currentIndex) {
        // Phase 2: Clear existing timers to prevent memory leaks
        this.clearPreloadTimers();

        if (this.isPreloading) return;

        this.isPreloading = true;
        const preloadDistance = this.configService.get('cache.preloadDistance', CONSTANTS.CACHE.DEFAULT_PRELOAD_DISTANCE);

        const indicesToPreload = [];
        for (let i = 1; i <= preloadDistance; i++) {
            indicesToPreload.push(currentIndex - i, currentIndex + i);
        }

        // Sort by distance (closest first) for better UX
        const validIndices = indicesToPreload
            .filter(i => i >= 0 && i < periods.length)
            .sort((a, b) => Math.abs(currentIndex - a) - Math.abs(currentIndex - b));

        // Phase 2: Use requestIdleCallback for better browser integration
        this.schedulePreload(validIndices, periods, 0);

        this.isPreloading = false;
    }

    /**
     * Schedule preload using requestIdleCallback (Phase 2 optimization)
     * Falls back to setTimeout if requestIdleCallback not available
     */
    schedulePreload(indices, periods, currentIdx) {
        if (currentIdx >= indices.length) {
            return;
        }

        const index = indices[currentIdx];
        const period = periods[index];
        const cacheKey = Utils.getCacheKey(period);

        if (this.dataCache.has(cacheKey) || this.preloadQueue.has(cacheKey)) {
            // Already cached or queued, move to next
            this.schedulePreload(indices, periods, currentIdx + 1);
            return;
        }

        this.preloadQueue.add(cacheKey);

        // Use requestIdleCallback for non-blocking preload
        const scheduleCallback = (callback) => {
            if ('requestIdleCallback' in window) {
                const handle = requestIdleCallback(callback, { timeout: 2000 });
                this.preloadTimers.push({ type: 'idle', handle });
            } else {
                const handle = setTimeout(callback, 100);
                this.preloadTimers.push({ type: 'timeout', handle });
            }
        };

        scheduleCallback(async () => {
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

            // Schedule next preload
            this.schedulePreload(indices, periods, currentIdx + 1);
        });
    }

    /**
     * Clear all preload timers (Phase 2 memory leak fix)
     */
    clearPreloadTimers() {
        this.preloadTimers.forEach(timer => {
            if (timer.type === 'timeout') {
                clearTimeout(timer.handle);
            } else if (timer.type === 'idle') {
                cancelIdleCallback(timer.handle);
            }
        });
        this.preloadTimers = [];
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