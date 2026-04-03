import axiosInstance from './axiosInstance';

export const getProducts = async (params) => {
    const { data } = await axiosInstance.get('/products', { params });
    return data;
};

export const getFeaturedProducts = async () => {
    const { data } = await axiosInstance.get('/products/featured');
    return data.data || data;
};

export const getNewArrivals = async () => {
    const { data } = await axiosInstance.get('/products/new-arrivals');
    return data.data || data;
};

export const getBestSellers = async () => {
    const { data } = await axiosInstance.get('/products/best-sellers');
    return data.data || data;
};

export const getProductBySlug = async (slug) => {
    const { data } = await axiosInstance.get(`/products/${slug}`);
    return data.data || data;
};
