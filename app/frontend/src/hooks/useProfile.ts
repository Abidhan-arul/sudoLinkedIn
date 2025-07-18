import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../components/profile/api';
import type { Profile } from '../types';

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile data
  const loadProfile = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await profileApi.getProfile(forceRefresh);
      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      console.error('Profile loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profileApi.updateProfile(data);
      setProfile(response.profile);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Profile update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload profile image
  const uploadImage = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profileApi.uploadProfileImage(file);
      
      // Update profile with new image URLs
      if (profile && response.image_urls) {
        setProfile({
          ...profile,
          profile_image_url: response.image_urls.original,
          profile_thumbnail_url: response.image_urls.thumbnail,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      console.error('Image upload error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    await loadProfile(true);
  }, [loadProfile]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (profileApi.hasCachedData()) {
        // Refresh data when coming back online
        loadProfile(true);
      }
    };

    const handleOffline = () => {
      console.log('App went offline, using cached data if available');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadImage,
    refreshProfile,
    clearError,
  };
}; 