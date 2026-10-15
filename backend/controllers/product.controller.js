import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body;

        if (!name ||!description || !category ||!image ||price === undefined ||stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const numericPrice = Number(price);
        const numericStock = Number(stock);

        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0"
            });
        }

        if (!Number.isInteger(numericStock) || numericStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative"
            });
        }

        const product = await Product.create({
            name,
            description,
            price: numericPrice,
            category,
            image,
            stock: numericStock
        });

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;

        const query = {};

        if (search && search.trim()) {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.name = {
                $regex: escapedSearch,
                $options: "i"
            };
        }

        if (category && category.trim()) {
            query.category = category.trim();
        }

        let sortOption = { createdAt: -1 };

        if (sort === "price_asc") {
            sortOption = { price: 1 };
        } else if (sort === "price_desc") {
            sortOption = { price: -1 };
        }

        const products = await Product.find(query)
            .select("name price category image stock")
            .sort(sortOption);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};