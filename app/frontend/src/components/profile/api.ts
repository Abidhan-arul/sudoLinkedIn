const API_URL = 'http://localhost:5000';

// Cache for profile data
let profileCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Custom error class for API errors
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Check if we're online
const isOnline = () => navigator.onLine;

// Get auth token with error handling
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Generic API request function with error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError(401, 'No authentication token found');
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.msg || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (!isOnline()) {
      throw new ApiError(0, 'No internet connection');
    }
    
    throw new ApiError(500, 'Network error occurred');
  }
};

export const profileApi = {
  // Get profile with caching
  getProfile: async (forceRefresh = false) => {
    // Return cached data if available and not expired
    if (!forceRefresh && profileCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return { profile: profileCache };
    }

    try {
      const data = await apiRequest('/api/profile');
      profileCache = data.profile;
      cacheTimestamp = Date.now();
      return data;
    } catch (error) {
      // Return cached data if available (even if expired) when offline
      if (!isOnline() && profileCache) {
        console.warn('Using cached profile data (offline mode)');
        return { profile: profileCache };
      }
      throw error;
    }
  },

  // Update profile
  updateProfile: async (profileData: any) => {
    try {
      const data = await apiRequest('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
      
      // Update cache with new data
      if (data.profile) {
        profileCache = { ...profileCache, ...data.profile };
        cacheTimestamp = Date.now();
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (file: File) => {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError(401, 'No authentication token found');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/api/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.msg || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Update cache with new image URLs
      if (profileCache && data.image_urls) {
        profileCache.profile_image_url = data.image_urls.original;
        profileCache.profile_thumbnail_url = data.image_urls.thumbnail;
        cacheTimestamp = Date.now();
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (!isOnline()) {
        throw new ApiError(0, 'No internet connection');
      }
      
      throw new ApiError(500, 'Upload failed');
    }
  },

  // Clear cache
  clearCache: () => {
    profileCache = null;
    cacheTimestamp = 0;
  },

  // Get cached profile (synchronous)
  getCachedProfile: () => {
    return profileCache;
  },

  // Check if we have cached data
  hasCachedData: () => {
    return profileCache !== null && (Date.now() - cacheTimestamp) < CACHE_DURATION;
  },
}; 