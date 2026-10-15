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
                            "Something went wrong while loading products."
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
                    setError("Something went wrong while loading products.");
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
        <div className="min-h-screen bg-[#080D18] text-[#EAF2FF]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#EAF2FF] tracking-tight">
                                Explore Products
                            </h1>
                            <p className="text-[#94A3B8] text-sm sm:text-base mt-1.5">
                                Discover premium electronics, fashion, and home essentials.
                            </p>
                        </div>
                        {products.length > 0 && (
                            <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-[#111B2E] text-[#60A5FA] border border-[#1E2D4A]">
                                {products.length} {products.length === 1 ? 'Product' : 'Products'} Available
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
                    <div className="text-center py-20 bg-[#111B2E]/50 rounded-2xl border border-[#1E2D4A]">
                        <div className="w-12 h-12 border-4 border-[#1E2D4A] border-t-[#3B82F6] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[#EAF2FF] font-semibold">Loading products...</p>
                        <p className="text-[#94A3B8] text-xs mt-1">Fetching latest inventory from server</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-16 bg-[#111B2E] rounded-2xl border border-rose-500/30 p-8">
                        <div className="text-3xl mb-2">⚠️</div>
                        <p className="text-rose-400 font-semibold mb-2">
                            {error}
                        </p>
                        <p className="text-[#94A3B8] text-sm">Please refresh the page or try again shortly.</p>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-20 bg-[#111B2E] rounded-2xl border border-[#1E2D4A] p-8">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="text-xl font-bold text-[#EAF2FF] mb-2">No products found</h3>
                        <p className="text-[#94A3B8] text-sm max-w-md mx-auto mb-6">
                            We couldn't find any products matching your filters. Try clearing your search or switching categories.
                        </p>
                        {(search || category) && (
                            <button
                                onClick={() => { setSearch(''); setCategory(''); }}
                                className="px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] text-sm font-semibold transition cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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