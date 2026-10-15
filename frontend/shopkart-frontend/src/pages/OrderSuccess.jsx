import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/orderApi";

export default function OrderSuccess() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchOrder = async () => {
            try {
                const data = await getOrderById(id);
                if (!cancelled) {
                    if (data?.order) {
                        setOrder(data.order);
                    } else {
                        setError("Order not found");
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Failed to load order details");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (id) {
            fetchOrder();
        }

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-[#1E2D4A] border-t-[#3B82F6] rounded-full animate-spin mb-4"></div>
                    <p className="text-[#94A3B8] text-sm">Verifying order confirmation...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
                <Navbar />
                <main className="max-w-md mx-auto px-6 py-20 text-center flex-1">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-3xl">
                        ⚠️
                    </div>
                    <h1 className="text-2xl font-bold text-[#EAF2FF] mb-2">Unable to load order</h1>
                    <p className="text-[#94A3B8] mb-6">{error || "Order not found"}</p>
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 bg-[#3B82F6] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2563EB] shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                    >
                        Go to My Orders
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
                <div className="bg-[#111B2E] rounded-3xl border border-[#1E2D4A] p-6 sm:p-10 shadow-2xl text-center mb-8">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg shadow-emerald-500/10">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-extrabold text-[#EAF2FF] tracking-tight mb-2" id="order-success-title">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-[#94A3B8] text-sm max-w-lg mx-auto mb-8">
                        Thank you for shopping with ShopKart. Your payment has been verified and your order is confirmed.
                    </p>

                    {/* Order Metadata Box */}
                    <div className="bg-[#080D18] rounded-2xl p-5 sm:p-6 text-left border border-[#1E2D4A] grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div>
                            <span className="text-xs text-[#94A3B8] uppercase tracking-wider block font-medium">Order ID</span>
                            <span className="text-sm font-bold text-[#EAF2FF] font-mono break-all" id="confirmed-order-id">{order._id}</span>
                        </div>
                        <div>
                            <span className="text-xs text-[#94A3B8] uppercase tracking-wider block font-medium">Total Amount</span>
                            <span className="text-lg font-black text-[#60A5FA]" id="confirmed-order-total">
                                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-[#94A3B8] uppercase tracking-wider block font-medium">Payment Status</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                {order.paymentStatus}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-[#94A3B8] uppercase tracking-wider block font-medium">Order Status</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20 mt-1" id="confirmed-order-status">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]"></span>
                                {order.status}
                            </span>
                        </div>
                        {order.razorpayPaymentId && (
                            <div className="sm:col-span-2 pt-2 border-t border-[#1E2D4A]/50">
                                <span className="text-xs text-[#94A3B8] uppercase tracking-wider block font-medium">
                                    Razorpay Payment ID
                                </span>
                                <span className="text-xs font-mono text-[#60A5FA]">{order.razorpayPaymentId}</span>
                            </div>
                        )}
                    </div>

                    {/* Shipping Address Box */}
                    <div className="text-left bg-[#080D18]/70 border border-[#1E2D4A] rounded-2xl p-5 mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h2 className="text-xs font-bold text-[#60A5FA] uppercase tracking-wider">
                                Shipping Destination
                            </h2>
                        </div>
                        <p className="text-sm font-semibold text-[#EAF2FF]">{order.shippingAddress?.fullName}</p>
                        <p className="text-sm text-[#94A3B8] mt-0.5">{order.shippingAddress?.addressLine1}</p>
                        <p className="text-sm text-[#94A3B8]">
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </p>
                        <p className="text-xs text-[#94A3B8] mt-2 font-mono">Contact: {order.shippingAddress?.phone}</p>
                    </div>

                    {/* Ordered Items Breakdown */}
                    <div className="text-left border-t border-[#1E2D4A] pt-6 mb-8">
                        <h2 className="text-base font-bold text-[#EAF2FF] mb-4">
                            Ordered Items ({order.items?.length || 0})
                        </h2>
                        <div className="divide-y divide-[#1E2D4A]/60">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="py-3.5 flex items-center justify-between">
                                    <div className="flex items-center space-x-3.5">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-xl object-cover bg-[#080D18] border border-[#1E2D4A] flex-shrink-0"
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/products/placeholder.svg";
                                            }}
                                        />
                                        <div>
                                            <p className="font-semibold text-[#EAF2FF] text-sm">{item.name}</p>
                                            <p className="text-xs text-[#94A3B8]">
                                                Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-[#EAF2FF] text-sm">
                                        ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                        <Link
                            to="/orders"
                            className="w-full sm:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white px-7 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                            id="view-my-orders-btn"
                        >
                            View My Orders
                        </Link>
                        <Link
                            to="/products"
                            className="w-full sm:w-auto bg-[#080D18] hover:bg-[#1E2D4A] text-[#EAF2FF] border border-[#1E2D4A] px-7 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
                            id="continue-shopping-btn"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
