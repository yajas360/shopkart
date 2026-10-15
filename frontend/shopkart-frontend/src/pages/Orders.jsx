import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyOrders, updateOrderStatus } from "../services/orderApi";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getMyOrders();
            if (data?.orders) {
                setOrders(data.orders);
            }
        } catch (err) {
            console.error("Fetch orders error:", err);
            setError(err.response?.data?.message || "Unable to load your orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAdvanceStatus = async (orderId, currentStatus) => {
        const progression = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
        const currentIndex = progression.indexOf(currentStatus);
        if (currentIndex === -1 || currentIndex >= progression.length - 1) return;

        const nextStatus = progression[currentIndex + 1];
        setUpdatingOrderId(orderId);

        try {
            const res = await updateOrderStatus(orderId, nextStatus);
            if (res.success) {
                setOrders((prev) =>
                    prev.map((ord) => (ord._id === orderId ? { ...ord, status: nextStatus } : ord))
                );
            }
        } catch (err) {
            console.error("Update status error:", err);
            alert("Failed to advance status: " + (err.response?.data?.message || err.message));
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "DELIVERED":
                return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
            case "SHIPPED":
                return "bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/30";
            case "CONFIRMED":
                return "bg-violet-500/20 text-violet-300 border-violet-500/30";
            case "PLACED":
                return "bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/25";
            case "PENDING_PAYMENT":
                return "bg-amber-500/15 text-amber-300 border-amber-500/30";
            default:
                return "bg-[#1E2D4A] text-[#94A3B8] border-[#1E2D4A]";
        }
    };

    const getProgressionStep = (status) => {
        const steps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
        return steps.indexOf(status);
    };

    return (
        <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#EAF2FF] tracking-tight">My Orders</h1>
                        <p className="text-[#94A3B8] text-sm mt-1">
                            Review your past purchases, order tracking status, and delivery history.
                        </p>
                    </div>
                    {!loading && orders.length > 0 && (
                        <button
                            onClick={fetchOrders}
                            className="self-start sm:self-auto text-xs font-semibold text-[#60A5FA] hover:text-[#EAF2FF] bg-[#111B2E] border border-[#1E2D4A] hover:border-[#3B82F6]/40 px-3.5 py-2 rounded-xl transition cursor-pointer"
                        >
                            Refresh Orders 🔄
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111B2E] rounded-3xl border border-[#1E2D4A]">
                        <div className="w-12 h-12 border-4 border-[#1E2D4A] border-t-[#3B82F6] rounded-full animate-spin mb-4" />
                        <p className="text-[#EAF2FF] font-semibold">Loading your orders...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto bg-[#111B2E] rounded-3xl border border-rose-500/30 p-8 shadow-xl">
                        <div className="text-4xl mb-3">⚠️</div>
                        <h2 className="text-2xl font-bold text-[#EAF2FF] mb-2">Something went wrong</h2>
                        <p className="text-[#94A3B8] mb-6 text-sm">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] px-6 py-2.5 rounded-xl font-semibold transition cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto bg-[#111B2E] rounded-3xl border border-[#1E2D4A] p-10 shadow-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/25 flex items-center justify-center text-3xl mb-4">
                            📦
                        </div>
                        <h2 className="text-2xl font-bold text-[#EAF2FF] mb-2">No orders placed yet</h2>
                        <p className="text-[#94A3B8] mb-6 text-sm max-w-xs leading-relaxed">
                            Start exploring our catalogue to place your first order!
                        </p>
                        <Link
                            to="/products"
                            className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#3B82F6]/30 transition"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const stepIndex = getProgressionStep(order.status);

                            return (
                                <div
                                    key={order._id}
                                    className="bg-[#111B2E] rounded-2xl border border-[#1E2D4A] shadow-xl overflow-hidden transition hover:border-[#3B82F6]/40"
                                >
                                    <div className="bg-[#152138] border-b border-[#1E2D4A] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                                                    Order
                                                </span>
                                                <span className="text-sm font-bold text-[#EAF2FF] font-mono">
                                                    #{order._id.slice(-8)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#94A3B8] mt-0.5">
                                                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <span
                                                className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                                💳 {order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {stepIndex !== -1 && (
                                        <div className="px-6 pt-5 pb-3 bg-[#080D18] border-b border-[#1E2D4A]">
                                            <div className="flex items-center justify-between max-w-xl mx-auto">
                                                {["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"].map((st, idx) => {
                                                    const isCompleted = idx <= stepIndex;
                                                    const isCurrent = idx === stepIndex;

                                                    return (
                                                        <div key={st} className="flex-1 flex flex-col items-center relative">
                                                            <div
                                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition z-10 ${
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
                                                                className={`text-[10px] mt-1.5 font-semibold uppercase tracking-wider ${
                                                                    isCurrent ? "text-[#60A5FA]" : isCompleted ? "text-[#EAF2FF]" : "text-[#94A3B8]"
                                                                }`}
                                                            >
                                                                {st}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {stepIndex < 3 && (
                                                <div className="text-center mt-3.5 mb-1">
                                                    <button
                                                        onClick={() => handleAdvanceStatus(order._id, order.status)}
                                                        disabled={updatingOrderId === order._id}
                                                        className="text-xs font-bold text-[#60A5FA] hover:text-[#EAF2FF] bg-[#111B2E] border border-[#1E2D4A] hover:border-[#3B82F6]/50 px-3.5 py-1 rounded-full transition cursor-pointer disabled:opacity-40"
                                                    >
                                                        {updatingOrderId === order._id ? (
                                                            "Updating Status..."
                                                        ) : (
                                                            `Advance to ${["CONFIRMED", "SHIPPED", "DELIVERED"][stepIndex + 1]} (Demo Bonus)`
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-4 sm:p-6 divide-y divide-[#1E2D4A]">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="py-3 flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-3 min-w-0 pr-4">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded-xl bg-[#080D18] border border-[#1E2D4A] flex-shrink-0"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/images/products/placeholder.svg";
                                                        }}
                                                    />
                                                    <div className="truncate">
                                                        <p className="font-semibold text-[#EAF2FF] truncate">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-[#94A3B8]">
                                                            Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="font-bold text-[#EAF2FF] flex-shrink-0">
                                                    ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-[#152138] border-t border-[#1E2D4A] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                                        <div className="text-xs text-[#94A3B8]">
                                            <span>Delivering to: </span>
                                            <span className="font-semibold text-[#EAF2FF]">
                                                {order.shippingAddress?.fullName}, {order.shippingAddress?.city}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <span className="text-xs text-[#94A3B8] mr-2">Total Amount:</span>
                                                <span className="text-lg font-black text-[#60A5FA]">
                                                    ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                                                </span>
                                            </div>

                                            <Link
                                                to={`/orders/${order._id}`}
                                                className="bg-[#1E2D4A] hover:bg-[#2A3C61] border border-[#1E2D4A] text-[#EAF2FF] hover:text-[#60A5FA] text-xs font-semibold px-4 py-2 rounded-xl transition"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
