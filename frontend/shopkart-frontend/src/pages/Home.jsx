import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.fullName || user?.name || 'Customer';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shrink-0">
                {initial}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md inline-block mb-1">
                  Active Customer
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {displayName}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Manage your orders, saved items, and account details.
                </p>
              </div>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm cursor-pointer shrink-0"
            >
              <span>Browse Catalog</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Account Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                <span className="text-xs text-slate-500 block mb-1">Full Name</span>
                <span className="text-sm font-semibold text-slate-900">{displayName}</span>
              </div>
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                <span className="text-xs text-slate-500 block mb-1">Email Address</span>
                <span className="text-sm font-semibold text-slate-900 break-all">{user?.email || 'N/A'}</span>
              </div>
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                <span className="text-xs text-slate-500 block mb-1">Phone Number</span>
                <span className="text-sm font-semibold text-slate-900">{user?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Quick Shortcuts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/products"
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg mb-3 font-semibold">
                    🛍️
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Product Catalog
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Explore available tech, fashion, and everyday essentials.
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-700 mt-4 flex items-center gap-1">
                  View products &rarr;
                </span>
              </Link>

              <Link
                to="/orders"
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-lg mb-3 font-semibold">
                    📦
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Order History
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Check your past orders and verify payment references.
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-700 mt-4 flex items-center gap-1">
                  View history &rarr;
                </span>
              </Link>

              <Link
                to="/wishlist"
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-lg mb-3 font-semibold">
                    ❤️
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Saved Items
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Items you've bookmarked to purchase later.
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-700 mt-4 flex items-center gap-1">
                  View saved &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}