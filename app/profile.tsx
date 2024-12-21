import React from "react";
import { Text, View, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTheme } from "../ThemeProvider"; // Import ThemeProvider hook

export default function Profile() {
  const router = useRouter();
  const theme = useTheme(); // Get the current theme

  async function handleSignOut() {
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@isNewUser");
    router.replace("/"); // Navigate back to the Sign-In screen
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Profile Page</Text>
      <Text style={[styles.subheading, { color: theme.text }]}>
        Manage your account here.
      </Text>

      {/* Sign Out Button */}
      <View style={styles.buttonWrapper}>
        <Button
          title="Sign Out"
          color={theme.buttonTextColor} // Use theme-based button text color
          onPress={handleSignOut}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonWrapper: {
    marginVertical: 10,
    borderRadius: 8, // Add some styling for aesthetics
    overflow: "hidden", // To ensure rounded edges apply to Button
  },
});
