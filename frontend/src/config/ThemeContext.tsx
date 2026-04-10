import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
  dark: false,
  background: '#f5f5f5',
  card: '#fff',
  text: '#333',
  textSecondary: '#666',
  textMuted: '#999',
  border: '#ddd',
  inputBg: '#f9f9f9',
  primary: '#004BA8',
  headerBg: '#004BA8',
  tabBar: '#fff',
  tabBarBorder: '#e0e0e0',
};

export const darkTheme = {
  dark: true,
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  textSecondary: '#BDBDBD',
  textMuted: '#757575',
  border: '#333',
  inputBg: '#2C2C2C',
  primary: '#4A90D9',
  headerBg: '#1E1E1E',
  tabBar: '#1E1E1E',
  tabBarBorder: '#333',
};

export type Theme = typeof lightTheme;

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = 'app_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'dark') setIsDark(true);
    } catch {}
  };

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
