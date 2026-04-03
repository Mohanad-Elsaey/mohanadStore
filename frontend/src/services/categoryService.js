import axiosInstance from './axiosInstance';

export const getCategories = async () => {
    const { data } = await axiosInstance.get('/categories');
    return data.data || data;
};

export const getCategoryBySlug = async (slug, params = {}) => {
    const { data } = await axiosInstance.get(`/categories/${slug}`, { params });
    return data;
};
