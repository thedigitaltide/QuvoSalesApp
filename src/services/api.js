import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://cireco.sachtlebentechnology.com/api/v1';

// Alan's credentials for auto-login
const DEFAULT_CREDENTIALS = {
  email: 'Allan.kane',
  password: 'Allan1234!',
};

class QuvoAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          await this.login();
          return this.makeRequest(endpoint, options);
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async login(credentials = DEFAULT_CREDENTIALS) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.user) {
        this.authToken = data.token || 'session-based-auth';
        await AsyncStorage.setItem('auth_token', this.authToken);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
        return data.user;
      }
      
      throw new Error('Invalid login response');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    this.authToken = null;
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }

  async getStoredAuth() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token) {
        this.authToken = token;
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Failed to get stored auth:', error);
      return null;
    }
  }

  // Cache management methods
  async getCachedData(key) {
    try {
      const cachedItem = await AsyncStorage.getItem(`cache_${key}`);
      if (!cachedItem) return null;

      const { data, timestamp } = JSON.parse(cachedItem);
      const now = Date.now();

      if (now - timestamp > this.CACHE_DURATION) {
        await AsyncStorage.removeItem(`cache_${key}`);
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
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Sales-focused API methods with caching
  async getProjects(forceRefresh = false) {
    const cacheKey = 'projects';
    
    if (!forceRefresh) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('Returning cached projects data');
        return cachedData;
      }
    }

    console.log('Fetching fresh projects data');
    const data = await this.makeRequest('/projects');
    await this.setCachedData(cacheKey, data);
    return data;
  }

  async getBayData(projectId = null, forceRefresh = false) {
    const cacheKey = projectId ? `baydata_${projectId}` : 'baydata_all';
    
    if (!forceRefresh) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Returning cached bay data for ${cacheKey}`);
        return cachedData;
      }
    }

    console.log(`Fetching fresh bay data for ${cacheKey}`);
    const endpoint = projectId 
      ? `/dashboard/initial-fetch?project=${projectId}` 
      : '/dashboard/initial-fetch';
    
    const data = await this.makeRequest(endpoint, {
      method: 'POST',
      body: '',
    });
    
    await this.setCachedData(cacheKey, data);
    return data;
  }

  async getNotifications(limit = 50, forceRefresh = false) {
    const cacheKey = `notifications_${limit}`;
    
    if (!forceRefresh) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('Returning cached notifications data');
        return cachedData;
      }
    }

    console.log('Fetching fresh notifications data');
    const data = await this.makeRequest(`/notifications?limit=${limit}`);
    await this.setCachedData(cacheKey, data);
    return data;
  }
}

export default new QuvoAPI();