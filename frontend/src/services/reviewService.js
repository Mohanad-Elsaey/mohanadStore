import axiosInstance from './axiosInstance';

export const getProductReviews = async (productId) => {
    const { data } = await axiosInstance.get(`/products/${productId}/reviews`);
    return data;
};

export const submitReview = async (productId, reviewData) => {
    const { data } = await axiosInstance.post(`/products/${productId}/review`, reviewData);
    return data;
};

export const deleteReview = async (reviewId) => {
    const { data } = await axiosInstance.delete(`/reviews/${reviewId}`);
    return data;
};
