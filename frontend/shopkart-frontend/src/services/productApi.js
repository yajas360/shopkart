import api from "./api";

export const getProducts = async (search = "", category = "", sort = "") => {
    const params = {};

    if (search.trim()) {
        params.search = search.trim();
    }

    if (category) {
        params.category = category;
    }

    if (sort) {
        params.sort = sort;
    }

    const response = await api.get("/products", {
        params
    });

    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);

    return response.data;
};