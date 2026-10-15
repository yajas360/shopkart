export default function SearchBar({
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort
}) {
    return (
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2 relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg pl-10 pr-8 py-2.5 text-sm outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs w-5 h-5 flex items-center justify-center cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Books">Books</option>
                        <option value="Home">Home</option>
                    </select>
                </div>

                <div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition cursor-pointer"
                    >
                        <option value="">Sort: Featured</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>
        </div>
    );
}