import axiosInstance from './axiosInstance';

export const login = async (credentials) => {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    return data;
};

export const register = async (userData) => {
    const { data } = await axiosInstance.post('/auth/register', userData);
    return data;
};

export const logout = async () => {
    const { data } = await axiosInstance.post('/auth/logout');
    return data;
};

export const getMe = async () => {
    const { data } = await axiosInstance.get('/auth/me');
    return data;
};

export const forgotPassword = async (email) => {
    const { data } = await axiosInstance.post('/auth/forgot-password', { email });
    return data;
};

export const resetPassword = async (payload) => {
    const { data } = await axiosInstance.post('/auth/reset-password', payload);
    return data;
};

export const verifyOTP = async (payload) => {
    const { data } = await axiosInstance.post('/auth/verify-otp', payload);
    return data;
};

export const resendOTP = async (email) => {
    const { data } = await axiosInstance.post('/auth/resend-otp', { email });
    return data;
};
