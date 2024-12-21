import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  googleButton: '#F0F0F0',
  googleButtonText: '#000000',
  buttonBorder: '#E0E0E0',
  buttonBackground: "#F5F5F5", // Light gray button background
  buttonText: "#4285F4", // Google blue for text/icons
  border: "#E0E0E0", // Light gray border
};

const darkTheme = {
  background: '#121212',
  text: '#FFFFFF',
  googleButton: '#333333',
  googleButtonText: '#FFFFFF',
  buttonBorder: '#444444',
  buttonBackground: "#333333", // Dark gray button background
  buttonText: "#8AB4F8", // Lighter blue for text/icons
  border: "#444444", // Light gray border
  
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => (colorScheme === 'dark' ? darkTheme : lightTheme), [colorScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
