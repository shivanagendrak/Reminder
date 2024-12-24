import React, { useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Figtree_400Regular } from '@expo-google-fonts/figtree';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from 'expo-router';
import { useTheme } from '../ThemeProvider'; // Import ThemeProvider hook



export default function Index() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '554820962895-kid09j0fcjq2gemg0pk21os1scsbkdva.apps.googleusercontent.com',
    webClientId: '368589568806-aophjm29ouh1r35c7b81ne3jq8816jkt.apps.googleusercontent.com',
  });

  const theme = useTheme(); // Get the current theme
  const [fontsLoaded] = useFonts({ Figtree: Figtree_400Regular });

  // Animation references
  const googleButtonAnim = useRef(new Animated.Value(1)).current;
  const letterAnims = useRef(
    Array.from({ length: 'Reminder'.length }, () => new Animated.Value(50))
  ).current;
  const waveAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const icons = [
    { IconComponent: Ionicons, name: 'water-outline', size: 34, color: '#0B82FF' },
    { IconComponent: MaterialCommunityIcons, name: 'pill', size: 34, color: '#FF212D' },
    { IconComponent: MaterialCommunityIcons, name: 'hamburger', size: 34, color: '#FF9613' },
  ];

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      handleSignIn(response.authentication.accessToken);
    }
  }, [response]);

  useEffect(() => {
    // Animate "Reminder" letters sequentially
    letterAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 500,
        delay: index * 300,
        useNativeDriver: true,
      }).start();
    });

    waveAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000,
            delay: index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  async function checkLoginStatus() {
    const user = await AsyncStorage.getItem('@user');
    if (user) {
      const isNewUser = await AsyncStorage.getItem('@isNewUser');
      if (isNewUser === 'false') {
        router.replace('/home');
      } else {
        router.replace('/welcome');
      }
    }
  }

  async function handleSignIn(token) {
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await userInfoResponse.json();
      await AsyncStorage.setItem('@user', JSON.stringify(userInfo));
      await AsyncStorage.setItem('@isNewUser', 'true');
      router.replace('/welcome');
    } catch (error) {
      console.error('Sign-in failed', error);
    }
  }

  const animateGoogleButton = () => {
    Animated.sequence([
      Animated.timing(googleButtonAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(googleButtonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      promptAsync();
    });
  };

  const getWaveStyle = (index) => ({
    transform: [
      {
        translateY: waveAnims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
    ],
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headingContainer}>
        {/* <Text style={[styles.headingStatic, { fontFamily: 'Figtree', color: theme.text }]}>
          Welcome to{' '}
        </Text> */}
        {/* {Array.from('Reminder').map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.headingAnimatedLetter,
              {
                color: theme.text,
                transform: [
                  {
                    translateX: letterAnims[index],
                  },
                ],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))} */}
      </View>
      <View style={styles.iconsContainer}>
        {icons.map((icon, index) => (
          <Animated.View key={index} style={[styles.iconWrapper, getWaveStyle(index)]}>
            <icon.IconComponent name={icon.name} size={icon.size} color={icon.color} />
          </Animated.View>
        ))}
      </View>
      <Animated.View style={{ transform: [{ scale: googleButtonAnim }] }}>
        <TouchableOpacity
          style={[
            styles.googleButton,
            { backgroundColor: theme.googleButton, borderColor: theme.buttonBorder },
          ]}
          onPress={animateGoogleButton}
        >
          <Ionicons name="logo-google" size={25} color="#4285F4" style={styles.googleIcon} />
          <Text
            style={[
              styles.googleButtonText,
              { color: theme.googleButtonText, fontFamily: 'Figtree' },
            ]}
          >
            Sign in with Google
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 300,
    marginTop: -150,
  },
  headingStatic: {
    fontSize: 35,
    fontWeight: '400',
  },
  headingAnimatedLetter: {
    fontSize: 35,
    fontWeight: '400',
    fontFamily: 'Figtree',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
    marginBottom: 130,
    marginTop: -230,
  },
  iconWrapper: {
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 19,
    fontWeight: '400',
  },
});
