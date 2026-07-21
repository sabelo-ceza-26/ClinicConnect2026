// src/utils/location.ts
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Cape Town coordinates as fallback
export const CAPE_TOWN_COORDINATES: Coordinates = {
  latitude: -33.9249,
  longitude: 18.4241,
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Check if location services are available
 */
export const isLocationAvailable = async (): Promise<boolean> => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (error) {
    console.log('Error checking location services:', error);
    return false;
  }
};

/**
 * Get user's current location with fallback
 */
export const getUserLocation = async (): Promise<Coordinates | null> => {
  try {
    // Check if location services are enabled
    const isEnabled = await isLocationAvailable();
    if (!isEnabled) {
      console.log('Location services are not enabled');
      return null;
    }

    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }

    // Get current position with a timeout
    const location = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Location request timeout')), 10000)
      )
    ]) as Location.LocationObject;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

/**
 * Get user's location using GPS directly (Android only)
 * This works without Google Play Services but requires more permissions
 */
export const getLocationDirect = async (): Promise<Coordinates | null> => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }

    // Use lowest accuracy to avoid Google Play Services dependency
    // This uses the device's GPS directly
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Lowest,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location directly:', error);
    return null;
  }
};

/**
 * Get user's location with multiple fallback strategies
 * Tries standard method first, then direct method, then Cape Town
 */
export const getLocationWithMultipleFallbacks = async (): Promise<Coordinates> => {
  // Try standard method first
  let location = await getUserLocation();
  if (location) {
    return location;
  }

  // If standard method fails, try direct GPS (Android only)
  if (Platform.OS === 'android') {
    console.log('Standard location failed, trying direct GPS...');
    location = await getLocationDirect();
    if (location) {
      return location;
    }
  }

  // If all methods fail, return Cape Town as fallback
  console.log('All location methods failed, using Cape Town as fallback');
  return CAPE_TOWN_COORDINATES;
};

/**
 * Get location with automatic fallback to Cape Town
 */
export const getLocationWithFallback = async (): Promise<Coordinates> => {
  const location = await getUserLocation();
  return location || CAPE_TOWN_COORDINATES;
};

/**
 * Get address from coordinates (reverse geocoding)
 */
export const getAddressFromCoordinates = async (
  coordinates: Coordinates
): Promise<string | null> => {
  try {
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });

    if (reverseGeocode && reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      const parts = [address.city, address.region, address.country].filter(Boolean);
      return parts.join(', ') || null;
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Check if location services are enabled
 */
export const checkLocationServices = async (): Promise<{
  enabled: boolean;
  permission: boolean;
  error?: string;
}> => {
  try {
    // Check if services are enabled
    const enabled = await Location.hasServicesEnabledAsync();

    // Check permission status
    const { status } = await Location.getForegroundPermissionsAsync();
    const permission = status === 'granted';

    return {
      enabled,
      permission,
      error: !enabled ? 'Location services are disabled' :
        !permission ? 'Location permission not granted' :
        undefined
    };
  } catch (error: any) {
    return {
      enabled: false,
      permission: false,
      error: error.message || 'Failed to check location services'
    };
  }
};

/**
 * Open device location settings (Android only)
 */
export const openLocationSettings = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      // This will open the location settings on Android
      await Location.enableNetworkProviderAsync();
    } catch (error) {
      console.error('Error opening location settings:', error);
    }
  }
};

/**
 * Get current position with retry logic
 */
export const getLocationWithRetry = async (
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<Coordinates | null> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Location attempt ${attempt}/${maxRetries}...`);
      const location = await getUserLocation();
      if (location) {
        return location;
      }
    } catch (error: any) {
      lastError = error;
      console.log(`Attempt ${attempt} failed: ${error.message}`);
    }

    // Wait before retry (except on last attempt)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error('All location attempts failed:', lastError);
  return null;
};

/**
 * Get location with all strategies combined
 * This is the main function to use in your app
 */
export const getBestLocation = async (): Promise<Coordinates> => {
  // First, try standard with retry
  let location = await getLocationWithRetry(3, 1000);
  if (location) {
    return location;
  }

  // If standard fails, try direct GPS (Android only)
  if (Platform.OS === 'android') {
    console.log('Trying direct GPS location...');
    location = await getLocationDirect();
    if (location) {
      return location;
    }
  }

  // If all methods fail, use Cape Town as fallback
  console.log('All location methods failed, using Cape Town fallback');
  return CAPE_TOWN_COORDINATES;
};

export default {
  calculateDistance,
  formatDistance,
  getUserLocation,
  getLocationDirect,
  getLocationWithFallback,
  getLocationWithMultipleFallbacks,
  getLocationWithRetry,
  getBestLocation,
  getAddressFromCoordinates,
  checkLocationServices,
  openLocationSettings,
  isLocationAvailable,
  CAPE_TOWN_COORDINATES,
};