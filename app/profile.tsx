import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, Button, Dimensions, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../ThemeProvider"; // Import ThemeProvider hook
import { useRouter } from "expo-router"; // Import router for navigation
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

export default function Profile() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [name, setName] = useState("User");
  const [isSnoozeEnabled, setIsSnoozeEnabled] = useState(false);
  const snoozePosition = useRef(new Animated.Value(2)).current; // Position of toggle circle

  const theme = useTheme();
  const router = useRouter();

  const sheetRefs = {
    sound: useRef<BottomSheet>(null),
    privacy: useRef<BottomSheet>(null),
    developers: useRef<BottomSheet>(null),
  };

  const snapPoints = useMemo(() => ["50%", "80%"], []);

  const openSheet = useCallback((type) => {
    sheetRefs[type].current?.snapToIndex(1);
  }, []);

  const handleSheetChange = useCallback((index) => {
    console.log("Bottom Sheet index:", index);
  }, []);

  const handleToggleSnooze = () => {
    setIsSnoozeEnabled(!isSnoozeEnabled);
    Animated.timing(snoozePosition, {
      toValue: isSnoozeEnabled ? 2 : 24, // Move circle based on toggle state
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("@user");
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setProfilePicture(user?.picture || null);
          setName(user?.name || "User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("@user");
      await AsyncStorage.removeItem("@isNewUser");
      router.replace("/");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  if (!fontsLoaded) {
    return null; // Optionally render a fallback UI
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.profileRow}>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => console.log("Profile picture clicked!")}
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
              />
            ) : (
              <MaterialCommunityIcons name="account-outline" size={40} color={theme.text} />
            )}
          </View>
        </TouchableOpacity>
        <Text
          style={[styles.userName, { color: theme.text }]}
        >
          {name.length > 14 ? `${name.substring(0, 14)}` : name}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.buttonBackground }]}
          onPress={() => openSheet("sound")}
        >
          <Text style={[styles.googleButtonText, { color: theme.text }]}>Sounds</Text>
          <MaterialIcons name="chevron-right" size={30} color={theme.text} style={styles.chevronIcon}/>
          <MaterialIcons name="music-note" size={30} color={theme.text} style={styles.buttonIcon}/>
        </TouchableOpacity>

        <View style={[styles.toggleContainer, { backgroundColor: theme.buttonBackground }]}>
          <Text style={[styles.toggleLabel, { color: theme.text }]}>Snooze</Text>
          <MaterialIcons name="snooze" size={30} color={theme.text} style={styles.buttonIcon}/>
          <TouchableOpacity
            style={[
              styles.toggleSwitch,
              {
                backgroundColor: isSnoozeEnabled ? "green" : theme.buttonBackground,
              },
            ]}
            onPress={handleToggleSnooze}
          >
            <Animated.View
              style={[
                styles.toggleCircle,
                { marginLeft: snoozePosition },
              ]}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.buttonBackground }]}
          onPress={() => openSheet("privacy")}
        >
          <Text style={[styles.googleButtonText, { color: theme.text }]}>Privacy Policy</Text>
          <MaterialIcons name="chevron-right" size={30} color={theme.text} style={styles.chevronIcon}/>
          <MaterialIcons name="policy" size={30} color={theme.text} style={styles.buttonIcon}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.buttonBackground }]}
          onPress={() => openSheet("developers")}
        >
          <Text style={[styles.googleButtonText, { color: theme.text }]}>Developers</Text>
          <MaterialIcons name="chevron-right" size={30} color={theme.text} style={styles.chevronIcon}/>
          <MaterialIcons name="developer-mode" size={30} color={theme.text} style={styles.buttonIcon}/>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="Sign Out" color={theme.buttonTextColor} onPress={handleSignOut} />
      </View>

      {["sound", "privacy", "developers"].map((type) => (
        <BottomSheet
          key={type}
          ref={sheetRefs[type]}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={handleSheetChange}
          style={[
            styles.bottomSheet,
            {
              shadowColor: theme.mode === "dark" ? "#FFFFFF" : "#000000",
              borderColor: theme.mode === "dark" ? "#FFFFFF" : "#000000",
              backgroundColor: theme.background,
            },
          ]}
          backgroundStyle={{
            backgroundColor: theme.background,
          }}
          handleIndicatorStyle={{
            backgroundColor: theme.text,
          }}
        >
          <BottomSheetScrollView
            contentContainerStyle={[
              styles.contentContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <Text
              style={[
                styles.sheetContent,
                { color: theme.text },
              ]}
            >
              {type === "sound"
                ? "Sound Settings"
                : type === "privacy"
                ? "Privacy Policy Details"
                : "Developers Info"}
            </Text>
          </BottomSheetScrollView>
        </BottomSheet>
      ))}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 70,
    left: 35,
  },

  profileContainer: {
    marginRight: 10,
  },

  profileCircle: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  userName: {
    fontSize: 35,
    fontWeight: "800",
    fontFamily: "Figtree_400Regular",
  },

  buttonContainer: {
    marginTop: 40,
    alignItems: "center",
    width: "100%",
  },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    height: 68,
    padding: 16,
    borderRadius: 60,
    borderWidth: 2,
    marginVertical: 11,
    paddingHorizontal: 16,
  },

  googleButtonText: {
    fontSize: 24,
    fontWeight: "400",
  },

  chevronIcon: {
    position: "absolute", // Place it absolutely
    right: 25, // Adjust distance from the right edge
},

  buttonIcon: {
    position: "absolute", // Place it absolutely
    left: 30, // Adjust distance from the right edge
  },

  buttonWrapper: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
  },

  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    height: 68,
    padding: 16,
    borderRadius: 60,
    borderWidth: 2,
    marginVertical: 10,
    position: "relative",
  },

  toggleLabel: {
    fontSize: 24,
    fontWeight: "400",
    position: "absolute",
    textAlign: "center",
    
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 16,
    marginLeft: "auto",
    paddingHorizontal: 10, 
  },

  toggleCircle: {
  width: 29,
  height: 29,
  borderRadius: 14,
  backgroundColor: "white",
  right: 10,
  },

  bottomSheet: {
    width: Dimensions.get("window").width * 0.96,
    marginHorizontal: Dimensions.get("window").width * 0.020,
    alignSelf: "center",
    borderRadius: 90,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 10, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 13,
    elevation: 15,
    backgroundColor: "transparent",
  },

  contentContainer: {
    padding: 20,
    backgroundColor: "transparent",
  },

  sheetContent: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    padding: 20,
  },

});
