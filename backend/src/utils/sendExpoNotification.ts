import axios from 'axios';

/**
 * Send a push notification via Expo to a device
 * @param expoPushToken Expo push token (string)
 * @param title Notification title
 * @param body Notification body
 * @param data Optional data object
 */
export async function sendExpoNotification(expoPushToken: string, title: string, body: string, data?: any) {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) return;
  try {
    await axios.post('https://exp.host/--/api/v2/push/send', {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    });
  } catch (err) {
    console.error('Expo push notification error:', err?.response?.data || err.message || err);
  }
}
