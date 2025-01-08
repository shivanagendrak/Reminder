import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, Button, Dimensions, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../ThemeProvider"; // Import ThemeProvider hook
import { useRouter } from "expo-router"; // Import router for navigation
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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

  const openSheet = useCallback(
    (type) => {
      // Close all sheets first
      Object.keys(sheetRefs).forEach((key) => {
        sheetRefs[key].current?.snapToIndex(-1); 
        sheetRefs[key].current?.close(); // Close each sheet
      });
  
      // Open the desired sheet
      sheetRefs[type].current?.snapToIndex(1);
    },
    [sheetRefs]
  );

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
          style={[styles.googleButton, { backgroundColor: theme.buttonBackground , borderColor: theme.buttonBorder}]}
          onPress={() => openSheet("sound")}
        >
          <Text style={[styles.googleButtonText, { color: theme.text }]}>Sounds</Text>
          <MaterialIcons name="chevron-right" size={30} color={theme.text} style={styles.chevronIcon}/>
          <MaterialIcons name="music-note" size={30} color={theme.text} style={styles.buttonIcon}/>
        </TouchableOpacity>

        <View style={[styles.toggleContainer, { backgroundColor: theme.buttonBackground, borderColor: theme.buttonBorder }]}>
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
          style={[styles.googleButton, { backgroundColor: theme.buttonBackground,borderColor: theme.buttonBorder }]}
          onPress={() => openSheet("privacy")}
        >
          <Text style={[styles.googleButtonText, { color: theme.text }]}>Privacy Policy</Text>
          <MaterialIcons name="chevron-right" size={30} color={theme.text} style={styles.chevronIcon}/>
          <MaterialIcons name="policy" size={30} color={theme.text} style={styles.buttonIcon}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.buttonBackground , borderColor: theme.buttonBorder}]}
          onPress={() => openSheet("developers")}
        >
          <Text style={[styles.googleButtonText, { color: theme.text }]}>Developers</Text>
          <MaterialIcons name="chevron-right" size={30} color={theme.text} style={styles.chevronIcon}/>
          <MaterialIcons name="developer-mode" size={30} color={theme.text} style={styles.buttonIcon}/>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonWrapper}>
  <Button 
    title="Sign Out" 
    color="#FF6B6B" 
    onPress={handleSignOut} 
  />
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
        {type === "sound" && (
          <View style={styles.sheetSection}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Sounds Settings</Text>
            <Text style={[styles.sheetText, { color: theme.text }]}>
              Customize your notification and alert sounds.
            </Text>
          </View>
        )}
{type === "privacy" && (
  <View style={styles.sheetSection}>
    <Text style={[styles.sheetTitle, { color: theme.text }]}>Privacy Policy</Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      Effective Date: December 24, 2024
    </Text>

    <Text style={[styles.sheetText, { color: theme.text }]}>
      Your Privacy Matters
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      Reminder (“we,” “our,” or “us”) values your privacy. This Privacy Policy outlines how we collect, use, and protect your information when you use our mobile application (“the App”).
    </Text>

    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
      Information We Collect
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      Authentication Data: We use Google Sign-In for authentication purposes. No other personal information or data is collected by the App.
    </Text>

    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
      How We Use Your Information
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      To authenticate your identity and provide access to the App.
      To ensure the security and functionality of the App.
    </Text>

    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
      Sharing Your Information
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      We do not sell your personal information. However, we may share your authentication data with:
      Google Services: To facilitate authentication and access.
      Legal Compliance: Authorities or other entities when required by law, or to protect our rights and users.
    </Text>

    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
      Data Security
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      We implement industry-standard measures to protect your authentication data from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is entirely secure.
    </Text>

    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
      Your Choices
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      Revoke Permissions: You can revoke Google Sign-In permissions through your Google account settings.
    </Text>

    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
      Third-Party Services
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      The App relies on Google Sign-In for authentication. Please review Google’s privacy policy for more details on their data handling practices.
    </Text>

    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
      Children’s Privacy
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      Our App is not intended for individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware of such data, we will delete it promptly.
    </Text>

    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
      Changes to This Policy
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      We may update this Privacy Policy from time to time. Changes will be posted within the App, and the “Effective Date” at the top will be updated. Continued use of the App signifies your acceptance of the updated terms.
    </Text>

    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
      Contact Us
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      If you have questions or concerns about this Privacy Policy, please contact us at:
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      shivaaman751@gmail.com
    </Text>
    <Text style={[styles.sheetText, { color: theme.text }]}>
      Reminder, Austin, Texas
    </Text>
  </View>
)}

        {type === "developers" && (
          <View style={styles.sheetSection}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Developers</Text>
            <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
              This app was developed by: </Text>
    <Text style={[styles.sheetSubTitle, { color: theme.text }]}>
               Shiva Nagendra Babu Kore  & Sandeep Gantasala</Text>
          </View>
        )}
      </BottomSheetScrollView>

        </BottomSheet>
      ))}
      <View style={styles.versionContainer}>
  <Text style={styles.versionText}>Version: v1.0</Text>
</View>

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(3),
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: hp(8),
    left: wp(8),
    
  },

  profileContainer: {
    marginRight: wp(5.5),
    
  },

  profileCircle: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(15),
    borderWidth: wp(.3),
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
    fontSize: wp(7),
    fontWeight: "800",
    fontFamily: "Figtree_400Regular",
  },

  buttonContainer: {
    marginTop: wp(0),
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
    borderWidth: 1,
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
    backgroundColor: "transparent",
  },

  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    height: 68,
    padding: 16,
    borderRadius: 60,
    borderWidth: 1,
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
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
  sheetSubTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  versionContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  
  versionText: {
    fontSize: 12,
    color: "#888", // Subtle color for the version text
    textAlign: "center",
  },
  
  

});
