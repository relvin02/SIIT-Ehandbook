import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://siit-ehandbook-api.onrender.com/api';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

class LocationService {
  private locationSubscription: any = null;
  private updateInterval: NodeJS.Timer | null = null;
  private isTrackingEnabled = false;

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
   * Start background location tracking
   * Updates location every 2 minutes
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

      // Send location immediately
      await this.sendLocationToBackend(token);

      // Then set up periodic updates (every 2 minutes)
      this.updateInterval = setInterval(async () => {
        if (this.isTrackingEnabled) {
          await this.sendLocationToBackend(token);
        }
      }, 2 * 60 * 1000); // 2 minutes

      console.log('Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.isTrackingEnabled = false;
    }
  }

  /**
   * Stop background location tracking
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

      this.isTrackingEnabled = false;
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
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
