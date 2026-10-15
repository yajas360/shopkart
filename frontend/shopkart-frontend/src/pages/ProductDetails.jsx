import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProductById } from "../services/productApi.js";
import { getWishlist, toggleWishlist } from "../services/wishlistApi.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetails() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [feedbackMsg, setFeedbackMsg] = useState("");

    const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
    const [cartLoading, setCartLoading] = useState(false);
    const cartItem = cartItems.find(
        (item) => (item.product?._id || item.product) === id
    );
    const inCart = !!cartItem;
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const [productRes, wishlistRes] = await Promise.allSettled([
                    getProductById(id),
                    getWishlist()
                ]);

                if (!cancelled) {
                    if (productRes.status === "fulfilled") {
                        setProduct(productRes.value.product);
                    } else {
                        setError(
                            productRes.reason?.response?.data?.message ||
                            "Failed to load product details."
                        );
                    }

                    if (wishlistRes.status === "fulfilled" && wishlistRes.value?.wishlist) {
                        const inWishlist = wishlistRes.value.wishlist.some(
                            item => item._id === id || item === id
                        );
                        setIsWishlisted(inWishlist);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError("Failed to load product details.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleWishlistToggle = async () => {
        if (wishlistLoading) return;
        setWishlistLoading(true);
        setFeedbackMsg("");

        try {
            const res = await toggleWishlist(id);
            const savedState = res.saved ?? !isWishlisted;
            setIsWishlisted(savedState);
            setFeedbackMsg(savedState ? "Saved to wishlist" : "Removed from wishlist");
            window.dispatchEvent(new CustomEvent("shopkart:wishlist_change"));
            setTimeout(() => setFeedbackMsg(""), 2500);
        } catch (err) {
            console.error("Wishlist toggle error:", err);
            const msg = err.response?.data?.message || "Failed to update wishlist.";
            setFeedbackMsg(msg);
            setTimeout(() => setFeedbackMsg(""), 2500);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (cartLoading || !product || product.stock <= 0) return;
        setCartLoading(true);
        setFeedbackMsg("");
        const res = await addToCart(id);
        if (res.success) {
            setFeedbackMsg("Item added to cart");
        } else {
            setFeedbackMsg(res.message);
        }
        setCartLoading(false);
        setTimeout(() => setFeedbackMsg(""), 2500);
    };

    const handleIncrease = async () => {
        if (cartLoading || !product || quantityInCart >= product.stock) return;
        setCartLoading(true);
        setFeedbackMsg("");
        const res = await updateQuantity(id, quantityInCart + 1);
        if (!res.success) {
            setFeedbackMsg(res.message);
            setTimeout(() => setFeedbackMsg(""), 2500);
        }
        setCartLoading(false);
    };

    const handleDecrease = async () => {
        if (cartLoading) return;
        setCartLoading(true);
        setFeedbackMsg("");
        if (quantityInCart <= 1) {
            const res = await removeFromCart(id);
            if (!res.success) {
                setFeedbackMsg(res.message);
                setTimeout(() => setFeedbackMsg(""), 2500);
            }
        } else {
            const res = await updateQuantity(id, quantityInCart - 1);
            if (!res.success) {
                setFeedbackMsg(res.message);
                setTimeout(() => setFeedbackMsg(""), 2500);
            }
        }
        setCartLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <div className="mb-6">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
                    >
                        <span>&larr;</span>
                        <span>Back to all products</span>
                    </Link>
                </div>

                {loading && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-slate-700 font-medium text-sm">Loading details...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-red-200 p-8 shadow-xs max-w-lg mx-auto">
                        <p className="text-red-600 font-semibold mb-4 text-sm">{error}</p>
                        <Link
                            to="/products"
                            className="inline-block bg-slate-900 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-xs font-medium transition"
                        >
                            Return to catalog
                        </Link>
                    </div>
                )}

                {!loading && !error && product && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="bg-slate-50 relative flex items-center justify-center p-6 sm:p-10 border-b md:border-b-0 md:border-r border-slate-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-auto max-h-[380px] object-contain mix-blend-multiply"
                                    onError={(e) => {
                                        e.currentTarget.src = "/images/products/placeholder.svg";
                                    }}
                                />
                            </div>

                            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded">
                                            {product.category}
                                        </span>
                                        <span
                                            className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                                                product.stock > 0
                                                    ? "bg-emerald-50 text-emerald-800"
                                                    : "bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {product.stock > 0
                                                ? `${product.stock} units available`
                                                : "Out of stock"}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                                        {product.name}
                                    </h1>

                                    <div className="mb-6">
                                        <p className="text-3xl font-bold text-slate-900">
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <div className="border-t border-slate-100 pt-5 mb-6">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {feedbackMsg && (
                                        <div className="p-2.5 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-center">
                                            {feedbackMsg}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                                        {inCart ? (
                                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-1.5 min-w-[180px]">
                                                <button
                                                    type="button"
                                                    onClick={handleDecrease}
                                                    disabled={cartLoading}
                                                    className="w-9 h-9 rounded bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                                                >
                                                    -
                                                </button>

                                                <div className="text-xs font-semibold px-2 text-slate-700">
                                                    Qty: <span className="text-slate-900 font-bold">{quantityInCart}</span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleIncrease}
                                                    disabled={cartLoading || quantityInCart >= product.stock}
                                                    className="w-9 h-9 rounded bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleAddToCart}
                                                disabled={cartLoading || product.stock <= 0}
                                                className="bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition text-sm disabled:opacity-40 cursor-pointer flex-1"
                                            >
                                                {cartLoading ? "Adding..." : product.stock <= 0 ? "Out of stock" : "Add to Cart"}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleWishlistToggle}
                                            disabled={wishlistLoading}
                                            className={`px-5 py-3 rounded-lg font-medium text-sm transition border cursor-pointer ${
                                                isWishlisted
                                                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                            }`}
                                        >
                                            {wishlistLoading ? "Saving..." : isWishlisted ? "❤️ Saved" : "🤍 Save"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}