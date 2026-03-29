import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';

const API_URL = 'https://siit-ehandbook-api.onrender.com/api';

/**
 * Registers the device for push notifications and sends the Expo push token to the backend.
 * Call this after a successful login.
 * @param userId The user's ID
 * @param authToken The user's auth token
 */
export async function registerForPushNotificationsAsync(userId: string, authToken: string) {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for notifications!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    // Send this token to your backend
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
  } else {
    alert('Must use physical device for Push Notifications');
  }
}