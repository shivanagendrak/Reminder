import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts, Figtree_800ExtraBold } from "@expo-google-fonts/figtree";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../ThemeProvider"; // Import the ThemeProvider hook

export default function Welcome() {
  const [name, setName] = useState("User");
  const [displayedName, setDisplayedName] = useState("");
  const router = useRouter();
  const theme = useTheme(); // Get the current theme

  // Load the Figtree font
  const [fontsLoaded] = useFonts({
    Figtree: Figtree_800ExtraBold,
  });

  useEffect(() => {
    async function fetchName() {
      try {
        const userData = await AsyncStorage.getItem("@user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.name) {
            setName(user.name); // Use the `name` property
          } else {
            setName("User");
          }
        } else {
          setName("User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setName("User");
      }
    }

    fetchName();
  }, []);

  useEffect(() => {
    // Reset displayedName and initialize animation
    let currentIndex = 0;
    setDisplayedName(""); // Reset displayed name before starting

    const timer = setInterval(() => {
      if (currentIndex <= name.length) {
        // Use string slicing to avoid skipping letters
        setDisplayedName(name.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer); // Stop animation when complete
      }
    }, 250); // Adjust speed of animation (150ms per letter)

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, [name]); // Run animation whenever the name changes

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const proceedToHome = async () => {
    await AsyncStorage.setItem("@isNewUser", "false"); // Mark user as not new
    router.replace("/home"); // Navigate to Home Page
  };

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text, fontFamily: "Figtree" }]}>
        Hello{" "}
        {displayedName.length > 10
          ? `${capitalizeFirstLetter(displayedName.slice(0, 10))}`
          : capitalizeFirstLetter(displayedName)}
        !
      </Text>

      <Text style={[styles.subheading, { color: theme.text, fontFamily: "Figtree" }]}>
        Choose your Reminder
      </Text>

      <View style={styles.buttonContainer}>
        {/* Water Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.border }]}
          onPress={async () => {
            await proceedToHome();
            router.push("/water");
          }}
        >
          <Ionicons
            name="water-outline"
            size={35}
            color="#0B82FF"
            style={styles.icon}
          />
          <Text style={[styles.buttonText, { color: theme.text }]}>Water</Text>
        </TouchableOpacity>

        {/* Medication Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.border }]}
          onPress={async () => {
            await proceedToHome();
            router.push("/medication");
          }}
        >
          <MaterialCommunityIcons
            name="pill"
            size={35}
            color="#FF212D"
            style={styles.icon}
          />
          <Text style={[styles.buttonText, { color: theme.text }]}>Medication</Text>
        </TouchableOpacity>

        {/* Food Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.border }]}
          onPress={async () => {
            await proceedToHome();
            router.push("/food");
          }}
        >
          <MaterialCommunityIcons
            name="hamburger"
            size={35}
            color="#FF9613"
            style={styles.icon}
          />
          <Text style={[styles.buttonText, { color: theme.text }]}>Food</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // Start from the top
    alignItems: "center",
    padding: 16,
  },
  heading: {
    fontSize: 40,
    marginTop: 110,
    marginBottom: 10,
    textAlign: "center",
    height: 50, // Fixed height to prevent layout shift
    overflow: "hidden", // Ensure no overflow
  },
  subheading: {
    fontSize: 24,
    marginBottom: 10,
    marginTop: 100,
    fontWeight: "500", // Add margin to separate it from the heading
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 30, // Adjust spacing from the subheading
  },
  button: {
    flexDirection: "row",
    alignItems: "center", // Center align items vertically
    justifyContent: "space-between", // Add spacing between icon and text
    width: "80%",
    height: 68,
    padding: 16,
    paddingVertical: 16,
    paddingHorizontal: 30,
    marginVertical: 14,
    borderRadius: 60,
    borderWidth: 2,
    
  },
  icon: {
    width: 40, // Set a fixed width for the icon
    height: 40, // Set a fixed height for the icon
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "400",
    flex: 1, // Allow the text to take remaining space
    textAlign: "center", // Center align text
  },
});
