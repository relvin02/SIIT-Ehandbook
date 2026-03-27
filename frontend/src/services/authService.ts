import AsyncStorage from '@react-native-async-storage/async-storage';

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    if (!token) return false;
    // In a real app, you'd verify the JWT on the backend
    // For now, we'll just check if the token exists
    return token.length > 0;
  } catch (error) {
    return false;
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

export const clearAuthStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};
