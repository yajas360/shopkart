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
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
            <div>
                <div className="relative bg-slate-50 aspect-4/3 flex items-center justify-center p-3">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.src = "/images/products/placeholder.svg";
                        }}
                    />
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
                {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 py-1 px-2 rounded text-center">
                        {error}
                    </p>
                )}

                <div className="flex flex-col space-y-1.5">
                    <button
                        onClick={handleMoveToCart}
                        disabled={movingToCart || product.stock <= 0}
                        className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer disabled:opacity-40"
                    >
                        {movingToCart ? "Moving..." : product.stock <= 0 ? "Out of Stock" : "Move to Cart"}
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                        <Link
                            to={`/products/${product._id}`}
                            className="text-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 rounded-lg font-medium text-xs transition"
                        >
                            Details
                        </Link>

                        <button
                            onClick={handleRemove}
                            disabled={removing}
                            className="bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 py-1.5 rounded-lg font-medium text-xs transition cursor-pointer disabled:opacity-40"
                        >
                            {removing ? "Removing..." : "Remove"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
