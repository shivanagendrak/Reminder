import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signin" options={{ title: "Sign In" }} />
        <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
        <Stack.Screen name="welcome" options={{ title: "Welcome" }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
        <Stack.Screen name="index" options={{ title: "Index" }} />
        <Stack.Screen name="water" options={{ title: "Water" }} />
        <Stack.Screen name="food" options={{ title: "Food" }} />
        <Stack.Screen name="medication" options={{ title: "Medication" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
