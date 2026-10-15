import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, itemLoaders } = useCart();

  if (!product) return null;

  const isUpdating = itemLoaders?.[product._id] === 'updating';
  const isRemoving = itemLoaders?.[product._id] === 'removing';
  const isBusy = isUpdating || isRemoving;

  const itemSubtotal = (Number(product.price) || 0) * quantity;
  const isMaxStock = quantity >= product.stock;

  const handleIncrement = () => {
    if (isBusy || isMaxStock) return;
    updateQuantity(product._id, quantity + 1);
  };

  const handleDecrement = () => {
    if (isBusy || quantity <= 1) return;
    updateQuantity(product._id, quantity - 1);
  };

  const handleRemove = () => {
    if (isBusy) return;
    removeFromCart(product._id);
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs transition-all ${
        isBusy ? 'opacity-60' : 'hover:border-slate-300'
      }`}
      id={`cart-item-${product._id}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to={`/products/${product._id}`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0 p-1 flex items-center justify-center"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
              onError={(e) => {
                e.currentTarget.src = "/images/products/placeholder.svg";
              }}
            />
          </Link>

          <div className="min-w-0 space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 inline-block">
              {product.category}
            </span>
            <Link
              to={`/products/${product._id}`}
              className="block font-semibold text-slate-900 hover:text-emerald-700 transition-colors truncate text-sm sm:text-base"
              title={product.name}
            >
              {product.name}
            </Link>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Unit: ₹{Number(product.price).toLocaleString('en-IN')}</span>
            </div>
            {isMaxStock && (
              <span className="text-[11px] font-medium text-amber-700 block">
                Max stock reached ({product.stock} units)
              </span>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-right sm:order-1">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              ₹{itemSubtotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:order-2">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1 || isBusy}
                type="button"
                className="w-7 h-7 rounded bg-white text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-sm cursor-pointer flex items-center justify-center border border-slate-200"
                id={`cart-qty-dec-${product._id}`}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span
                className="w-8 text-center font-semibold text-xs text-slate-900"
                id={`cart-qty-val-${product._id}`}
              >
                {isUpdating ? "..." : quantity}
              </span>

              <button
                onClick={handleIncrement}
                disabled={isMaxStock || isBusy}
                type="button"
                className="w-7 h-7 rounded bg-white text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-sm cursor-pointer flex items-center justify-center border border-slate-200"
                id={`cart-qty-inc-${product._id}`}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={handleRemove}
              disabled={isBusy}
              type="button"
              className="p-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition cursor-pointer disabled:opacity-40"
              id={`cart-remove-${product._id}`}
              title="Remove item"
            >
              {isRemoving ? "..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
