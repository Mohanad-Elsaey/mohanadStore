import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: true
});

// Add token if it exists
axiosInstance.interceptors.request.use((config) => {
    const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
