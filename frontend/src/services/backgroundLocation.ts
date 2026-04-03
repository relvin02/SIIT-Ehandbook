import * as TaskManager from 'expo-task-manager';
import type { TaskManagerTaskBody } from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LOCATION_TASK_NAME = 'background-location-task';
const API_URL = 'https://siit-ehandbook-api.onrender.com/api/location/update';

// Register the background location task
TaskManager.defineTask(LOCATION_TASK_NAME, async (task: TaskManagerTaskBody) => {
  const { data, error } = task || {};
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  if (data && Array.isArray((data as any).locations)) {
    const locations = (data as any).locations;
    if (locations.length > 0) {
      const location = locations[0];
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;
        await axios.post(
          API_URL,
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        // Optionally log or handle error
      }
    }
  }
});

export async function startBackgroundLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Foreground location permission denied');
      return;
    }
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      console.warn('Background location permission denied — location will only update while app is open');
      return;
    }

    const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!isRegistered) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 2 * 60 * 1000, // every 2 minutes
        distanceInterval: 0, // update even when stationary
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'SIIT eHandbook',
          notificationBody: 'Location tracking is active.',
        },
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.Other,
      });
    }
    console.log('Background location tracking started');
  } catch (err) {
    console.error('Failed to start background location:', err);
  }
}

export async function stopBackgroundLocation() {
  const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}
