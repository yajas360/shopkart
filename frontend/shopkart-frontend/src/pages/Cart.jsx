import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, subtotal, cartCount, uniqueItemsCount, fetchCart, clearCart } = useCart();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) return;
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;
    await clearCart();
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] px-4 py-8 md:py-12 flex-1" id="cart-loading-state">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col items-center justify-center py-16 bg-[#111B2E] rounded-3xl border border-[#1E2D4A]">
              <div className="w-12 h-12 border-4 border-[#1E2D4A] border-t-[#3B82F6] rounded-full animate-spin mb-4" />
              <p className="text-[#EAF2FF] font-semibold text-base">Loading your cart...</p>
              <p className="text-[#94A3B8] text-xs mt-1">Retrieving your items from the server...</p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-5 rounded-2xl bg-[#111B2E] border border-[#1E2D4A] animate-pulse flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-[#080D18]" />
                    <div className="space-y-2">
                      <div className="w-40 h-4 bg-[#1E2D4A] rounded" />
                      <div className="w-24 h-3 bg-[#1E2D4A] rounded" />
                    </div>
                  </div>
                  <div className="w-24 h-8 bg-[#1E2D4A] rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 flex-1" id="cart-error-state">
          <div className="max-w-md w-full bg-[#111B2E] border border-rose-500/30 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#EAF2FF]">Unable to load your cart.</h2>
            <p className="text-sm text-[#94A3B8]">{error}</p>
            <button
              onClick={fetchCart}
              className="mt-4 px-6 py-2.5 rounded-xl font-semibold text-sm text-[#EAF2FF] bg-[#3B82F6] hover:bg-[#2563EB] shadow-md cursor-pointer transition-all"
              id="try-again-cart-btn"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 flex-1" id="cart-empty-state">
          <div className="max-w-md w-full bg-[#111B2E] border border-[#1E2D4A] rounded-3xl p-10 text-center space-y-5 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/25 flex items-center justify-center text-[#60A5FA] text-3xl shadow-inner">
              🛒
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#EAF2FF]">
                Your cart is empty
              </h2>
              <p className="text-sm text-[#94A3B8] max-w-xs mx-auto leading-relaxed">
                Looks like you haven't added anything to your cart yet.
              </p>
            </div>
            <div>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#EAF2FF] bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/30 transition-all cursor-pointer"
                id="browse-products-btn"
              >
                <span>Browse Products</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] px-4 py-8 md:py-12 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1E2D4A] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#60A5FA]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#EAF2FF] tracking-tight">
                  My Cart
                </h1>
              </div>
              <p className="text-[#94A3B8] text-sm mt-2">
                <strong className="text-[#60A5FA]">{cartCount}</strong>{' '}
                {cartCount === 1 ? 'total item' : 'total items'} ({uniqueItemsCount} unique products)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClearCart}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all cursor-pointer"
              >
                Clear Cart
              </button>
              <Link
                to="/products"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#EAF2FF] hover:text-[#60A5FA] bg-[#111B2E] border border-[#1E2D4A] hover:border-[#3B82F6]/40 transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.product?._id || item._id}
                  item={item}
                />
              ))}
            </div>

            <div className="bg-[#111B2E] border border-[#1E2D4A] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl shadow-black/40 sticky top-24">
              <h2 className="text-xl font-extrabold text-[#EAF2FF] pb-4 border-b border-[#1E2D4A]">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Items Count ({uniqueItemsCount} products)</span>
                  <span className="font-semibold text-[#EAF2FF]" id="summary-items-count">{cartCount} units</span>
                </div>

                <div className="flex justify-between text-[#94A3B8]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#EAF2FF] text-base" id="summary-subtotal">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-[#94A3B8]">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>

                <div className="pt-4 border-t border-[#1E2D4A] flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#EAF2FF]">Total</span>
                  <span className="text-2xl font-black text-[#60A5FA]" id="summary-total">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                type="button"
                className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-[#EAF2FF] bg-[#3B82F6] hover:bg-[#2563EB] shadow-xl shadow-[#3B82F6]/30 hover:shadow-[#3B82F6]/50 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                id="proceed-to-checkout-btn"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div className="text-center">
                <span className="text-xs text-[#94A3B8] flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Secure 256-bit encrypted checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
