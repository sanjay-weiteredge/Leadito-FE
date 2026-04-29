import api from './api';

const userService = {
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    updateOnboarding: async (data) => {
        const response = await api.post('/user/onboard', data);
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/user/profile', data);
        return response.data;
    },

    getAdsResults: async (params) => {
        const response = await api.get('/ads-results', { params });
        return response.data;
    },
};

export default userService;
