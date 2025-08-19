class DataManager {
    constructor() {
        this.dataCache = new Map();
        this.maxCacheSize = 15;
        this.cacheStats = {
            hits: 0,
            misses: 0,
            totalBytesLoaded: 0,
            totalLoadTime: 0
        };
        this.preloadQueue = new Set();
        this.isPreloading = false;
    }

    async loadPeriod(period) {
        const cacheKey = period.file;
        
        if (this.dataCache.has(cacheKey)) {
            console.log(`Cache hit for ${period.label}`);
            this.cacheStats.hits++;
            
            const cachedData = this.dataCache.get(cacheKey);
            this.dataCache.delete(cacheKey);
            this.dataCache.set(cacheKey, cachedData);
            
            return cachedData;
        }
        
        console.log(`Cache miss for ${period.label} - loading from network`);
        this.cacheStats.misses++;
        
        const startTime = performance.now();

        try {
            const response = await fetch(`data/${period.file}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Data file not found: ${period.file}. Please ensure the data directory contains all required GeoJSON files.`);
                } else {
                    throw new Error(`Failed to load ${period.file}: ${response.status} ${response.statusText}`);
                }
            }

            const geoJsonData = await response.json();
            
            if (!geoJsonData.type || !geoJsonData.features) {
                throw new Error(`Invalid GeoJSON format in ${period.file}`);
            }
            
            const optimizedData = this.optimizeGeoJSON(geoJsonData);
            this.addToCache(cacheKey, optimizedData);
            
            const loadTime = performance.now() - startTime;
            this.cacheStats.totalLoadTime += loadTime;
            console.log(`Loaded ${period.label} in ${Math.round(loadTime)}ms`);
            
            return optimizedData;
            
        } catch (error) {
            console.error('Error loading period:', error);
            throw error;
        }
    }

    optimizeGeoJSON(data) {
        if (JSON.stringify(data).length < 500000) {
            return data;
        }
        
        return {
            ...data,
            features: data.features.map(feature => ({
                ...feature,
                geometry: {
                    ...feature.geometry,
                    coordinates: this.simplifyCoordinates(feature.geometry.coordinates, 6)
                },
                properties: { ...feature.properties }
            }))
        };
    }

    simplifyCoordinates(coords, precision) {
        if (typeof coords[0] === 'number') {
            return coords.map(c => 
                Math.round(c * Math.pow(10, precision)) / Math.pow(10, precision)
            );
        }
        return coords.map(c => this.simplifyCoordinates(c, precision));
    }

    addToCache(key, data) {
        if (this.dataCache.size >= this.maxCacheSize) {
            const firstKey = this.dataCache.keys().next().value;
            console.log(`Cache full - evicting ${firstKey}`);
            this.dataCache.delete(firstKey);
        }
        
        this.dataCache.set(key, data);
        
        const sizeInMB = JSON.stringify(data).length / (1024 * 1024);
        console.log(`Cached ${key} (≈${sizeInMB.toFixed(2)} MB). Cache size: ${this.dataCache.size}/${this.maxCacheSize}`);
    }

    async preloadAdjacentPeriods(periods, currentIndex) {
        if (this.isPreloading) return;
        
        this.isPreloading = true;
        
        const indicesToPreload = [
            currentIndex - 1,
            currentIndex + 1,
            currentIndex - 2,
            currentIndex + 2
        ].filter(i => i >= 0 && i < periods.length);
        
        for (const index of indicesToPreload) {
            const period = periods[index];
            if (!this.dataCache.has(period.file) && !this.preloadQueue.has(period.file)) {
                this.preloadQueue.add(period.file);
                
                setTimeout(async () => {
                    if (!this.dataCache.has(period.file)) {
                        try {
                            console.log(`Preloading ${period.label} in background`);
                            const response = await fetch(`data/${period.file}`);
                            if (response.ok) {
                                const data = await response.json();
                                const optimizedData = this.optimizeGeoJSON(data);
                                this.addToCache(period.file, optimizedData);
                            }
                        } catch (error) {
                            console.warn(`Failed to preload ${period.file}:`, error);
                        } finally {
                            this.preloadQueue.delete(period.file);
                        }
                    }
                }, 100 * (Math.abs(currentIndex - index)));
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