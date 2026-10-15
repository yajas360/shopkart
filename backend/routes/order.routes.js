import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    getOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus
} from "../controllers/order.controller.js";
import isAuthenticated from "../middlewares/authMiddleware.js";

const orderRoutes = express.Router();

orderRoutes.use(isAuthenticated);

orderRoutes.post("/create-payment-order", createPaymentOrder);
orderRoutes.post("/", createPaymentOrder);
orderRoutes.post("/verify-payment", verifyPayment);
orderRoutes.get("/", getOrders);
orderRoutes.get("/:id", getOrderById);
orderRoutes.patch("/:id/status", updateOrderStatus);

export default orderRoutes;
