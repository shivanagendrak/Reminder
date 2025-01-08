import React, { useRef, useState, useEffect } from "react";
import { View,SafeAreaView, Text, TouchableOpacity, StyleSheet, Animated, Image,Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeProvider"; // Import ThemeProvider hook
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


export default function Home() {
  const router = useRouter();

  // Animation references
  const waterScaleAnim = useRef(new Animated.Value(1)).current;
  const medicationScaleAnim = useRef(new Animated.Value(1)).current;
  const foodScaleAnim = useRef(new Animated.Value(1)).current;
  const { width, height } = Dimensions.get("window"); // Get screen dimensions

  const [profilePicture, setProfilePicture] = useState(null);

  // Load Figtree font
  const [fontsLoaded] = useFonts({
    Figtree: Figtree_400Regular,
  });

  const theme = useTheme(); // Get the current theme

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("@user");
        if (userDataString) {
          const user = JSON.parse(userDataString);
          if (user && user.picture) {
            setProfilePicture(user.picture); // Set the user's profile picture
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>; // Render a fallback while the font is loading
  }

  // Handle button press with zoom-out animation
  const handlePress = (route, animRef) => {
    Animated.sequence([
      Animated.timing(animRef, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animRef, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push(route);
    });
  };

  return (
    
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Profile Circle at Top-Left */}
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={() => router.push("/profile")}
      >
        <View
          style={[
            styles.profileCircle,
            { backgroundColor: theme.buttonBackground, borderColor: theme.buttonBorder },
          ]}
        >
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={styles.profileImage}
              onError={(error) =>
                console.error("Error loading profile picture:", error.nativeEvent.error)
              }
            />
          ) : (
            <MaterialCommunityIcons name="account-outline" size={40} color={theme.text} />
          )}
        </View>
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>Choose your Reminder</Text>

      {/* Centered Reminder Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Water Button */}
        <Animated.View style={{ transform: [{ scale: waterScaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.circleButton,
              { backgroundColor: theme.buttonBackground, borderColor: theme.buttonBorder },
            ]}
            onPress={() => handlePress("/water", waterScaleAnim)}
          >
            <Ionicons name="water-outline" size={wp(10)} color="#0B82FF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Medication Button */}
        <Animated.View style={{ transform: [{ scale: medicationScaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.circleButton,
              { backgroundColor: theme.buttonBackground, borderColor: theme.buttonBorder },
            ]}
            onPress={() => handlePress("/medication", medicationScaleAnim)}
          >
            <MaterialCommunityIcons name="pill" size={wp(10)} color="#FF212D" />
          </TouchableOpacity>
        </Animated.View>

        {/* Food Button */}
        <Animated.View style={{ transform: [{ scale: foodScaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.circleButton,
              { backgroundColor: theme.buttonBackground, borderColor: theme.buttonBorder },
            ]}
            onPress={() => handlePress("/food", foodScaleAnim)}
          >
            <MaterialCommunityIcons name="hamburger" size={wp(10)} color="#FF9613" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
  },
  profileContainer: {
    position: "absolute",
    top: hp(8),
    left: wp(8),
  },
  profileCircle: {
    width: wp(15),
    height: wp(15),
    borderRadius: 40, // Makes it a circle
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  title: {
    fontSize: wp(6),
    fontFamily: "Figtree",
    fontWeight: "400",
    marginBottom: wp(10), // Space between text and buttons
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%", // Adjust spacing of icons
    
  },
  circleButton: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(10),
    borderWidth: wp(.4),
    justifyContent: "center",
    alignItems: "center",
  },
});
