import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { getProducts } from "../services/productApi.js";
import { getWishlist } from "../services/wishlistApi.js";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const [productsData, wishlistData] = await Promise.allSettled([
                    getProducts(search, category, sort),
                    getWishlist()
                ]);

                if (!cancelled) {
                    if (productsData.status === "fulfilled") {
                        setProducts(productsData.value.products || []);
                    } else {
                        setError(
                            productsData.reason?.response?.data?.message ||
                            "Failed to load products."
                        );
                    }

                    if (wishlistData.status === "fulfilled" && wishlistData.value?.wishlist) {
                        const ids = wishlistData.value.wishlist.map(item => item._id || item);
                        setWishlistIds(ids);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setProducts([]);
                    setError("Failed to load products.");
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
    }, [search, category, sort]);

    const handleWishlistChange = (productId, isAdded) => {
        setWishlistIds((prev) =>
            isAdded ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
        window.dispatchEvent(new CustomEvent("shopkart:wishlist_change"));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                Products
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Curated electronics, apparel, and lifestyle goods.
                            </p>
                        </div>
                        {products.length > 0 && (
                            <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200 shadow-xs">
                                {products.length} {products.length === 1 ? 'item' : 'items'}
                            </span>
                        )}
                    </div>
                </div>

                <SearchBar
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                    sort={sort}
                    setSort={setSort}
                />

                {loading && (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-slate-700 font-medium text-sm">Loading items...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-16 bg-white rounded-xl border border-red-200 p-8 shadow-xs">
                        <p className="text-red-600 font-semibold mb-2 text-sm">{error}</p>
                        <p className="text-slate-500 text-xs">Please refresh or try again shortly.</p>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200/90 p-8 shadow-xs">
                        <h3 className="text-base font-semibold text-slate-900 mb-1">No products found</h3>
                        <p className="text-slate-500 text-xs max-w-sm mx-auto mb-5">
                            We couldn't find items matching your search or filters.
                        </p>
                        {(search || category) && (
                            <button
                                onClick={() => { setSearch(''); setCategory(''); }}
                                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-medium transition cursor-pointer"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                isWishlisted={wishlistIds.includes(product._id)}
                                onWishlistChange={handleWishlistChange}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}