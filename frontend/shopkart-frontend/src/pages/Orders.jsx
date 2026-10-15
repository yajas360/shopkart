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
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Fetch orders error:", err);
            setError(err.response?.data?.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAdvanceStatus = async (orderId, currentStatus) => {
        const statusMap = {
            PLACED: "CONFIRMED",
            CONFIRMED: "SHIPPED",
            SHIPPED: "DELIVERED",
        };

        const nextStatus = statusMap[currentStatus];
        if (!nextStatus) return;

        setUpdatingOrderId(orderId);
        try {
            const res = await updateOrderStatus(orderId, nextStatus);
            if (res.success && res.order) {
                setOrders((prev) =>
                    prev.map((o) => (o._id === orderId ? res.order : o))
                );
            }
        } catch (err) {
            console.error("Status update error:", err);
            alert(err.response?.data?.message || "Could not update status.");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "DELIVERED":
                return "bg-emerald-50 text-emerald-800 border-emerald-200";
            case "SHIPPED":
                return "bg-blue-50 text-blue-800 border-blue-200";
            case "CONFIRMED":
                return "bg-purple-50 text-purple-800 border-purple-200";
            case "PLACED":
                return "bg-slate-100 text-slate-800 border-slate-200";
            case "PENDING_PAYMENT":
                return "bg-amber-50 text-amber-800 border-amber-200";
            default:
                return "bg-slate-100 text-slate-800 border-slate-200";
        }
    };

    const getProgressionStep = (status) => {
        const steps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
        return steps.indexOf(status);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Orders</h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                            Track shipments and review payment receipts.
                        </p>
                    </div>
                    {!loading && orders.length > 0 && (
                        <button
                            onClick={fetchOrders}
                            className="self-start sm:self-auto text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                        >
                            Refresh
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200/90 shadow-xs">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
                        <p className="text-slate-600 font-medium text-xs">Loading orders...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto bg-white rounded-xl border border-red-200 p-6 shadow-xs">
                        <h2 className="text-base font-bold text-slate-900 mb-1">Failed to load orders</h2>
                        <p className="text-slate-500 mb-4 text-xs">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto bg-white rounded-xl border border-slate-200/90 p-8 shadow-xs">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl mb-3">
                            📦
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">No orders yet</h2>
                        <p className="text-slate-500 mb-5 text-xs">
                            You haven't placed any orders with ShopKart yet.
                        </p>
                        <Link
                            to="/products"
                            className="bg-slate-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition"
                        >
                            Browse Products
                        </Link>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-5">
                        {orders.map((order) => {
                            const stepIndex = getProgressionStep(order.status);

                            return (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden"
                                >
                                    <div className="bg-slate-50/70 border-b border-slate-200 px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-slate-900 font-mono">
                                                    Order #{order._id.slice(-8)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {stepIndex !== -1 && (
                                        <div className="px-5 pt-4 pb-3 bg-white border-b border-slate-100">
                                            <div className="flex items-center justify-between max-w-md mx-auto">
                                                {["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"].map((st, idx) => {
                                                    const isCompleted = idx <= stepIndex;
                                                    const isCurrent = idx === stepIndex;

                                                    return (
                                                        <div key={st} className="flex-1 flex flex-col items-center relative">
                                                            <div
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition z-10 ${
                                                                    isCurrent
                                                                        ? "bg-slate-900 text-white ring-2 ring-emerald-500"
                                                                        : isCompleted
                                                                        ? "bg-emerald-600 text-white"
                                                                        : "bg-slate-100 text-slate-400"
                                                                }`}
                                                            >
                                                                {isCompleted ? "✓" : idx + 1}
                                                            </div>
                                                            <span
                                                                className={`text-[9px] mt-1 font-semibold uppercase tracking-wider ${
                                                                    isCurrent ? "text-slate-900" : isCompleted ? "text-emerald-700" : "text-slate-400"
                                                                }`}
                                                            >
                                                                {st}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {stepIndex < 3 && (
                                                <div className="text-center mt-3">
                                                    <button
                                                        onClick={() => handleAdvanceStatus(order._id, order.status)}
                                                        disabled={updatingOrderId === order._id}
                                                        className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-0.5 rounded-md transition cursor-pointer"
                                                    >
                                                        {updatingOrderId === order._id ? "Updating..." : `Advance to ${["CONFIRMED", "SHIPPED", "DELIVERED"][stepIndex + 1]}`}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-4 sm:p-5 divide-y divide-slate-100">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                                                <div className="flex items-center space-x-3 min-w-0 pr-4">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/images/products/placeholder.svg";
                                                        }}
                                                    />
                                                    <div className="truncate">
                                                        <p className="font-semibold text-slate-900 truncate">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-slate-500">
                                                            Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="font-semibold text-slate-900 flex-shrink-0">
                                                    ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50/70 border-t border-slate-200 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <div className="text-slate-500">
                                            <span>To: </span>
                                            <span className="font-medium text-slate-800">
                                                {order.shippingAddress?.fullName}, {order.shippingAddress?.city}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <span className="font-bold text-slate-900">
                                                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                                            </span>

                                            <Link
                                                to={`/orders/${order._id}`}
                                                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition"
                                            >
                                                Receipt
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
