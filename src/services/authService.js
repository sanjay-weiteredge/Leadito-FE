import api from './api';

const authService = {
    sendOtp: async (phone) => {
        const response = await api.post('auth/send-otp', { phone });
        return response.data;
    },

    verifyOtp: async (phone, otp) => {
        const response = await api.post('auth/verify-otp', { phone, otp });
        return response.data;
    },

    verifyFirebaseOtp: async (idToken) => {
        const response = await api.post('auth/verify-firebase-otp', { idToken });
        return response.data;
    },

    onboarding: async (data) => {
        const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await api.post('auth/onboarding', data, config);
        return response.data;
    },
};

export default authService;
