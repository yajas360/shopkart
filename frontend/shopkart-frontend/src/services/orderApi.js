import api from "./api";

export const createPaymentOrder = async (shippingAddress) => {
    const response = await api.post("/orders/create-payment-order", {
        shippingAddress
    });
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await api.post("/orders/verify-payment", paymentData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get("/orders");
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
};
