import { Stack } from 'expo-router';
import { ThemeProvider } from '../ThemeProvider'; // Import the ThemeProvider

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

