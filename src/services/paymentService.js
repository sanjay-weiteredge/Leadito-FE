import api from './api';

const paymentService = {
    createOrder: async (planId) => {
        // Placeholder for when you add payment routes to backend
        // const response = await api.post('/payments/create-order', { planId });
        // return response.data;
        console.warn('Payment routes not yet implemented in backend');
        return null;
    },

    verifyPayment: async (data) => {
        // const response = await api.post('/payments/verify', data);
        // return response.data;
        return null;
    },
};

export default paymentService;
