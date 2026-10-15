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
      localStorage.removeItem('shopkart_token');
      localStorage.removeItem('token');
      await checkAuth();
      navigate('/login');
    }
  };

  const displayName = user?.fullName || user?.name || 'Account';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
      {/* Brand & Desktop Navigation */}
      <div className="flex items-center space-x-6 sm:space-x-8">
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-tighter group-hover:bg-emerald-600 transition-colors">
            SK
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            ShopKart<span className="text-emerald-600">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/products"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname.startsWith('/products')
                ? 'text-slate-900 bg-slate-100 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Products
          </Link>
          <Link
            to="/wishlist"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              location.pathname === '/wishlist'
                ? 'text-slate-900 bg-slate-100 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Wishlist</span>
            {wishlistCount !== null && wishlistCount > 0 && (
              <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded-full text-[11px] font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              location.pathname === '/cart'
                ? 'text-slate-900 bg-slate-100 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded-full text-[11px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname.startsWith('/orders')
                ? 'text-slate-900 bg-slate-100 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Orders
          </Link>
        </nav>
      </div>

      {/* Right Controls: Profile pill, Mobile Bar & Logout */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Mobile Nav Links */}
        <nav className="flex md:hidden items-center space-x-1">
          <Link
            to="/products"
            className={`p-2 rounded-lg text-sm font-medium transition ${
              location.pathname.startsWith('/products') ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            Shop
          </Link>
          <Link
            to="/wishlist"
            className={`p-2 rounded-lg text-sm font-medium relative transition ${
              location.pathname === '/wishlist' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            Saved
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className={`p-2 rounded-lg text-sm font-medium relative transition ${
              location.pathname === '/cart' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            className={`p-2 rounded-lg text-sm font-medium transition ${
              location.pathname.startsWith('/orders') ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            Orders
          </Link>
        </nav>

        {/* Profile Link Badge */}
        <Link
          to="/home"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700"
          title="Account Profile"
        >
          <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {initial}
          </div>
          <span className="text-xs font-medium hidden sm:inline max-w-[100px] truncate">
            {displayName}
          </span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
}