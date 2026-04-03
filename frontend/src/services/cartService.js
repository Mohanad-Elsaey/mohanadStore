import axiosInstance from './axiosInstance';

export const getCart = async () => {
    const { data } = await axiosInstance.get('/cart');
    return data;
};

export const addToCart = async (payload) => {
    const { data } = await axiosInstance.post('/cart/add', payload);
    return data;
};

export const updateCartItem = async (itemId, quantity) => {
    const { data } = await axiosInstance.patch(`/cart/${itemId}`, { quantity });
    return data;
};

export const removeFromCart = async (itemId) => {
    const { data } = await axiosInstance.delete(`/cart/${itemId}`);
    return data;
};

export const clearCart = async () => {
    const { data } = await axiosInstance.delete('/cart');
    return data;
};

export const applyCoupon = async (code) => {
    const { data } = await axiosInstance.post('/cart/coupon', { code });
    return data;
};

export const removeCoupon = async () => {
    const { data } = await axiosInstance.delete('/cart/coupon');
    return data;
};
