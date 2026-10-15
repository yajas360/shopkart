import { useState } from "react";
import { Link } from "react-router-dom";
import { removeFromWishlist } from "../services/wishlistApi";
import { useCart } from "../context/CartContext";

export default function WishlistCard({ product, onRemove }) {
    const { addToCart } = useCart();
    const [removing, setRemoving] = useState(false);
    const [movingToCart, setMovingToCart] = useState(false);
    const [error, setError] = useState("");

    const handleRemove = async () => {
        if (removing) return;
        setRemoving(true);
        setError("");

        try {
            await removeFromWishlist(product._id);
            if (onRemove) {
                onRemove(product._id);
            }
            window.dispatchEvent(new CustomEvent("shopkart:wishlist_change"));
        } catch (err) {
            console.error("Remove from wishlist failed:", err);
            setError(err.response?.data?.message || "Failed to remove product");
            setRemoving(false);
        }
    };

    const handleMoveToCart = async () => {
        if (movingToCart || product.stock <= 0) return;
        setMovingToCart(true);
        setError("");

        try {
            const res = await addToCart(product._id);
            if (res.success) {
                await removeFromWishlist(product._id);
                if (onRemove) {
                    onRemove(product._id);
                }
                window.dispatchEvent(new CustomEvent("shopkart:wishlist_change"));
            } else {
                setError(res.message || "Failed to move to cart");
            }
        } catch (err) {
            console.error("Move to cart failed:", err);
            setError("Failed to move to cart");
        } finally {
            setMovingToCart(false);
        }
    };

    return (
        <div className="bg-[#111B2E] rounded-2xl border border-[#1E2D4A] overflow-hidden shadow-lg shadow-black/30 hover:border-[#3B82F6]/60 transition-all duration-300 flex flex-col justify-between group">
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
                </div>

                <div className="p-5">
                    <span className="text-[11px] font-bold text-[#60A5FA] uppercase tracking-wider bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                        {product.category}
                    </span>

                    <h2 className="text-lg font-bold text-[#EAF2FF] mb-2 line-clamp-1 group-hover:text-[#60A5FA] transition-colors">
                        {product.name}
                    </h2>

                    <div className="flex items-baseline justify-between mb-2">
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
                                ? `${product.stock} left`
                                : "Out of stock"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-5 space-y-2">
                {error && (
                    <p className="text-xs text-rose-400 font-medium text-center bg-rose-500/10 border border-rose-500/20 py-1 rounded-lg">
                        {error}
                    </p>
                )}

                <div className="flex flex-col space-y-2">
                    <button
                        onClick={handleMoveToCart}
                        disabled={movingToCart || product.stock <= 0}
                        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#3B82F6]/25 hover:shadow-[#3B82F6]/40 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40"
                    >
                        {movingToCart ? (
                            <span>Moving to Cart...</span>
                        ) : product.stock <= 0 ? (
                            <span>Out of Stock</span>
                        ) : (
                            <span>Move to Cart 🛒</span>
                        )}
                    </button>

                    <Link
                        to={`/products/${product._id}`}
                        className="block text-center bg-[#1E2D4A] text-[#EAF2FF] hover:bg-[#2A3C61] hover:text-[#60A5FA] py-2 rounded-xl font-medium text-sm transition border border-[#1E2D4A]"
                    >
                        View Details
                    </Link>

                    <button
                        onClick={handleRemove}
                        disabled={removing}
                        className="w-full bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/25 py-2 rounded-xl font-medium text-xs sm:text-sm transition flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-40"
                    >
                        {removing ? (
                            <span>Removing...</span>
                        ) : (
                            <span>Remove from Wishlist</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
