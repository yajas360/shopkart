import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toggleWishlist } from "../services/wishlistApi";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, isWishlisted: initialIsWishlisted = false, onWishlistChange }) {
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
    const [cartLoading, setCartLoading] = useState(false);
    const [cartFeedback, setCartFeedback] = useState("");

    const cartItem = cartItems.find(
        (item) => (item.product?._id || item.product) === product._id
    );
    const inCart = !!cartItem;
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    useEffect(() => {
        setIsWishlisted(initialIsWishlisted);
    }, [initialIsWishlisted]);

    const handleWishlistClick = async () => {
        if (loading) return;
        setLoading(true);
        setErrorMessage("");

        try {
            const res = await toggleWishlist(product._id);
            const savedState = res.saved ?? !isWishlisted;
            setIsWishlisted(savedState);
            if (onWishlistChange) onWishlistChange(product._id, savedState);
            window.dispatchEvent(new CustomEvent("shopkart:wishlist_change"));
        } catch (err) {
            console.error("Wishlist operation error:", err);
            const msg = err.response?.data?.message || "Unable to save product.";
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(""), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (cartLoading || product.stock <= 0) return;
        setCartLoading(true);
        setCartFeedback("");

        const res = await addToCart(product._id);
        if (res.success) {
            setCartFeedback("Added to cart");
        } else {
            setCartFeedback(res.message);
        }
        setCartLoading(false);
        setTimeout(() => setCartFeedback(""), 2500);
    };

    const handleIncrease = async () => {
        if (cartLoading || quantityInCart >= product.stock) return;
        setCartLoading(true);
        setCartFeedback("");

        const res = await updateQuantity(product._id, quantityInCart + 1);
        if (!res.success) {
            setCartFeedback(res.message);
            setTimeout(() => setCartFeedback(""), 2500);
        }
        setCartLoading(false);
    };

    const handleDecrease = async () => {
        if (cartLoading) return;
        setCartLoading(true);
        setCartFeedback("");

        if (quantityInCart <= 1) {
            const res = await removeFromCart(product._id);
            if (!res.success) {
                setCartFeedback(res.message);
                setTimeout(() => setCartFeedback(""), 2500);
            }
        } else {
            const res = await updateQuantity(product._id, quantityInCart - 1);
            if (!res.success) {
                setCartFeedback(res.message);
                setTimeout(() => setCartFeedback(""), 2500);
            }
        }
        setCartLoading(false);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
            <div>
                <div className="relative bg-slate-50 overflow-hidden aspect-4/3 flex items-center justify-center p-3">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.src = "/images/products/placeholder.svg";
                        }}
                    />
                    <button
                        onClick={handleWishlistClick}
                        disabled={loading}
                        title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-lg transition cursor-pointer shadow-xs ${
                            isWishlisted
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-white/90 text-slate-400 hover:text-red-500 border border-slate-200 hover:bg-white"
                        }`}
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                </div>

                <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
                            {product.category}
                        </span>
                        <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                                product.stock > 0
                                    ? "text-emerald-700 bg-emerald-50"
                                    : "text-red-700 bg-red-50"
                            }`}
                        >
                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {product.name}
                    </h3>

                    <p className="text-lg font-bold text-slate-900">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>
                </div>
            </div>

            <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-2">
                {errorMessage && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 py-1 px-2 rounded text-center">
                        {errorMessage}
                    </p>
                )}

                {cartFeedback && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 py-1 px-2 rounded text-center font-medium">
                        {cartFeedback}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <Link
                        to={`/products/${product._id}`}
                        className="text-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-lg font-medium text-xs transition"
                    >
                        Details
                    </Link>

                    <button
                        onClick={handleWishlistClick}
                        disabled={loading}
                        className={`py-2 px-1 rounded-lg font-medium text-xs transition border cursor-pointer ${
                            isWishlisted
                                ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {loading ? "Saving..." : isWishlisted ? "Saved" : "Save"}
                    </button>
                </div>

                {inCart ? (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={handleDecrease}
                            disabled={cartLoading}
                            className="w-7 h-7 rounded bg-white text-slate-700 hover:bg-slate-200 font-bold border border-slate-200 flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                        >
                            -
                        </button>

                        <div className="text-xs font-semibold text-slate-700">
                            Qty: <span className="text-slate-900 font-bold">{quantityInCart}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleIncrease}
                            disabled={cartLoading || quantityInCart >= product.stock}
                            className="w-7 h-7 rounded bg-white text-slate-700 hover:bg-slate-200 font-bold border border-slate-200 flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        disabled={cartLoading || product.stock <= 0}
                        className="w-full py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition bg-slate-900 hover:bg-emerald-600 text-white disabled:opacity-40 disabled:hover:bg-slate-900 cursor-pointer shadow-xs"
                    >
                        {cartLoading ? "Adding..." : product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                )}
            </div>
        </div>
    );
}