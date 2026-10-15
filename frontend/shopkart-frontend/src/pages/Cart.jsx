import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, cartCount, loading, error, clearCart } = useCart();

  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product?.price) || 0;
    return acc + price * item.quantity;
  }, 0);

  const uniqueItemsCount = cartItems.length;

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to remove all items from your cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20" id="cart-loading-state">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-500">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4" id="cart-error-state">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-red-600">Error Loading Cart</h2>
            <p className="text-sm text-slate-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-16" id="cart-empty-state">
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 text-2xl font-bold">
              🛒
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">
                Your cart is empty
              </h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                Add products from our catalog to get started.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 transition-colors cursor-pointer"
                id="browse-products-btn"
              >
                <span>Browse Products</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="px-4 py-8 md:py-10 flex-1">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Shopping Cart
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                <span className="font-semibold text-slate-900">{cartCount}</span> {cartCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleClearCart}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition cursor-pointer"
              >
                Clear Cart
              </button>
              <Link
                to="/products"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <CartItem
                  key={item.product?._id || item._id}
                  item={item}
                />
              ))}
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs sticky top-24">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Items ({uniqueItemsCount} products)</span>
                  <span className="font-semibold text-slate-800" id="summary-items-count">{cartCount} units</span>
                </div>

                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900" id="summary-subtotal">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">FREE</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-900" id="summary-total">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                type="button"
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-emerald-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
                id="proceed-to-checkout-btn"
              >
                <span>Proceed to Checkout</span>
                <span>&rarr;</span>
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-slate-400">
                  🔒 Razorpay test payment with instant receipt
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
