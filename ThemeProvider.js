import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

const lightTheme = {
  mode: "light", // Added mode property
  background: "#FFFFFF",
  text: "#000000",
  googleButton: "#E2E8F0",
  googleButtonText: "#000000",
  buttonBorder: "#E0E0E0",
  buttonBackground: "#F5F5F5", // Light gray button background
  buttonText: "#4285F4", // Google blue for text/icons
  border: "#E0E0E0", // Light gray border
  shadowColor: "#000000", // Shadow color
  buttonTextColor: "#000000", // Text color for buttons
};

const darkTheme = {
  mode: "dark", // Added mode property
  background: "#121212",
  text: "#FFFFFF",
  googleButton: "#333333",
  googleButtonText: "#FFFFFF",
  buttonBorder: "#FFFFFF",
  buttonBackground: "#333333", // Dark gray button background
  buttonText: "#8AB4F8", // Lighter blue for text/icons
  border: "#444444", // Light gray border
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
