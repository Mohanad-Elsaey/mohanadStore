import axiosInstance from './axiosInstance';

export const getOrders = async () => {
    const { data } = await axiosInstance.get('/orders');
    return data;
};

export const getOrderDetails = async (orderNumber) => {
    const { data } = await axiosInstance.get(`/orders/${orderNumber}`);
    return data;
};

export const placeOrder = async (orderData) => {
    const { data } = await axiosInstance.post('/orders', orderData);
    return data;
};

export const cancelOrder = async (orderNumber, note) => {
    const { data } = await axiosInstance.post(`/orders/${orderNumber}/cancel`, { note });
    return data;
};
export const completeOrder = async (orderNumber) => {
    const { data } = await axiosInstance.post(`/orders/${orderNumber}/complete`);
    return data;
};
