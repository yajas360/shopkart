import api from "./api";

export const getCart = async () => {
    const response = await api.get("/cart");
    return response.data;
};

export const addToCart = async (productId) => {
    const response = await api.post(`/cart/${productId}`);
    return response.data;
};

export const updateQuantity = async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    return response.data;
};

export const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
};

export const clearCart = async () => {
    const response = await api.delete("/cart");
    return response.data;
};
