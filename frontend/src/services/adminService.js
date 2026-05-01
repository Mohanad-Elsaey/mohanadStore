import axiosInstance from './axiosInstance';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getAdminStats = async () => {
    const { data } = await axiosInstance.get('/admin/stats');
    return data;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getAdminCategories = async () => {
    const { data } = await axiosInstance.get('/admin/categories');
    return data;
};

export const createAdminCategory = async (formData) => {
    const { data } = await axiosInstance.post('/admin/categories', formData);
    return data;
};

export const updateAdminCategory = async ({ id, formData }) => {
    const { data } = await axiosInstance.post(`/admin/categories/${id}`, formData);
    return data;
};

export const deleteAdminCategory = async (id) => {
    await axiosInstance.delete(`/admin/categories/${id}`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRODUCTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getAdminProducts = async (params) => {
    const { data } = await axiosInstance.get('/admin/products', { params });
    return data;
};

export const getAdminProduct = async (id) => {
    const { data } = await axiosInstance.get(`/admin/products/${id}`);
    return data;
};

export const createAdminProduct = async (formData) => {
    const { data } = await axiosInstance.post('/admin/products', formData);
    return data;
};

export const updateAdminProduct = async ({ id, formData }) => {
    const { data } = await axiosInstance.post(`/admin/products/${id}`, formData);
    return data;
};

export const deleteAdminProduct = async (id) => {
    await axiosInstance.delete(`/admin/products/${id}`);
};

export const deleteProductImage = async ({ productId, imageId }) => {
    await axiosInstance.delete(`/admin/products/${productId}/images/${imageId}`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getAdminOrders = async (params) => {
    const { data } = await axiosInstance.get('/admin/orders', { params });
    return data;
};

export const getAdminOrder = async (id) => {
    const { data } = await axiosInstance.get(`/admin/orders/${id}`);
    return data;
};

export const updateAdminOrderStatus = async ({ id, status }) => {
    const { data } = await axiosInstance.patch(`/admin/orders/${id}/status`, { status });
    return data;
};

export const addOrderTracking = async (id, trackingNumber) => {
    const { data } = await axiosInstance.post(`/admin/orders/${id}/tracking`, {
        tracking_number: trackingNumber
    });
    return data;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getAdminUsers = async (params) => {
    const { data } = await axiosInstance.get('/admin/users', { params });
    return data;
};

export const getAdminUser = async (id) => {
    const { data } = await axiosInstance.get(`/admin/users/${id}`);
    return data;
};

export const toggleUserRole = async (id) => {
    const { data } = await axiosInstance.post(`/admin/users/${id}/toggle-role`);
    return data;
};

export const toggleUserStatus = async (id) => {
    const { data } = await axiosInstance.post(`/admin/users/${id}/toggle-status`);
    return data;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COUPONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getAdminCoupons = async () => {
    const { data } = await axiosInstance.get('/admin/coupons');
    return data;
};

export const createAdminCoupon = async (couponData) => {
    const { data } = await axiosInstance.post('/admin/coupons', couponData);
    return data;
};

export const updateAdminCoupon = async ({ id, couponData }) => {
    const { data } = await axiosInstance.put(`/admin/coupons/${id}`, couponData);
    return data;
};

export const deleteAdminCoupon = async (id) => {
    await axiosInstance.delete(`/admin/coupons/${id}`);
};

export const toggleCouponStatus = async (id) => {
    const { data } = await axiosInstance.post(`/admin/coupons/${id}/toggle`);
    return data;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getAdminSettings = async () => {
    const { data } = await axiosInstance.get('/admin/settings');
    return data;
};

export const saveAdminSettings = async (settings) => {
    const { data } = await axiosInstance.post('/admin/settings', settings);
    return data;
};