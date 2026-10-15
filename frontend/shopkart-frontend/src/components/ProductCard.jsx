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
            const msg = err.response?.data?.message || "Unable to save product. Please try again.";
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(""), 3500);
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
            setCartFeedback("Added to cart! 🛒");
        } else {
            setCartFeedback(res.message);
        }
        setCartLoading(false);
        setTimeout(() => setCartFeedback(""), 3000);
    };

    const handleIncrease = async () => {
        if (cartLoading || quantityInCart >= product.stock) return;
        setCartLoading(true);
        setCartFeedback("");

        const res = await updateQuantity(product._id, quantityInCart + 1);
        if (!res.success) {
            setCartFeedback(res.message);
            setTimeout(() => setCartFeedback(""), 3000);
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
                setTimeout(() => setCartFeedback(""), 3000);
            }
        } else {
            const res = await updateQuantity(product._id, quantityInCart - 1);
            if (!res.success) {
                setCartFeedback(res.message);
                setTimeout(() => setCartFeedback(""), 3000);
            }
        }
        setCartLoading(false);
    };

    return (
        <div className="bg-[#111B2E] rounded-2xl border border-[#1E2D4A] overflow-hidden shadow-lg shadow-black/30 hover:border-[#3B82F6]/60 hover:shadow-xl hover:shadow-[#3B82F6]/10 transition-all duration-300 flex flex-col justify-between group">
            <div>
                <div className="relative overflow-hidden bg-[#080D18]">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-56 object-cover bg-[#080D18] group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.currentTarget.src = "/images/products/placeholder.svg";
                        }}
                    />
                    <button
                        onClick={handleWishlistClick}
                        disabled={loading}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition cursor-pointer shadow-md ${
                            isWishlisted
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                : "bg-[#111B2E]/80 text-[#94A3B8] hover:text-rose-400 border border-[#1E2D4A] hover:bg-[#111B2E]"
                        }`}
                    >
                        {loading ? "⏳" : isWishlisted ? "❤️" : "🤍"}
                    </button>
                </div>

                <div className="p-5">
                    <span className="text-[11px] font-bold text-[#60A5FA] uppercase tracking-wider bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                        {product.category}
                    </span>

                    <h2 className="text-lg font-bold text-[#EAF2FF] mb-2 line-clamp-1 group-hover:text-[#60A5FA] transition-colors">
                        {product.name}
                    </h2>

                    <div className="flex items-baseline justify-between mb-3">
                        <p className="text-2xl font-black text-[#EAF2FF]">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>

                        <p
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                product.stock > 0
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                        >
                            {product.stock > 0
                                ? `${product.stock} in stock`
                                : "Out of stock"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-5 space-y-2.5">
                {errorMessage && (
                    <p className="text-xs text-rose-400 font-medium text-center bg-rose-500/10 border border-rose-500/20 py-1 rounded-lg">
                        {errorMessage}
                    </p>
                )}

                {cartFeedback && (
                    <p className="text-xs text-[#60A5FA] font-semibold text-center bg-[#3B82F6]/10 border border-[#3B82F6]/25 py-1 rounded-lg">
                        {cartFeedback}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <Link
                        to={`/products/${product._id}`}
                        className="block text-center bg-[#1E2D4A] text-[#EAF2FF] py-2 rounded-xl font-medium text-xs sm:text-sm hover:bg-[#2A3C61] hover:text-[#60A5FA] transition border border-[#1E2D4A]"
                    >
                        View Details
                    </Link>

                    <button
                        onClick={handleWishlistClick}
                        disabled={loading}
                        className={`w-full py-2 px-1 rounded-xl font-medium text-xs transition flex items-center justify-center space-x-1 cursor-pointer ${
                            loading
                                ? "bg-[#1E2D4A] text-[#94A3B8] opacity-50 cursor-not-allowed"
                                : isWishlisted
                                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25"
                                : "bg-[#1E2D4A] text-[#94A3B8] hover:text-[#EAF2FF] hover:bg-[#2A3C61] border border-[#1E2D4A]"
                        }`}
                    >
                        {loading ? (
                            <span>⏳ Saving...</span>
                        ) : isWishlisted ? (
                            <span>❤️ Saved</span>
                        ) : (
                            <span>🤍 Wishlist</span>
                        )}
                    </button>
                </div>

                {inCart ? (
                    <div className="w-full flex items-center justify-between bg-[#080D18] border border-[#1E2D4A] rounded-xl p-1">
                        <button
                            type="button"
                            onClick={handleDecrease}
                            disabled={cartLoading}
                            title={quantityInCart === 1 ? "Remove from cart" : "Decrease quantity"}
                            className="w-8 h-8 rounded-lg bg-[#1E2D4A] text-[#60A5FA] font-bold hover:bg-[#3B82F6] hover:text-white flex items-center justify-center disabled:opacity-30 cursor-pointer transition"
                        >
                            -
                        </button>

                        <div className="flex items-center space-x-1.5 text-xs text-[#94A3B8] font-bold">
                            <span>In Cart:</span>
                            <span className="bg-[#1E2D4A] text-[#EAF2FF] px-2 py-0.5 rounded font-black text-sm">
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
                            className="w-8 h-8 rounded-lg bg-[#1E2D4A] text-[#60A5FA] font-bold hover:bg-[#3B82F6] hover:text-white flex items-center justify-center disabled:opacity-30 cursor-pointer transition"
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        disabled={cartLoading || product.stock <= 0}
                        className="w-full py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] shadow-lg shadow-[#3B82F6]/25 hover:shadow-[#3B82F6]/40 disabled:opacity-40 cursor-pointer"
                    >
                        {cartLoading ? (
                            <span>⏳ Adding...</span>
                        ) : product.stock <= 0 ? (
                            <span>Out of Stock</span>
                        ) : (
                            <span>🛒 Add to Cart</span>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}