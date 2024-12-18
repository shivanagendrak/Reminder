import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import { useNavigation } from "expo-router";

export default function HomeScreen() {
  const navigation = useNavigation();

  // Load Figtree font
  const [fontsLoaded] = useFonts({
    Figtree: Figtree_400Regular,
  });

  if (!fontsLoaded) {
    return <View />; // Empty view while font is loading
  }

  return (
    <View style={styles.container}>
      {/* Profile Circle at Top-Left */}
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={() => navigation.navigate("profile")}
      >
        <View style={styles.profileCircle}>
          <MaterialCommunityIcons name="account-outline" size={40} color="#292D32" />
        </View>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Choose your Reminder</Text>

      {/* Centered Reminder Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Water Button */}
        <TouchableOpacity style={styles.circleButton} onPress={() => navigation.navigate("water")}>
          <Ionicons name="water-outline" size={35} color="#4a90e2" />
        </TouchableOpacity>

        {/* Medication Button */}
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.navigate("medication")}
        >
          <MaterialCommunityIcons name="pill" size={35} color="#ff5a5a" />
        </TouchableOpacity>

        {/* Food Button */}
        <TouchableOpacity style={styles.circleButton} onPress={() => navigation.navigate("food")}>
          <MaterialCommunityIcons name="hamburger" size={35} color="#f5a623" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
  },
  profileContainer: {
    position: "absolute",
    top: 70,
    left: 35,
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 40, // Makes it a circle
    borderWidth: 2,
    borderColor: "#E2E8F0", // Light gray border
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 25,
    fontFamily: "Figtree",
    fontWeight: "400",
    marginBottom: 50, // Space between text and buttons
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%", // Adjust spacing of icons
  },
  circleButton: {
    width: 65,
    height: 65,
    borderRadius: 200,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});

