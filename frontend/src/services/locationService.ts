import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

const API_URL = 'https://siit-ehandbook-api.onrender.com/api';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

class LocationService {
  private locationSubscription: any = null;
  private updateInterval: NodeJS.Timer | null = null;
  private appStateSubscription: any = null;
  private isTrackingEnabled = false;
  private currentToken: string = '';
  private lastSentTime = 0;

  /**
   * Request location permissions
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      const hasPermission = await this.hasLocationPermission();
      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          console.warn('Location permission not granted');
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Check if location permission is granted
   */
  async hasLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  /**
   * Start location tracking with multiple strategies:
   * 1. watchPositionAsync (native, reliable when app is open)
   * 2. setInterval as backup
   * 3. AppState listener to update when app comes to foreground
   */
  async startLocationTracking(token: string): Promise<void> {
    try {
      if (this.isTrackingEnabled) {
        console.log('Location tracking already enabled');
        return;
      }

      const hasPermission = await this.hasLocationPermission();
      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          console.warn('Location permission not granted, cannot start tracking');
          return;
        }
      }

      this.isTrackingEnabled = true;
      this.currentToken = token;

      // Save token for background task
      await AsyncStorage.setItem('authToken', token);

      // Send location immediately
      await this.sendLocationToBackend(token);

      // Strategy 1: Native watch (reliable while app is open)
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 90 * 1000, // every 90 seconds
          distanceInterval: 0, // even if stationary
        },
        async (_location) => {
          // Throttle: only send every 90 seconds
          const now = Date.now();
          if (now - this.lastSentTime > 85 * 1000) {
            await this.sendLocationToBackend(token);
          }
        }
      );

      // Strategy 2: setInterval backup (in case watch doesn't fire)
      this.updateInterval = setInterval(async () => {
        if (this.isTrackingEnabled) {
          await this.sendLocationToBackend(token);
        }
      }, 2 * 60 * 1000);

      // Strategy 3: AppState listener - update when app comes to foreground
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

      console.log('Location tracking started (watch + interval + appstate)');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.isTrackingEnabled = false;
    }
  }

  private handleAppStateChange = async (nextState: AppStateStatus) => {
    if (nextState === 'active' && this.isTrackingEnabled && this.currentToken) {
      console.log('App came to foreground, updating location...');
      await this.sendLocationToBackend(this.currentToken);
    }
  };

  /**
   * Stop location tracking
   */
  stopLocationTracking(): void {
    try {
      if (this.updateInterval) {
        clearInterval(this.updateInterval as any);
        this.updateInterval = null;
      }

      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }

      this.isTrackingEnabled = false;
      this.currentToken = '';
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  /**
   * Force send current location now (called externally)
   */
  async forceUpdate(): Promise<void> {
    if (this.currentToken) {
      await this.sendLocationToBackend(this.currentToken);
    }
  }

  /**
   * Send location to backend
   */
  private async sendLocationToBackend(token: string): Promise<boolean> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) {
        console.warn('Could not get current location');
        return false;
      }

      const response = await fetch(`${API_URL}/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating location:', errorData);
        return false;
      }

      const data = await response.json();
      if (data.success) {
        this.lastSentTime = Date.now();
        console.log('Location updated successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error sending location to backend:', error);
      return false;
    }
  }

  /**
   * Is tracking currently enabled
   */
  isTrackingActive(): boolean {
    return this.isTrackingEnabled;
  }
}

export default new LocationService();
