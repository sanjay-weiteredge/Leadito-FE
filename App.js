import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/authScreens/SplashScreen';
import IntroSlider from './src/authScreens/IntroSlider';
import LoginScreen from './src/authScreens/LoginScreen';
import OtpScreen from './src/authScreens/OtpScreen';
import OnboardingScreen from './src/authScreens/OnboardingScreen';
import BottomTabNavigator from './src/navigations/BottomTabNavigator';
import TestimonialsScreen from './src/mainScreen/TestimonialsScreen';
import AllServicesScreen from './src/mainScreen/AllServicesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {isShowSplash ? (
        <SplashScreen onFinish={() => setIsShowSplash(false)} />
      ) : (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Intro" component={IntroSlider} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="Testimonials" component={TestimonialsScreen} />
            <Stack.Screen name="Services" component={AllServicesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
