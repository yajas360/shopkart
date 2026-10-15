export default function SearchBar({
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort
}) {
    return (
        <div className="bg-[#111B2E] border border-[#1E2D4A] rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/20 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                <div className="md:col-span-2 relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-base pointer-events-none">
                        🔍
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products by name or keywords..."
                        className="w-full bg-[#080D18] border border-[#1E2D4A] text-[#EAF2FF] placeholder-[#94A3B8] rounded-xl pl-10 pr-9 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 transition"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#EAF2FF] text-xs bg-[#1E2D4A] rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition"
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#080D18] border border-[#1E2D4A] text-[#EAF2FF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 transition cursor-pointer"
                    >
                        <option value="" className="bg-[#111B2E] text-[#EAF2FF]">All Categories</option>
                        <option value="Electronics" className="bg-[#111B2E] text-[#EAF2FF]">Electronics</option>
                        <option value="Fashion" className="bg-[#111B2E] text-[#EAF2FF]">Fashion</option>
                        <option value="Books" className="bg-[#111B2E] text-[#EAF2FF]">Books</option>
                        <option value="Home" className="bg-[#111B2E] text-[#EAF2FF]">Home</option>
                    </select>
                </div>

                <div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full bg-[#080D18] border border-[#1E2D4A] text-[#EAF2FF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 transition cursor-pointer"
                    >
                        <option value="" className="bg-[#111B2E] text-[#EAF2FF]">Sort: Default (Newest)</option>
                        <option value="price_asc" className="bg-[#111B2E] text-[#EAF2FF]">Price: Low to High</option>
                        <option value="price_desc" className="bg-[#111B2E] text-[#EAF2FF]">Price: High to Low</option>
                    </select>
                </div>
            </div>
        </div>
    );
}