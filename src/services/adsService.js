import api from './api';

const adsService = {
    getAdsResults: async (params) => {
        const response = await api.get('/ads-results', { params });
        return response.data;
    },
};

export default adsService;
