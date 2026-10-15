import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProductById } from "../services/productApi.js";
import { addToWishlist, removeFromWishlist, getWishlist, toggleWishlist } from "../services/wishlistApi.js";
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
                            "Something went wrong while loading the product."
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
                    setError("Something went wrong while loading the product.");
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
            setFeedbackMsg(savedState ? "Added to wishlist ❤️" : "Removed from wishlist");
            window.dispatchEvent(new CustomEvent("shopkart:wishlist_change"));
            setTimeout(() => setFeedbackMsg(""), 3000);
        } catch (err) {
            console.error("Wishlist toggle error:", err);
            const msg = err.response?.data?.message || "Failed to update wishlist.";
            setFeedbackMsg(msg);
            setTimeout(() => setFeedbackMsg(""), 3000);
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
            setFeedbackMsg("Product added to cart! 🛒");
        } else {
            setFeedbackMsg(res.message);
        }
        setCartLoading(false);
        setTimeout(() => setFeedbackMsg(""), 3500);
    };

    const handleIncrease = async () => {
        if (cartLoading || !product || quantityInCart >= product.stock) return;
        setCartLoading(true);
        setFeedbackMsg("");
        const res = await updateQuantity(id, quantityInCart + 1);
        if (!res.success) {
            setFeedbackMsg(res.message);
            setTimeout(() => setFeedbackMsg(""), 3500);
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
                setTimeout(() => setFeedbackMsg(""), 3500);
            }
        } else {
            const res = await updateQuantity(id, quantityInCart - 1);
            if (!res.success) {
                setFeedbackMsg(res.message);
                setTimeout(() => setFeedbackMsg(""), 3500);
            }
        }
        setCartLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#080D18] text-[#EAF2FF]">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-6">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#60A5FA] transition font-medium"
                    >
                        <span>&larr;</span>
                        <span>Back to all products</span>
                    </Link>
                </div>

                {loading && (
                    <div className="text-center py-20 bg-[#111B2E] rounded-3xl border border-[#1E2D4A]">
                        <div className="w-12 h-12 border-4 border-[#1E2D4A] border-t-[#3B82F6] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[#EAF2FF] font-semibold">Loading product details...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-16 bg-[#111B2E] rounded-3xl border border-rose-500/30 p-8 max-w-lg mx-auto">
                        <div className="text-3xl mb-3">⚠️</div>
                        <p className="text-rose-400 font-semibold mb-5">
                            {error}
                        </p>
                        <Link
                            to="/products"
                            className="inline-block bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] px-6 py-2.5 rounded-xl font-semibold transition"
                        >
                            Return to Products
                        </Link>
                    </div>
                )}

                {!loading && !error && product && (
                    <div className="bg-[#111B2E] rounded-3xl border border-[#1E2D4A] shadow-2xl shadow-black/50 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="bg-[#080D18] relative flex items-center justify-center p-6 sm:p-10 border-b md:border-b-0 md:border-r border-[#1E2D4A]">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full max-h-[500px] object-cover rounded-2xl shadow-md"
                                    onError={(e) => {
                                        e.currentTarget.src = "/images/products/placeholder.svg";
                                    }}
                                />
                            </div>

                            <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
                                <div>
                                    <span className="text-xs font-bold text-[#60A5FA] uppercase tracking-wider bg-[#3B82F6]/10 border border-[#3B82F6]/25 px-3 py-1 rounded-full inline-block mb-3">
                                        {product.category}
                                    </span>

                                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#EAF2FF] tracking-tight mb-4">
                                        {product.name}
                                    </h1>

                                    <div className="flex items-baseline gap-4 mb-6">
                                        <p className="text-3xl sm:text-4xl font-black text-[#EAF2FF]">
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </p>
                                        <p
                                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                                product.stock > 0
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                            }`}
                                        >
                                            {product.stock > 0
                                                ? `${product.stock} units available`
                                                : "Out of stock"}
                                        </p>
                                    </div>

                                    <div className="border-t border-[#1E2D4A] pt-5 mb-6">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Description</h3>
                                        <p className="text-[#94A3B8] leading-relaxed text-sm sm:text-base">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {feedbackMsg && (
                                        <div className="p-3 mb-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#60A5FA] text-sm font-semibold text-center animate-pulse">
                                            {feedbackMsg}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#1E2D4A]">
                                        {inCart ? (
                                            <div className="flex items-center justify-between bg-[#080D18] border border-[#1E2D4A] rounded-xl p-2 min-w-[200px]">
                                                <button
                                                    type="button"
                                                    onClick={handleDecrease}
                                                    disabled={cartLoading}
                                                    title={quantityInCart === 1 ? "Remove from cart" : "Decrease quantity"}
                                                    className="w-10 h-10 rounded-lg bg-[#1E2D4A] text-[#60A5FA] font-bold hover:bg-[#3B82F6] hover:text-white flex items-center justify-center transition disabled:opacity-30 cursor-pointer text-lg"
                                                >
                                                    -
                                                </button>

                                                <div className="flex items-center space-x-2 text-xs font-bold px-3">
                                                    <span className="text-[#94A3B8]">In Cart:</span>
                                                    <span className="bg-[#1E2D4A] text-[#EAF2FF] px-3 py-1 rounded-md text-base font-black">
                                                        {quantityInCart}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleIncrease}
                                                    disabled={cartLoading || quantityInCart >= product.stock}
                                                    title={
                                                        quantityInCart >= product.stock
                                                            ? `Max stock (${product.stock}) reached`
                                                            : "Increase quantity"
                                                    }
                                                    className="w-10 h-10 rounded-lg bg-[#1E2D4A] text-[#60A5FA] font-bold hover:bg-[#3B82F6] hover:text-white flex items-center justify-center transition disabled:opacity-30 cursor-pointer text-lg"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleAddToCart}
                                                disabled={cartLoading || product.stock <= 0}
                                                className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] px-8 py-3.5 rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-[#3B82F6]/30 hover:shadow-[#3B82F6]/50 disabled:opacity-40 cursor-pointer flex-1"
                                            >
                                                {cartLoading ? (
                                                    <span>⏳ Adding...</span>
                                                ) : product.stock <= 0 ? (
                                                    <span>Out of stock</span>
                                                ) : (
                                                    <span>🛒 Add to Cart</span>
                                                )}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleWishlistToggle}
                                            disabled={wishlistLoading}
                                            className={`px-6 py-3.5 rounded-xl font-medium transition flex items-center justify-center space-x-2 cursor-pointer ${
                                                isWishlisted
                                                    ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25"
                                                    : "bg-[#1E2D4A] text-[#EAF2FF] hover:bg-[#2A3C61] border border-[#1E2D4A]"
                                            }`}
                                        >
                                            {wishlistLoading ? (
                                                <span>⏳ Saving...</span>
                                            ) : isWishlisted ? (
                                                <span>❤️ In Wishlist</span>
                                            ) : (
                                                <span>🤍 Save to Wishlist</span>
                                            )}
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