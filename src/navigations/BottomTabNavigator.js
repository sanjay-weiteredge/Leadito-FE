import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../mainScreen/HomeScreen';
import AdsResultsScreen from '../mainScreen/AdsResultsScreen';
import PlansPricingScreen from '../mainScreen/PlansPricingScreen';
import LeadsScreen from '../mainScreen/LeadsScreen';
import BusinessScreen from '../mainScreen/BusinessScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#0047AB',
                tabBarInactiveTintColor: '#888',
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#f0f0f0',
                },
                tabBarLabelStyle: {
                    fontSize: 9,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    const iconSize = 20;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                        return <Ionicons name={iconName} size={iconSize} color={color} />;
                    } else if (route.name === 'Ads') {
                        return <MaterialCommunityIcons name="chart-bar" size={iconSize} color={color} />;
                    } else if (route.name === 'Plans & Pricing') {
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
            <Tab.Screen name="Plans & Pricing" component={PlansPricingScreen} />
            <Tab.Screen name="Leads" component={LeadsScreen} />
            <Tab.Screen name="Business" component={BusinessScreen} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
