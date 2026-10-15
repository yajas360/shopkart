import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D18] text-[#EAF2FF]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1E2D4A] border-t-[#3B82F6] rounded-full animate-spin mx-auto" />
          <p className="text-[#94A3B8] text-sm font-medium">Loading customer profile...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.fullName || user?.name || 'Customer';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#080D18] text-[#EAF2FF]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-[#111B2E] rounded-3xl p-6 sm:p-10 border border-[#1E2D4A] shadow-2xl shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[#1E2D4A]">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-[#080D18] font-black text-2xl sm:text-3xl shadow-lg shadow-[#3B82F6]/25 shrink-0">
                {initial}
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#60A5FA] uppercase tracking-wider bg-[#3B82F6]/10 border border-[#3B82F6]/25 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Verified Customer
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#EAF2FF] tracking-tight">
                  Welcome, {displayName}!
                </h1>
                <p className="text-[#94A3B8] text-sm mt-0.5">
                  Manage your ShopKart account and access quick shortcuts below.
                </p>
              </div>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-[#3B82F6]/25 text-sm cursor-pointer shrink-0"
            >
              <span>Explore Products</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="text-base font-bold text-[#EAF2FF] uppercase tracking-wider text-xs mb-4 text-[#94A3B8]">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#080D18] border border-[#1E2D4A] rounded-2xl p-4 sm:p-5">
                <span className="text-xs text-[#94A3B8] block mb-1">Full Name</span>
                <span className="text-base font-bold text-[#EAF2FF]">{displayName}</span>
              </div>
              <div className="bg-[#080D18] border border-[#1E2D4A] rounded-2xl p-4 sm:p-5">
                <span className="text-xs text-[#94A3B8] block mb-1">Email Address</span>
                <span className="text-base font-bold text-[#EAF2FF] break-all">{user?.email || 'N/A'}</span>
              </div>
              <div className="bg-[#080D18] border border-[#1E2D4A] rounded-2xl p-4 sm:p-5">
                <span className="text-xs text-[#94A3B8] block mb-1">Phone Number</span>
                <span className="text-base font-bold text-[#EAF2FF]">{user?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-[#1E2D4A]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-4">
              Quick Shortcuts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/products"
                className="bg-[#080D18] hover:bg-[#1E2D4A]/50 border border-[#1E2D4A] hover:border-[#3B82F6]/40 rounded-2xl p-5 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 text-[#60A5FA] flex items-center justify-center text-xl mb-3">
                    🛍️
                  </div>
                  <h3 className="font-bold text-[#EAF2FF] group-hover:text-[#60A5FA] transition-colors">
                    Product Catalog
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Browse all available electronics, fashion, and home goods.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#60A5FA] mt-4 flex items-center gap-1">
                  Browse items &rarr;
                </span>
              </Link>

              <Link
                to="/orders"
                className="bg-[#080D18] hover:bg-[#1E2D4A]/50 border border-[#1E2D4A] hover:border-[#3B82F6]/40 rounded-2xl p-5 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 text-[#60A5FA] flex items-center justify-center text-xl mb-3">
                    📦
                  </div>
                  <h3 className="font-bold text-[#EAF2FF] group-hover:text-[#60A5FA] transition-colors">
                    Order History
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Track current shipments and view details of past purchases.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#60A5FA] mt-4 flex items-center gap-1">
                  View orders &rarr;
                </span>
              </Link>

              <Link
                to="/wishlist"
                className="bg-[#080D18] hover:bg-[#1E2D4A]/50 border border-[#1E2D4A] hover:border-[#3B82F6]/40 rounded-2xl p-5 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl mb-3">
                    ❤️
                  </div>
                  <h3 className="font-bold text-[#EAF2FF] group-hover:text-[#60A5FA] transition-colors">
                    Saved Wishlist
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Quickly check saved products and move them straight to your cart.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#60A5FA] mt-4 flex items-center gap-1">
                  Check wishlist &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}