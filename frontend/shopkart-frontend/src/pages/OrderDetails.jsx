import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById, updateOrderStatus } from "../services/orderApi";

export default function OrderDetails() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchOrder = async () => {
            setLoading(true);
            setError("");
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

    const handleAdvanceStatus = async () => {
        if (!order || updating) return;
        const progression = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
        const currentIndex = progression.indexOf(order.status);
        if (currentIndex === -1 || currentIndex >= progression.length - 1) return;

        const nextStatus = progression[currentIndex + 1];
        setUpdating(true);

        try {
            const res = await updateOrderStatus(order._id, nextStatus);
            if (res.success) {
                setOrder(res.order);
            }
        } catch (err) {
            alert("Error updating status: " + (err.response?.data?.message || err.message));
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="max-w-md mx-auto px-6 py-20 text-center flex-1">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || "Could not retrieve order details."}</p>
                    <Link
                        to="/orders"
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        Back to My Orders
                    </Link>
                </main>
            </div>
        );
    }

    const progression = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    const currentStepIndex = progression.indexOf(order.status);

    return (
        <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to="/orders"
                        className="inline-flex items-center text-sm font-semibold text-[#60A5FA] hover:text-[#3B82F6] transition"
                    >
                        &larr; Back to My Orders
                    </Link>
                    <span className="text-xs text-[#94A3B8] font-mono">ID: {order._id}</span>
                </div>

                <div className="bg-[#111B2E] rounded-3xl border border-[#1E2D4A] p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1E2D4A]">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#EAF2FF] tracking-tight">
                                Order #{order._id.slice(-8)}
                            </h1>
                            <p className="text-sm text-[#94A3B8] mt-0.5">
                                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30">
                                {order.status}
                            </span>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                💳 {order.paymentStatus}
                            </span>
                        </div>
                    </div>

                    {currentStepIndex !== -1 && (
                        <div className="bg-[#080D18] rounded-2xl p-6 border border-[#1E2D4A]">
                            <h2 className="text-xs font-bold text-[#60A5FA] uppercase tracking-wider mb-5 text-center">
                                Order Delivery Progression
                            </h2>
                            <div className="flex items-center justify-between max-w-lg mx-auto">
                                {progression.map((st, idx) => {
                                    const isCompleted = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;

                                    return (
                                        <div key={st} className="flex-1 flex flex-col items-center">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition z-10 ${
                                                    isCurrent
                                                        ? "bg-[#3B82F6] text-[#EAF2FF] ring-4 ring-[#3B82F6]/25"
                                                        : isCompleted
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-[#1E2D4A] text-[#94A3B8]"
                                                }`}
                                            >
                                                {isCompleted ? "✓" : idx + 1}
                                            </div>
                                            <span
                                                className={`text-[10px] sm:text-xs mt-1.5 font-semibold uppercase tracking-wider ${
                                                    isCurrent ? "text-[#60A5FA]" : isCompleted ? "text-[#EAF2FF]" : "text-[#94A3B8]"
                                                }`}
                                            >
                                                {st}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {currentStepIndex < 3 && (
                                <div className="text-center mt-5 pt-4 border-t border-[#1E2D4A]">
                                    <button
                                        onClick={handleAdvanceStatus}
                                        disabled={updating}
                                        className="text-xs font-bold text-[#60A5FA] hover:text-[#EAF2FF] bg-[#111B2E] border border-[#1E2D4A] hover:border-[#3B82F6]/50 px-4 py-1.5 rounded-full transition cursor-pointer disabled:opacity-40"
                                    >
                                        {updating ? "Updating..." : `Advance status to ${progression[currentStepIndex + 1]} (Demo Bonus)`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                        <div className="bg-[#080D18] rounded-2xl p-5 border border-[#1E2D4A]">
                            <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">
                                📍 Delivery Address
                            </h2>
                            <p className="text-sm font-bold text-[#EAF2FF]">{order.shippingAddress?.fullName}</p>
                            <p className="text-sm text-[#94A3B8] mt-1">{order.shippingAddress?.addressLine1}</p>
                            <p className="text-sm text-[#94A3B8]">
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                            </p>
                            <p className="text-sm text-[#94A3B8] mt-2">
                                <span className="text-[#60A5FA]">Phone: </span>
                                {order.shippingAddress?.phone}
                            </p>
                        </div>

                        <div className="bg-[#080D18] rounded-2xl p-5 border border-[#1E2D4A]">
                            <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">
                                💳 Payment Information
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#94A3B8]">Method</span>
                                    <span className="font-semibold text-[#EAF2FF]">
                                        Razorpay Gateway (Test Mode)
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#94A3B8]">Payment Status</span>
                                    <span className="font-semibold text-emerald-400">{order.paymentStatus}</span>
                                </div>
                                {order.razorpayPaymentId && (
                                    <div className="pt-2 border-t border-[#1E2D4A]">
                                        <span className="text-xs text-[#94A3B8] block">Payment ID:</span>
                                        <span className="text-xs font-mono text-[#60A5FA] break-all">{order.razorpayPaymentId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-[#EAF2FF] mb-4">
                            Items Ordered ({order.items?.length})
                        </h2>
                        <div className="border border-[#1E2D4A] rounded-2xl overflow-hidden divide-y divide-[#1E2D4A]">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between text-sm bg-[#080D18] hover:bg-[#152138]/50 transition">
                                    <div className="flex items-center space-x-4 min-w-0 pr-4">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-14 h-14 object-cover rounded-xl bg-[#080D18] border border-[#1E2D4A] flex-shrink-0"
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/products/placeholder.svg";
                                            }}
                                        />
                                        <div className="truncate">
                                            <p className="font-semibold text-[#EAF2FF] text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-[#94A3B8] mt-0.5">
                                                ₹{Number(item.price).toLocaleString("en-IN")} × {item.quantity} units
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-[#EAF2FF] text-base flex-shrink-0">
                                        ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#080D18] rounded-2xl p-5 border border-[#1E2D4A] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-[#94A3B8]">
                            Delivery charges: <span className="font-bold text-emerald-400">FREE</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-base font-medium text-[#94A3B8]">Total Paid:</span>
                            <span className="text-2xl font-black text-[#60A5FA]">
                                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
