import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { getWishlist } from "../services/wishlistApi";

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await getWishlist();
            if (data && data.success) {
                setWishlist(data.wishlist || []);
            } else {
                setWishlist(data?.wishlist || []);
            }
        } catch (err) {
            console.error("Fetch wishlist error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveFromWishlist = (productId) => {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
    };

    return (
        <div className="min-h-screen bg-[#080D18] text-[#EAF2FF] flex flex-col">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111B2E] rounded-3xl border border-[#1E2D4A]">
                        <div className="w-12 h-12 border-4 border-[#1E2D4A] border-t-[#3B82F6] rounded-full animate-spin mb-4"></div>
                        <p className="text-[#EAF2FF] font-semibold">Loading your wishlist...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto bg-[#111B2E] rounded-3xl border border-rose-500/30 p-8 shadow-xl">
                        <div className="text-4xl mb-3">⚠️</div>
                        <h2 className="text-2xl font-bold text-[#EAF2FF] mb-2">Something went wrong</h2>
                        <p className="text-[#94A3B8] mb-6 text-sm">We couldn't load your saved wishlist products.</p>
                        <button
                            onClick={fetchWishlist}
                            className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] px-6 py-2.5 rounded-xl font-semibold transition cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && wishlist.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto bg-[#111B2E] rounded-3xl border border-[#1E2D4A] p-10 shadow-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-3xl mb-4">
                            ❤️
                        </div>
                        <h2 className="text-2xl font-bold text-[#EAF2FF] mb-2">Your wishlist is empty</h2>
                        <p className="text-[#94A3B8] mb-6 text-sm max-w-xs leading-relaxed">
                            Save products you're interested in while browsing and access them anytime.
                        </p>
                        <Link
                            to="/products"
                            className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#3B82F6]/30 transition"
                        >
                            Explore Products
                        </Link>
                    </div>
                )}

                {!loading && !error && wishlist.length > 0 && (
                    <div>
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#EAF2FF] tracking-tight">My Wishlist</h1>
                                <p className="text-[#94A3B8] text-sm mt-1">
                                    {wishlist.length} {wishlist.length === 1 ? "saved item" : "saved items"} ready to review or move to cart
                                </p>
                            </div>
                            <Link
                                to="/products"
                                className="self-start sm:self-auto text-xs font-semibold px-4 py-2 rounded-xl bg-[#1E2D4A] text-[#EAF2FF] hover:text-[#60A5FA] border border-[#1E2D4A] transition"
                            >
                                + Browse More Products
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {wishlist.map((product) => (
                                <WishlistCard
                                    key={product._id}
                                    product={product}
                                    onRemove={handleRemoveFromWishlist}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
