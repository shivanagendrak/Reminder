import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

const lightTheme = {
  mode: "light", // Added mode property
  background: "#FFFFFF",
  text: "#000000",
  googleButton: "#FFFFFF",
  googleButtonText: "#000000",
  buttonBorder: "#E0E0E0",
  buttonBackground: "#FFFFFF", // Light gray button background
  buttonText: "#000000", // Google blue for text/icons
  border: "#E0E0E0", // Light gray border
  shadowColor: "#000000", // Shadow color
  buttonTextColor: "#000000", // Text color for buttons
};

const darkTheme = {
  mode: "dark", // Added mode property
  background: "#0E0F0E",
  text: "#FFFFFF",
  googleButton: "#0E0F0E",
  googleButtonText: "#FFFFFF",
  buttonBorder: "#FFFFFF",
  buttonBackground: "#0E0F0E", // Dark gray button background
  buttonText: "#FFFFFF", // Lighter blue for text/icons
  border: "#FFFFFF", // Light gray border
  shadowColor: "#FFFFFF", // White shadow for dark mode
  buttonTextColor: "#FFFFFF", // White button text
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => (colorScheme === "dark" ? darkTheme : lightTheme), [colorScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
