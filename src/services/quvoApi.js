import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure API endpoints - will be environment-dependent
const API_ENDPOINTS = {
  development: 'http://localhost:3001',
  production: 'https://quvo-api.vercel.app', // Update when deployed
  staging: 'http://localhost:3001'
};

// Get current environment
const ENV = __DEV__ ? 'development' : 'production';
const API_BASE_URL = API_ENDPOINTS[ENV];

class QuvoMultiClientAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.currentClient = 'martin-marietta'; // Default client
    this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache for facility data
    this.BAY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache for bay data (more dynamic)
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      console.log(`🌐 API Request: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ API Request failed for ${endpoint}:`, error);
      // Fallback to cached data if available during network errors
      const cachedKey = this.getCacheKey(endpoint);
      const cached = await this.getCachedData(cachedKey, true); // Force return expired cache on error
      if (cached) {
        console.log(`🔄 Using cached data as fallback for ${endpoint}`);
        return cached;
      }
      throw error;
    }
  }

  // Cache management methods
  getCacheKey(endpoint) {
    return `quvo_api_${this.currentClient}_${endpoint.replace(/\//g, '_')}`;
  }

  async getCachedData(key, ignoreExpiry = false) {
    try {
      const cachedItem = await AsyncStorage.getItem(key);
      if (!cachedItem) return null;

      const { data, timestamp } = JSON.parse(cachedItem);
      const now = Date.now();
      const duration = key.includes('bays') ? this.BAY_CACHE_DURATION : this.CACHE_DURATION;

      if (!ignoreExpiry && (now - timestamp > duration)) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  async setCachedData(key, data) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('quvo_api_'));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('🧹 Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Client management
  setClient(clientId) {
    this.currentClient = clientId;
    console.log(`🔄 Switched to client: ${clientId}`);
  }

  getCurrentClient() {
    return this.currentClient;
  }

  async getSupportedClients() {
    return this.makeRequest('/clients');
  }

  async getClientInfo() {
    return this.makeRequest(`/api/${this.currentClient}`);
  }

  // Health and status
  async getHealth() {
    return this.makeRequest('/health');
  }

  // Main data methods with caching
  async getFacilities(filters = {}, forceRefresh = false) {
    const queryParams = new URLSearchParams();
    
    if (filters.district) queryParams.append('district', filters.district);
    if (filters.state) queryParams.append('state', filters.state);
    if (filters.productCode) queryParams.append('productCode', filters.productCode);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const endpoint = `/api/${this.currentClient}/facilities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const cacheKey = this.getCacheKey(endpoint);
    
    if (!forceRefresh) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📋 Returning cached facilities data');
        return cachedData;
      }
    }

    console.log('🌐 Fetching fresh facilities data');
    const data = await this.makeRequest(endpoint);
    await this.setCachedData(cacheKey, data);
    return data;
  }

  async getFacilityById(facilityId) {
    const endpoint = `/api/${this.currentClient}/facilities/${facilityId}`;
    return this.makeRequest(endpoint);
  }

  async getDistricts(forceRefresh = false) {
    const endpoint = `/api/${this.currentClient}/districts`;
    const cacheKey = this.getCacheKey(endpoint);
    
    if (!forceRefresh) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📋 Returning cached districts data');
        return cachedData;
      }
    }

    console.log('🌐 Fetching fresh districts data');
    const data = await this.makeRequest(endpoint);
    await this.setCachedData(cacheKey, data);
    return data;
  }

  async getProducts(forceRefresh = false) {
    const endpoint = `/api/${this.currentClient}/products`;
    const cacheKey = this.getCacheKey(endpoint);
    
    if (!forceRefresh) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📋 Returning cached products data');
        return cachedData;
      }
    }

    console.log('🌐 Fetching fresh products data');
    const data = await this.makeRequest(endpoint);
    await this.setCachedData(cacheKey, data);
    return data;
  }

  async getBays(forceRefresh = false) {
    const endpoint = `/api/${this.currentClient}/bays`;
    const cacheKey = this.getCacheKey(endpoint);
    
    if (!forceRefresh) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📦 Returning cached bays data');
        return cachedData;
      }
    }

    console.log('🌐 Fetching fresh bays data');
    const data = await this.makeRequest(endpoint);
    await this.setCachedData(cacheKey, data);
    return data;
  }

  // Convenience methods that match the existing app interface
  async getBayData(projectId = null, forceRefresh = false) {
    // For now, we ignore projectId since our API serves all bays
    // This can be extended later when we add project-specific filtering
    const response = await this.getBays(forceRefresh);
    
    // Transform to match existing app expectations
    return {
      success: true,
      records: response.bays || [],
      storages: response.bays?.map(bay => ({
        id: bay.storageId || bay.id,
        maxVolume: bay.maxVolume,
        facilityName: bay.facilityName,
        materialType: bay.materialType
      })) || []
    };
  }

  // Search and filtering methods
  async searchFacilities(query, filters = {}) {
    const searchFilters = { ...filters };
    
    // Add query to state filter if it looks like a state code
    if (query && query.length === 2) {
      searchFilters.state = query.toUpperCase();
    }
    
    const response = await this.getFacilities(searchFilters);
    
    // Client-side filtering for complex queries
    let filteredFacilities = response.facilities || [];
    
    if (query && query.length > 2) {
      const searchTerm = query.toLowerCase();
      filteredFacilities = filteredFacilities.filter(facility =>
        facility.name?.toLowerCase().includes(searchTerm) ||
        facility.city?.toLowerCase().includes(searchTerm) ||
        facility.address?.toLowerCase().includes(searchTerm)
      );
    }
    
    return {
      ...response,
      facilities: filteredFacilities,
      total: filteredFacilities.length
    };
  }

  // Statistics and metadata
  async getStats() {
    const [facilities, products, districts] = await Promise.all([
      this.getFacilities(),
      this.getProducts(),
      this.getDistricts()
    ]);

    return {
      totalFacilities: facilities.total || 0,
      totalDistricts: districts.total || 0,
      productCategories: Object.keys(products.categories || {}).length,
      supportedStates: [...new Set((facilities.facilities || []).map(f => f.state))].length
    };
  }

  // Network status
  async checkConnection() {
    try {
      await this.getHealth();
      return true;
    } catch (error) {
      console.log('🔌 API connection failed, using offline mode');
      return false;
    }
  }

  // Development helpers
  async debugInfo() {
    const health = await this.getHealth();
    const clientInfo = await this.getClientInfo();
    
    return {
      apiUrl: this.baseURL,
      currentClient: this.currentClient,
      environment: ENV,
      health,
      clientInfo,
      cacheKeys: (await AsyncStorage.getAllKeys()).filter(key => key.startsWith('quvo_api_'))
    };
  }
}

export default new QuvoMultiClientAPI();