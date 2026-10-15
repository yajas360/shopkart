import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getWishlist } from '../services/wishlistApi';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(null);

  const { user, checkAuth } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    let cancelled = false;

    const fetchWishlistCount = () => {
      getWishlist()
        .then((data) => {
          if (!cancelled && data?.success && typeof data?.count === 'number') {
            setWishlistCount(data.count);
          }
        })
        .catch(() => {});
    };

    fetchWishlistCount();

    window.addEventListener('shopkart:wishlist_change', fetchWishlistCount);

    return () => {
      cancelled = true;
      window.removeEventListener('shopkart:wishlist_change', fetchWishlistCount);
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await checkAuth();
      navigate('/login');
    }
  };

  const displayName = user?.fullName || user?.name || 'Account';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#111B2E]/90 backdrop-blur-xl border-b border-[#1E2D4A] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl shadow-black/40">
      {/* Brand & Desktop Navigation */}
      <div className="flex items-center space-x-6 sm:space-x-8">
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3B82F6] via-[#2563EB] to-[#60A5FA] flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            SK
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#EAF2FF]">
            Shop<span className="text-[#3B82F6] drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">Kart</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1.5">
          <Link
            to="/products"
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              location.pathname.startsWith('/products')
                ? 'text-[#EAF2FF] bg-[#1E2D4A] shadow-inner'
                : 'text-[#94A3B8] hover:text-[#60A5FA] hover:bg-[#1E2D4A]/50'
            }`}
          >
            <span>Products</span>
            <span className="text-xs">🛍️</span>
          </Link>
          <Link
            to="/wishlist"
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-all duration-200 inline-flex items-center gap-1.5 ${
              location.pathname === '/wishlist'
                ? 'text-[#EAF2FF] bg-[#1E2D4A] shadow-inner'
                : 'text-[#94A3B8] hover:text-[#60A5FA] hover:bg-[#1E2D4A]/50'
            }`}
          >
            <span>Wishlist</span>
            {wishlistCount !== null && wishlistCount > 0 ? (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded-full text-[11px] font-bold">
                {wishlistCount}
              </span>
            ) : (
              <span className="text-xs">❤️</span>
            )}
          </Link>
          <Link
            to="/cart"
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-all duration-200 inline-flex items-center gap-1.5 ${
              location.pathname === '/cart'
                ? 'text-[#EAF2FF] bg-[#1E2D4A] shadow-inner'
                : 'text-[#94A3B8] hover:text-[#60A5FA] hover:bg-[#1E2D4A]/50'
            }`}
          >
            <span>Cart</span>
            {cartCount > 0 ? (
              <span className="bg-[#3B82F6]/30 text-[#60A5FA] border border-[#3B82F6]/50 px-1.5 py-0.5 rounded-full text-[11px] font-bold">
                {cartCount}
              </span>
            ) : (
              <span className="text-xs">🛒</span>
            )}
          </Link>
          <Link
            to="/orders"
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-all duration-200 inline-flex items-center gap-1.5 ${
              location.pathname.startsWith('/orders')
                ? 'text-[#EAF2FF] bg-[#1E2D4A] shadow-inner'
                : 'text-[#94A3B8] hover:text-[#60A5FA] hover:bg-[#1E2D4A]/50'
            }`}
          >
            <span>Orders</span>
            <span className="text-xs">📦</span>
          </Link>
        </nav>
      </div>

      {/* Right Controls: Profile pill, Mobile Bar & Logout */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Mobile Navigation Links */}
        <nav className="flex md:hidden items-center space-x-1">
          <Link
            to="/products"
            className={`p-2 rounded-xl text-sm transition ${
              location.pathname.startsWith('/products') ? 'bg-[#1E2D4A] text-[#EAF2FF]' : 'text-[#94A3B8] hover:text-[#60A5FA]'
            }`}
            title="Products"
          >
            🛍️
          </Link>
          <Link
            to="/wishlist"
            className={`p-2 rounded-xl text-sm relative transition ${
              location.pathname === '/wishlist' ? 'bg-[#1E2D4A] text-[#EAF2FF]' : 'text-[#94A3B8] hover:text-[#60A5FA]'
            }`}
            title="Wishlist"
          >
            ❤️
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className={`p-2 rounded-xl text-sm relative transition ${
              location.pathname === '/cart' ? 'bg-[#1E2D4A] text-[#EAF2FF]' : 'text-[#94A3B8] hover:text-[#60A5FA]'
            }`}
            title="Cart"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#3B82F6] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            className={`p-2 rounded-xl text-sm transition ${
              location.pathname.startsWith('/orders') ? 'bg-[#1E2D4A] text-[#EAF2FF]' : 'text-[#94A3B8] hover:text-[#60A5FA]'
            }`}
            title="Orders"
          >
            📦
          </Link>
        </nav>

        {/* Profile Link Badge */}
        <Link
          to="/home"
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition ${
            location.pathname === '/home'
              ? 'bg-[#1E2D4A] border-[#3B82F6]/40 text-[#EAF2FF]'
              : 'bg-[#080D18]/80 hover:bg-[#1E2D4A]/50 border-[#1E2D4A] text-[#94A3B8] hover:text-[#EAF2FF]'
          }`}
          title="Account Profile"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-[#080D18] font-bold text-xs shrink-0">
            {initial}
          </div>
          <span className="text-xs font-semibold hidden sm:inline max-w-[100px] truncate">
            {displayName}
          </span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-xs sm:text-sm font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/25 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          title="Log out"
        >
          <span>Logout</span>
          <span className="hidden sm:inline">↪</span>
        </button>
      </div>
    </header>
  );
}