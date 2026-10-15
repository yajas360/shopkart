import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { loadRazorpayScript } from '../utils/loadRazorpay';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartCount, clearCart } = useCart();
  const { user } = useAuth();

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

  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product?.price) || 0;
    return acc + price * item.quantity;
  }, 0);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
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
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
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
              await clearCart();
              navigate(`/order-success/${orderData.shopKartOrderId}`, {
                state: {
                  order: verifyRes.data.order,
                  paymentId: response.razorpay_payment_id,
                },
              });
            } else {
              setSubmitError(verifyRes.data?.message || 'Payment verification failed.');
              setIsSubmitting(false);
            }
          } catch (err) {
            console.error('Verification error:', err);
            setSubmitError(err.response?.data?.message || 'Error verifying Razorpay transaction.');
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
          email: user?.email || '',
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        setSubmitError(
          response.error?.description || 'Payment was unsuccessful or cancelled.'
        );
        setIsSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitError(
        err.response?.data?.message ||
        err.message ||
        'Unable to initialize checkout. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
            <p className="text-sm text-slate-500">
              Please add items to your cart before proceeding to checkout.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-block px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 transition"
              >
                Browse Products
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
      <div className="px-4 sm:px-6 py-8 md:py-10 flex-1">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link to="/products" className="hover:text-slate-900">Products</Link>
              <span>/</span>
              <Link to="/cart" className="hover:text-slate-900">Cart</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Checkout</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Checkout</span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  Razorpay Verified
                </span>
              </h1>
            </div>
          </div>

          {submitError && (
            <div
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
              id="checkout-error-banner"
            >
              <span className="font-bold">⚠️</span>
              <div>
                <p className="font-semibold text-red-800">Notice</p>
                <p className="mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Shipping Form & Payment Method */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">1. Shipping Address</h2>
                  <span className="text-xs text-slate-400">All fields required</span>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4" id="shipping-form" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Aarav Sharma"
                        className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          errors.fullName
                            ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                            : 'border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-red-600 text-xs mt-1" id="error-fullName">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone (10 digits) *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          errors.phone
                            ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                            : 'border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-xs mt-1" id="error-phone">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="addressLine1" className="block text-xs font-semibold text-slate-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="e.g. 22 MG Road, Flat 402"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                        errors.addressLine1
                          ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                          : 'border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                      }`}
                    />
                    {errors.addressLine1 && (
                      <p className="text-red-600 text-xs mt-1" id="error-addressLine1">
                        {errors.addressLine1}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="city" className="block text-xs font-semibold text-slate-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Bengaluru"
                        className={`w-full px-3 py-2.5 rounded-lg bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          errors.city
                            ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                            : 'border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-red-600 text-xs mt-1" id="error-city">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-xs font-semibold text-slate-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Karnataka"
                        className={`w-full px-3 py-2.5 rounded-lg bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          errors.state
                            ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                            : 'border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                        }`}
                      />
                      {errors.state && (
                        <p className="text-red-600 text-xs mt-1" id="error-state">
                          {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="pincode" className="block text-xs font-semibold text-slate-700 mb-1">
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
                        className={`w-full px-3 py-2.5 rounded-lg bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          errors.pincode
                            ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                            : 'border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                        }`}
                      />
                      {errors.pincode && (
                        <p className="text-red-600 text-xs mt-1" id="error-pincode">
                          {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Payment Gateway Box */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">2. Payment Gateway</h2>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    Razorpay Official
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900">
                      Razorpay Checkout (UPI, Cards, Netbanking)
                    </span>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                      Test Mode
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Orders are validated securely on the backend via HMAC-SHA256 signature verification upon completion.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs sticky top-24">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const prod = item.product || {};
                  const itemTotal = (prod.price || 0) * (item.quantity || 1);
                  return (
                    <div
                      key={prod._id || item._id}
                      className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = "/images/products/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            SK
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate">{prod.name}</p>
                          <p className="text-slate-500">
                            Qty: {item.quantity} × ₹{(prod.price || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 shrink-0">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex justify-between text-slate-500">
                  <span>Items</span>
                  <span className="font-semibold text-slate-800">{cartCount} units</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">FREE</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900" id="checkout-total-amount">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-emerald-600 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                id="place-order-btn"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <span>Pay ₹{subtotal.toLocaleString('en-IN')} with Razorpay</span>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-slate-400">
                  🔒 256-bit encrypted checkout via Razorpay
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
