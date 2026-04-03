import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = 'https://siit-ehandbook-api.onrender.com/api';

// Show notifications even when app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Android notification channel (required)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#004BA8',
    sound: 'default',
  });
}

/**
 * Registers the device for push notifications and sends the Expo push token to the backend.
 * Call this after a successful login.
 * @param userId The user's ID
 * @param authToken The user's auth token
 */
export async function registerForPushNotificationsAsync(userId: string, authToken: string) {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('No projectId found for push notifications');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  // Send this token to the backend
  try {
    await axios.post(
      `${API_URL}/notifications/register`,
      {
        userId,
        expoPushToken: token,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
  } catch (err) {
    console.error('Failed to register push token:', err);
  }
}