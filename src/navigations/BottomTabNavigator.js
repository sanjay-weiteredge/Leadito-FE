import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../mainScreen/HomeScreen';
import AdsResultsScreen from '../mainScreen/AdsResultsScreen';
import PlansPricingScreen from '../mainScreen/PlansPricingScreen';
import LeadsScreen from '../mainScreen/LeadsScreen';
import BusinessScreen from '../mainScreen/BusinessScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#7B61FF',
                tabBarInactiveTintColor: '#888',
                tabBarStyle: {
                    height: 65 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                    paddingTop: 10,
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#f0f0f0',
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '700',
                    marginTop: -5,
                },
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    const iconSize = 24;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                        return <Ionicons name={iconName} size={iconSize} color={color} />;
                    } else if (route.name === 'Ads') {
                        return <MaterialCommunityIcons name="chart-bar" size={iconSize} color={color} />;
                    } else if (route.name === 'Plans') {
                        iconName = focused ? 'pricetag' : 'pricetag-outline';
                        return <Ionicons name={iconName} size={iconSize} color={color} />;
                    } else if (route.name === 'Leads') {
                        iconName = focused ? 'people' : 'people-outline';
                        return <Ionicons name={iconName} size={iconSize} color={color} />;
                    } else if (route.name === 'Business') {
                        iconName = focused ? 'business' : 'business-outline';
                        return <Ionicons name={iconName} size={iconSize} color={color} />;
                    }
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Ads" component={AdsResultsScreen} />
            <Tab.Screen name="Plans" component={PlansPricingScreen} />
            <Tab.Screen name="Leads" component={LeadsScreen} />
            <Tab.Screen name="Business" component={BusinessScreen} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
