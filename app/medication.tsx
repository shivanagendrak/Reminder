import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider"; // Import the ThemeProvider hook

export default function Medication() {
  const theme = useTheme(); // Get the current theme

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>Medication Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
