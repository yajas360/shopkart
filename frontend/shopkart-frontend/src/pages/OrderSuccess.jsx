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
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-slate-500 text-xs">Confirming your order...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
                <Navbar />
                <main className="max-w-md mx-auto px-6 py-16 text-center flex-1">
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Unable to load order</h1>
                    <p className="text-slate-500 text-xs mb-5">{error || "Order not found"}</p>
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-xs font-semibold transition"
                    >
                        Go to My Orders
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs text-center mb-6">
                    {/* Success Icon */}
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
                        ✓
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1" id="order-success-title">
                        Order Confirmed
                    </h1>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
                        Thank you for your order. Your Razorpay payment was verified successfully.
                    </p>

                    {/* Order Metadata Box */}
                    <div className="bg-slate-50/70 rounded-xl p-4 sm:p-5 text-left border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
                        <div>
                            <span className="text-slate-400 uppercase tracking-wider block font-medium">Order ID</span>
                            <span className="font-semibold text-slate-900 font-mono break-all" id="confirmed-order-id">{order._id}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase tracking-wider block font-medium">Total Paid</span>
                            <span className="text-base font-bold text-slate-900" id="confirmed-order-total">
                                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase tracking-wider block font-medium">Payment Status</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mt-1">
                                {order.paymentStatus}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase tracking-wider block font-medium">Order Status</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 mt-1" id="confirmed-order-status">
                                {order.status}
                            </span>
                        </div>
                        {order.razorpayPaymentId && (
                            <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                                <span className="text-slate-400 uppercase tracking-wider block font-medium">
                                    Payment Reference
                                </span>
                                <span className="font-mono text-slate-700">{order.razorpayPaymentId}</span>
                            </div>
                        )}
                    </div>

                    {/* Shipping Address Box */}
                    <div className="text-left bg-slate-50/70 border border-slate-200 rounded-xl p-4 mb-6 text-xs">
                        <h2 className="font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Shipping Details
                        </h2>
                        <p className="font-semibold text-slate-900">{order.shippingAddress?.fullName}</p>
                        <p className="text-slate-600 mt-0.5">{order.shippingAddress?.addressLine1}</p>
                        <p className="text-slate-600">
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </p>
                        <p className="text-slate-400 mt-1.5 font-mono">Phone: {order.shippingAddress?.phone}</p>
                    </div>

                    {/* Ordered Items Breakdown */}
                    <div className="text-left border-t border-slate-100 pt-5 mb-6">
                        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                            Items ({order.items?.length || 0})
                        </h2>
                        <div className="divide-y divide-slate-100">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0"
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/products/placeholder.svg";
                                            }}
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-900">{item.name}</p>
                                            <p className="text-slate-500">
                                                Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-slate-900">
                                        ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/orders"
                            className="w-full sm:w-auto bg-slate-900 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold text-xs transition cursor-pointer"
                            id="view-my-orders-btn"
                        >
                            View Order History
                        </Link>
                        <Link
                            to="/products"
                            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-2.5 rounded-lg font-semibold text-xs transition cursor-pointer"
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
