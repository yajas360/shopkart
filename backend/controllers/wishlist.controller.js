import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID format"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const alreadyInWishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyInWishlist) {
            return res.status(409).json({
                message: "Product already in wishlist"
            });
        }

        customer.wishlist.push(productId);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });

    } catch (error) {
        console.error("Add to Wishlist Error:", error);
        return res.status(500).json({
            message: error.message || "Internal Server Error"
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name description price category image stock createdAt"
        });

        if (!customer) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const validWishlist = (customer.wishlist || []).filter(item => item !== null);

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist
        });

    } catch (error) {
        console.error("Get Wishlist Error:", error);
        return res.status(500).json({
            message: error.message || "Internal Server Error"
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID format"
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const inWishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!inWishlist) {
            return res.status(404).json({
                message: "Product not in wishlist"
            });
        }

        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        console.error("Remove from Wishlist Error:", error);
        return res.status(500).json({
            message: error.message || "Internal Server Error"
        });
    }
};

export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID format"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const inWishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (inWishlist) {
            customer.wishlist = customer.wishlist.filter(
                (id) => id.toString() !== productId
            );
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: false,
                message: "Product removed from wishlist"
            });
        } else {
            customer.wishlist.push(productId);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: true,
                message: "Product added to wishlist"
            });
        }

    } catch (error) {
        console.error("Toggle Wishlist Error:", error);
        return res.status(500).json({
            message: error.message || "Internal Server Error"
        });
    }
};
