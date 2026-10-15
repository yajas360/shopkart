import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const getPopulatedCart = async (userId) => {
  const customer = await Customer.findById(userId).populate({
    path: 'cart.product',
    select: '_id name description price category image stock createdAt',
  });

  if (!customer) return [];

  return (customer.cart || []).filter((item) => item.product !== null);
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!Array.isArray(req.user.cart)) {
      req.user.cart = [];
    }

    const existingItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product is out of stock',
        });
      }

      req.user.cart.push({
        product: productId,
        quantity: 1,
      });
    } else {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock} available)`,
        });
      }

      existingItem.quantity = newQuantity;
    }

    await req.user.save();
    const updatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding to cart',
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching cart',
    });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    if (quantity === undefined || quantity === null || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number',
      });
    }

    const numQuantity = Number(quantity);

    if (numQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!Array.isArray(req.user.cart)) {
      req.user.cart = [];
    }

    const existingItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    if (numQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock (${product.stock} available)`,
      });
    }

    existingItem.quantity = numQuantity;
    await req.user.save();

    const updatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart quantity',
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    if (!Array.isArray(req.user.cart)) {
      req.user.cart = [];
    }

    const itemIndex = req.user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    req.user.cart.splice(itemIndex, 1);
    await req.user.save();

    const updatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing from cart',
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    req.user.cart = [];
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: [],
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error clearing cart',
    });
  }
};
