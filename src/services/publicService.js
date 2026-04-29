import api from './api';

const publicService = {
    getPlans: async () => {
        const response = await api.get('/plans');
        return response.data;
    },

    getServices: async () => {
        const response = await api.get('/services');
        return response.data;
    },

    getVideos: async () => {
        const response = await api.get('/videos');
        return response.data;
    },

    getTestimonials: async () => {
        const response = await api.get('/testimonials');
        return response.data;
    },
};

export default publicService;
