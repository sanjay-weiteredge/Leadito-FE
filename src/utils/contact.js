import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

export const CONTACT_NUMBERS = {
    FREE: {
        TEAM: 'Sales Team',
        CALL: '8374891211',
        WHATSAPP: '8374891211', // Admin: Update this for Free User WhatsApp
    },
    PAID: {
        TEAM: 'Support Team',
        CALL: '8374891211',
        WHATSAPP: '8374891211', // Admin: Updated to unified support number
    },
};

export const getContactInfo = (user) => {
    if (user && user.isActive) {
        return CONTACT_NUMBERS.PAID;
    }
    return CONTACT_NUMBERS.FREE;
};

export const getCallNumberSync = (user) => {
    return getContactInfo(user).CALL;
};

export const getWhatsAppNumberSync = (user) => {
    return getContactInfo(user).WHATSAPP;
};

export const getContactNumberSync = (user) => {
    return getContactInfo(user).CALL; // Default to Call for legacy support
};

export const openWhatsApp = (phone, message = '') => {
    // Ensure phone is a string and clean it
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    const url = `whatsapp://send?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
        Linking.openURL(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`);
    });
};

export const makeCall = (phone) => {
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    Linking.openURL(`tel:+91${cleanPhone}`);
};
