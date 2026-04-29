import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

export const CONTACT_NUMBERS = {
    FREE: '8374891211',
    PAID: '9912526055',
};

export const getContactNumber = async () => {
    try {
        const profileStr = await AsyncStorage.getItem('userProfile');
        if (profileStr) {
            const user = JSON.parse(profileStr);
            // If user is active, they are considered a Paid User
            if (user.isActive) {
                return CONTACT_NUMBERS.PAID;
            }
        }
        return CONTACT_NUMBERS.FREE;
    } catch (error) {
        console.error('Error getting contact number:', error);
        return CONTACT_NUMBERS.FREE;
    }
};

export const getContactNumberSync = (user) => {
    if (user && user.isActive) {
        return CONTACT_NUMBERS.PAID;
    }
    return CONTACT_NUMBERS.FREE;
};

export const openWhatsApp = (phone, message = '') => {
    const url = `whatsapp://send?phone=91${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
        // Fallback to web link if WhatsApp app is not installed
        Linking.openURL(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`);
    });
};

export const makeCall = (phone) => {
    Linking.openURL(`tel:+91${phone}`);
};
