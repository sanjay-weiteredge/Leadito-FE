import api from './api';

const leadService = {
    listLeads: async (params) => {
        const response = await api.get('/leads', { params });
        return response.data;
    },

    createLead: async (data) => {
        const response = await api.post('/leads', data);
        return response.data;
    },

    updateLead: async (id, data) => {
        const response = await api.patch(`/leads/${id}`, data);
        return response.data;
    },

    deleteLead: async (id) => {
        const response = await api.delete(`/leads/${id}`);
        return response.data;
    },

    getLeadNotes: async (leadId) => {
        const response = await api.get(`/leads/${leadId}/notes`);
        return response.data;
    },

    addLeadNote: async (leadId, note) => {
        const response = await api.post(`/leads/${leadId}/notes`, { note });
        return response.data;
    },

    updateLeadNote: async (noteId, note) => {
        const response = await api.patch(`/leads/notes/${noteId}`, { note });
        return response.data;
    },

    deleteLeadNote: async (noteId) => {
        const response = await api.delete(`/leads/notes/${noteId}`);
        return response.data;
    },
};

export default leadService;
