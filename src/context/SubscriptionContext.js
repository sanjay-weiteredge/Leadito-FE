import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userService from '../services/userService';

const SubscriptionContext = createContext();

/** Returns a user-specific cache key based on the stored profile id. */
const getCacheKey = async () => {
    try {
        const profileStr = await AsyncStorage.getItem('userProfile');
        if (profileStr) {
            const profile = JSON.parse(profileStr);
            if (profile?.id) return `isActive_${profile.id}`;
        }
    } catch (e) { /* ignore */ }
    return null; // no user logged in yet
};

export const SubscriptionProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [expiryDate, setExpiryDate] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Fetches fresh subscription status from the API.
     * Call this AFTER the user is successfully logged in and token is saved.
     */
    const checkSubscription = async () => {
        try {
            const profile = await userService.getProfile();

            setIsActive(profile.isActive);

            if (profile.subscriptions && profile.subscriptions.length > 0) {
                setExpiryDate(profile.subscriptions[0].expiryDate);
            } else {
                setExpiryDate(null);
            }

            // Cache per-user so it never bleeds to a different user on the same device.
            const cacheKey = `isActive_${profile.id}`;
            await AsyncStorage.setItem(cacheKey, JSON.stringify(profile.isActive));
        } catch (error) {
            console.error('Error checking subscription:', error);
            // On failure, keep current value — defaults to false (safe).
        } finally {
            setLoading(false);
        }
    };

    /** Clears the current user's subscription state. Call on logout. */
    const clearSubscription = async () => {
        try {
            const key = await getCacheKey();
            if (key) await AsyncStorage.removeItem(key);
        } catch (e) { /* ignore */ }
        setIsActive(false);
        setExpiryDate(null);
    };

    useEffect(() => {
        /**
         * On app start: try to load the user-specific cache for fast initial render.
         * Only the correct user's cache will be loaded (keyed by userId).
         * If no user is logged in, cacheKey is null and we stay at false.
         *
         * NOTE: checkSubscription() is NOT called here because the token may not
         * be available yet at mount time. It is called by OtpScreen / OnboardingScreen
         * immediately after login/token is saved.
         */
        const loadCachedStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    // No token = not logged in, stay false, stop loading.
                    setLoading(false);
                    return;
                }

                // User is returning (already logged in) — load cache then refresh from API.
                const cacheKey = await getCacheKey();
                if (cacheKey) {
                    const cachedStatus = await AsyncStorage.getItem(cacheKey);
                    if (cachedStatus !== null) {
                        setIsActive(JSON.parse(cachedStatus));
                    }
                }

                // Refresh from server to get authoritative value.
                await checkSubscription();
            } catch (e) {
                console.error('Error loading subscription status:', e);
                setLoading(false);
            }
        };

        loadCachedStatus();
    }, []);

    return (
        <SubscriptionContext.Provider value={{
            isActive,
            expiryDate,
            loading,
            checkSubscription,
            clearSubscription,
            setIsActive
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
