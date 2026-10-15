import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import razorpay, { key_id, key_secret, isRazorpayReady } from "../config/razorpay.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const cleanedPhone = phone.trim().replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must contain at least 10 digits',
      });
    }

    if (!addressLine1 || !addressLine1.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Address line is required',
      });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City is required',
      });
    }

    if (!state || !state.trim()) {
      return res.status(400).json({
        success: false,
        message: 'State is required',
      });
    }

    if (!pincode || !pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must contain 6 digits',
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer || !Array.isArray(customer.cart) || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.',
      });
    }

    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of customer.cart) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One of the products in your cart is no longer available.',
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });

      calculatedTotal += product.price * item.quantity;
    }

    const shopKartOrder = new Order({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount: calculatedTotal,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    await shopKartOrder.save();

    const amountInPaise = Math.round(calculatedTotal * 100);

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay payment gateway is not initialized on server',
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: shopKartOrder._id.toString(),
    });

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      key: key_id,
      order: shopKartOrder,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating order',
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this order',
      });
    }

    const trustedOrderId = order.razorpayOrderId || razorpay_order_id;
    const body = `${trustedOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.',
      });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying payment',
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching orders',
    });
  }
};

export const getMyOrders = getOrders;

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching order details',
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify this order',
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating order status',
    });
  }
};
