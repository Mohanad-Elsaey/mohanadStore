import axiosInstance from './axiosInstance';

export const getWishlist = async () => {
    const { data } = await axiosInstance.get('/wishlist');
    return data;
};

export const toggleWishlist = async (productId) => {
    const { data } = await axiosInstance.post(`/wishlist/${productId}/toggle`);
    return data;
};

// Keeping this for backward compatibility if needed, but the backend uses toggle
export const removeFromWishlist = async (productId) => {
    const { data } = await axiosInstance.post(`/wishlist/${productId}/toggle`);
    return data;
};
