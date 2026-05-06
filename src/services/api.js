import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { navigate } from './navigationService';

export const BASE_URL = 'https://leaditoai.com/api/';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        // Don't add token for public routes to avoid 'malformed token' errors
        const publicRoutes = ['auth/send-otp', 'auth/verify-otp', 'plans', 'services', 'videos', 'testimonials'];
        const isPublicRoute = publicRoutes.some(route => config.url.includes(route));

        if (!isPublicRoute) {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 403) {
            // Subscription expired or inactive
            console.log('Access denied: Subscription missing or expired.');

            // Redirect to Main (BottomTabNavigator) and then to Plans & Pricing tab
            // Note: Since 'Main' is the stack screen name, we navigate to 'Main' 
            // and then nested navigation should handle the tab.
            // Or if we targets 'Plans & Pricing' screen directly if it's in the stack.
            // In Leadito, Plans is a tab.
            navigate('Main', { screen: 'Plans' });
        }
        return Promise.reject(error);
    }
);

export default api;
