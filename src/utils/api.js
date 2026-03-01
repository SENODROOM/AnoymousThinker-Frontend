import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://anoymous-thinker-api.vercel.app'
        : 'http://localhost:5000',
    withCredentials: true
});

// Helper to set the Auth token
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
