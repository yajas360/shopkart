import express from "express";
import {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";
import isAuthenticated from "../middlewares/authMiddleware.js";

const cartRoutes = express.Router();

cartRoutes.use(isAuthenticated);

cartRoutes.get("/", getCart);
cartRoutes.post("/:productId", addToCart);
cartRoutes.patch("/:productId", updateQuantity);
cartRoutes.delete("/:productId", removeFromCart);
cartRoutes.delete("/", clearCart);

export default cartRoutes;
