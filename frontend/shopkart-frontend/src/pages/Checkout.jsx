import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { loadRazorpayScript } from '../utils/loadRazorpay';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, cartCount, loading: cartLoading, fetchCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isCartEmpty = !cartLoading && cartItems.length === 0;

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    if (cartItems.length === 0) {
      setSubmitError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Initialize order on backend
      const res = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to initialize order on server');
      }

      const orderData = res.data;

      // 2. Load Razorpay Checkout SDK
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
      }

      // 3. Configure Razorpay modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ShopKart',
        description: `Order #${orderData.shopKartOrderId}`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            setIsSubmitting(true);
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId: orderData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              await fetchCart();
              navigate(`/order-success/${orderData.shopKartOrderId}`);
            } else {
              setSubmitError(verifyRes.data?.message || 'Payment verification failed');
            }
          } catch (verifyErr) {
            setSubmitError(
              verifyErr.response?.data?.message || 'Payment verification failed on the server.'
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        theme: {
          color: '#3B82F6',
          backdrop_color: 'rgba(8, 13, 24, 0.85)',
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (failRes) {
        console.error('Payment failed:', failRes.error);
        setSubmitError(
          `Payment failed: ${failRes.error?.description || 'Transaction declined'}. Cart preserved.`
        );
        setIsSubmitting(false);
      });
      paymentObject.open();
    } catch (err) {
      console.error('Order creation error:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to place order';
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };

  if (isCartEmpty) {
    return (
      <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 flex-1">
          <div className="max-w-md w-full bg-[#111B2E] border border-[#1E2D4A] rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-3xl">
              🛒
            </div>
            <h2 className="text-2xl font-bold text-[#EAF2FF]">Your Cart is Empty</h2>
            <p className="text-sm text-[#94A3B8]">
              You cannot proceed to checkout without any products in your cart.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 py-8 md:py-12 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2 border-b border-[#1E2D4A] pb-6">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Link to="/products" className="hover:text-[#60A5FA] transition-colors">
                Products
              </Link>
              <span>/</span>
              <Link to="/cart" className="hover:text-[#60A5FA] transition-colors">
                Cart
              </Link>
              <span>/</span>
              <span className="text-[#60A5FA] font-semibold">Checkout</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-black text-[#EAF2FF] tracking-tight flex items-center gap-3">
                <span>Secure Checkout</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/30 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></span>
                  Razorpay Gateway
                </span>
              </h1>
            </div>
          </div>

          {submitError && (
            <div
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 shadow-lg"
              id="checkout-error-banner"
            >
              <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-rose-200">Payment Issue</p>
                <p className="mt-0.5 text-xs text-rose-300/90">{submitError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Shipping Form & Payment Method */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#111B2E] border border-[#1E2D4A] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#60A5FA]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[#EAF2FF]">Shipping Details</h2>
                  </div>
                  <span className="text-xs text-[#94A3B8]">All fields required</span>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4" id="shipping-form" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Aarav Sharma"
                        className={`w-full px-4 py-3 rounded-xl bg-[#080D18] border text-sm text-[#EAF2FF] placeholder-[#94A3B8]/50 focus:outline-none transition-all ${
                          errors.fullName
                            ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                            : 'border-[#1E2D4A] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-fullName">
                          <span>•</span> {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        Phone Number (10 digits) *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        className={`w-full px-4 py-3 rounded-xl bg-[#080D18] border text-sm text-[#EAF2FF] placeholder-[#94A3B8]/50 focus:outline-none transition-all ${
                          errors.phone
                            ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                            : 'border-[#1E2D4A] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-phone">
                          <span>•</span> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="addressLine1" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                      Address Line *
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="e.g. 22 MG Road, Flat 402"
                      className={`w-full px-4 py-3 rounded-xl bg-[#080D18] border text-sm text-[#EAF2FF] placeholder-[#94A3B8]/50 focus:outline-none transition-all ${
                        errors.addressLine1
                          ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                          : 'border-[#1E2D4A] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30'
                      }`}
                    />
                    {errors.addressLine1 && (
                      <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-addressLine1">
                        <span>•</span> {errors.addressLine1}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Bengaluru"
                        className={`w-full px-4 py-3 rounded-xl bg-[#080D18] border text-sm text-[#EAF2FF] placeholder-[#94A3B8]/50 focus:outline-none transition-all ${
                          errors.city
                            ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                            : 'border-[#1E2D4A] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-city">
                          <span>•</span> {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Karnataka"
                        className={`w-full px-4 py-3 rounded-xl bg-[#080D18] border text-sm text-[#EAF2FF] placeholder-[#94A3B8]/50 focus:outline-none transition-all ${
                          errors.state
                            ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                            : 'border-[#1E2D4A] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30'
                        }`}
                      />
                      {errors.state && (
                        <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-state">
                          <span>•</span> {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="pincode" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        Pincode (6 digits) *
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="560001"
                        maxLength={6}
                        className={`w-full px-4 py-3 rounded-xl bg-[#080D18] border text-sm text-[#EAF2FF] placeholder-[#94A3B8]/50 focus:outline-none transition-all ${
                          errors.pincode
                            ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                            : 'border-[#1E2D4A] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30'
                        }`}
                      />
                      {errors.pincode && (
                        <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-pincode">
                          <span>•</span> {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1E2D4A] flex items-center gap-3 text-xs text-[#94A3B8]">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Instant server verification with real-time stock allocation.</span>
                  </div>
                </form>
              </div>

              {/* Payment Method Card - Pure Razorpay */}
              <div className="bg-[#111B2E] border border-[#1E2D4A] rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#60A5FA] text-lg">
                      💳
                    </div>
                    <h2 className="text-xl font-bold text-[#EAF2FF]">Payment Gateway</h2>
                  </div>
                  <span className="text-xs text-[#60A5FA] font-semibold bg-[#3B82F6]/10 px-2.5 py-1 rounded-full border border-[#3B82F6]/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]"></span>
                    Razorpay Active
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#080D18] border border-[#3B82F6]/40 ring-1 ring-[#3B82F6]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-[#EAF2FF]">
                        Razorpay Secure Checkout
                      </span>
                      <span className="text-[10px] bg-[#3B82F6]/20 text-[#60A5FA] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                        Test Mode
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <span>🔒 256-bit SSL</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Official Razorpay payment popup. Supports credit/debit cards, UPI apps, Netbanking, and popular wallets with automatic signature verification.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#94A3B8]">
                    <span className="px-2.5 py-1 rounded-lg bg-[#111B2E] border border-[#1E2D4A]">💳 Visa / Mastercard</span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#111B2E] border border-[#1E2D4A]">📱 UPI (GPay, PhonePe, Paytm)</span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#111B2E] border border-[#1E2D4A]">🏦 Netbanking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 bg-[#111B2E] border border-[#1E2D4A] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl sticky top-24">
              <h2 className="text-xl font-extrabold text-[#EAF2FF] pb-4 border-b border-[#1E2D4A]">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const prod = item.product || {};
                  const itemTotal = (prod.price || 0) * (item.quantity || 1);
                  return (
                    <div
                      key={prod._id || item._id}
                      className="flex items-center justify-between gap-3 text-sm py-2.5 border-b border-[#1E2D4A]/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover bg-[#080D18] border border-[#1E2D4A] shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = "/images/products/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#60A5FA] flex items-center justify-center font-bold text-xs shrink-0">
                            SK
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-[#EAF2FF] truncate">{prod.name}</p>
                          <p className="text-xs text-[#94A3B8]">
                            Qty: {item.quantity} × ₹{(prod.price || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#EAF2FF] shrink-0">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm pt-2">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Total Items</span>
                  <span className="font-semibold text-[#EAF2FF]">{cartCount} units</span>
                </div>

                <div className="flex justify-between text-[#94A3B8]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#EAF2FF]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-[#94A3B8]">
                  <span>Shipping & Delivery</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>

                <div className="pt-4 border-t border-[#1E2D4A] flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#EAF2FF]">Grand Total</span>
                  <span className="text-2xl font-black text-[#60A5FA]" id="checkout-total-amount">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm text-white shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 group ${
                  isSubmitting
                    ? 'bg-[#3B82F6]/50 cursor-not-allowed'
                    : 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-blue-500/25 hover:shadow-blue-500/40'
                }`}
                id="place-order-btn"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{subtotal.toLocaleString('en-IN')} with Razorpay</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              <div className="text-center space-y-1">
                <span className="text-xs text-[#94A3B8] flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Official Razorpay payment popup with real-time verification
                </span>
                <p className="text-[11px] text-[#94A3B8]/80">
                  Cart is updated and decremented from live stock upon verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
