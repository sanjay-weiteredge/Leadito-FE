import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
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
import PlanDetailsScreen from './src/mainScreen/PlanDetailsScreen';
import WorkProcessScreen from './src/mainScreen/WorkProcessScreen';
import PrivacyPolicyScreen from './src/mainScreen/PrivacyPolicyScreen';
import PerformanceSummaryScreen from './src/mainScreen/PerformanceSummaryScreen';
import PaymentInfoScreen from './src/mainScreen/PaymentInfoScreen';
import SupportScreen from './src/mainScreen/SupportScreen';
import NotificationsScreen from './src/mainScreen/NotificationsScreen';
import TermsScreen from './src/mainScreen/TermsScreen';
import RefundPolicyScreen from './src/mainScreen/RefundPolicyScreen';

import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { SweetAlertProvider } from './src/components/SweetAlert';
import CustomAlert from './src/utils/CustomAlert';

import { navigationRef } from './src/services/navigationService';

// Override global RN Alert calls so ALL screens use our new SweetAlert!
try {
  Alert.alert = CustomAlert.alert;
} catch (e) {
  console.warn("Could not patch global Alert");
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <SubscriptionProvider>
        <StatusBar style="dark" />
        {isShowSplash ? (
          <SplashScreen onFinish={() => setIsShowSplash(false)} />
        ) : (
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Intro" component={IntroSlider} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Otp" component={OtpScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Main" component={BottomTabNavigator} />
              <Stack.Screen name="Testimonials" component={TestimonialsScreen} />
              <Stack.Screen name="Services" component={AllServicesScreen} />
              <Stack.Screen name="PlanDetails" component={PlanDetailsScreen} />
              <Stack.Screen name="WorkProcess" component={WorkProcessScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
              <Stack.Screen name="PerformanceSummary" component={PerformanceSummaryScreen} />
              <Stack.Screen name="PaymentInfo" component={PaymentInfoScreen} />
              <Stack.Screen name="Support" component={SupportScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Terms" component={TermsScreen} />
              <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        )}
        <SweetAlertProvider />
      </SubscriptionProvider>
    </SafeAreaProvider>
  );
}
