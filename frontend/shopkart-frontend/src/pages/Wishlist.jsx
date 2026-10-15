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
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200/90 shadow-xs">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                        <p className="text-slate-600 font-medium text-xs">Loading saved items...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto bg-white rounded-xl border border-red-200 p-6 shadow-xs">
                        <h2 className="text-base font-bold text-slate-900 mb-1">Failed to load wishlist</h2>
                        <p className="text-slate-500 mb-4 text-xs">Could not retrieve saved items.</p>
                        <button
                            onClick={fetchWishlist}
                            className="bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && wishlist.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto bg-white rounded-xl border border-slate-200/90 p-8 shadow-xs">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl mb-3">
                            ❤️
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Your wishlist is empty</h2>
                        <p className="text-slate-500 mb-5 text-xs max-w-xs leading-relaxed">
                            Bookmark items you'd like to save for later while shopping.
                        </p>
                        <Link
                            to="/products"
                            className="bg-slate-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition"
                        >
                            Browse Products
                        </Link>
                    </div>
                )}

                {!loading && !error && wishlist.length > 0 && (
                    <div>
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Wishlist</h1>
                                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                                    {wishlist.length} {wishlist.length === 1 ? "saved item" : "saved items"}
                                </p>
                            </div>
                            <Link
                                to="/products"
                                className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-xs"
                            >
                                + Explore More
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
