import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash, ArrowRight, Bag, Tag } from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { resolveProductImageUrl } from '../lib/supabase';
import { formatCurrency } from '../lib/pricing';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartItemQuantity,
    updateCartItemSize,
    removeFromCart,
    cartSubtotal,
    cartFinalTotal,
    couponDiscountAmount,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
    coupons,
    cartTotalCount,
    products,
    currentUser
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    const res = applyCouponCode(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const freeShippingThreshold = 1500;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-md bg-canvas border-l border-border flex flex-col shadow-xl animate-in slide-in-from-right duration-300"
          aria-label="Shopping Cart Drawer"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-wide text-primary uppercase">
                Shopping Bag
              </h2>
              <span className="text-xs text-muted tabular-nums">
                ({cartTotalCount} {cartTotalCount === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-muted hover:text-primary rounded-input hover:bg-surface transition-colors"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="px-5 py-3 bg-surface border-b border-border text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-muted">
                Add <span className="font-semibold text-primary tabular-nums">{formatCurrency(remainingForFreeShipping)}</span> more to unlock complimentary express shipping.
              </p>
            ) : (
              <p className="text-success font-medium flex items-center gap-1.5">
                <span>✓</span> You have unlocked complimentary express shipping.
              </p>
            )}
            <div className="mt-2 w-full h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-border">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-muted mb-3">
                  <Bag size={24} />
                </div>
                <h3 className="text-sm font-medium text-primary">Your bag is empty</h3>
                <p className="text-xs text-muted mt-1 max-w-[220px]">
                  Explore the Purgatory — Falling Flames archive to get started.
                </p>
                <Link
                  to="/catalogue"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center"
                >
                  Explore Archive
                </Link>
              </div>
            ) : (
              cart.map(item => {
                const parentProduct = products.find(p => p.id === item.productId);
                // Available size variants for inline edit
                const availableSizes = parentProduct
                  ? parentProduct.variants.filter(v => v.color_name === item.colorName)
                  : [];

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    {/* 4:5 Thumbnail */}
                    <div className="w-20 aspect-[4/5] bg-surface rounded-input overflow-hidden border border-border shrink-0">
                      <img
                        src={resolveProductImageUrl(item.image)}
                        alt={item.productName}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Details & Controls */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-medium text-primary leading-snug">
                            {item.productName}
                          </h4>
                          <span className="text-xs font-semibold text-primary tabular-nums shrink-0">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-border"
                              style={{ backgroundColor: item.colorHex }}
                            />
                            {item.colorName}
                          </span>
                          <span>·</span>
                          {/* Inline Size Selector */}
                          <div className="flex items-center gap-1">
                            <span>Size:</span>
                            <select
                              value={item.variantId}
                              onChange={(e) => updateCartItemSize(item.id, e.target.value)}
                              className="bg-surface border border-border rounded-input px-1.5 py-0.5 text-xs text-primary focus:outline-none focus:border-primary cursor-pointer"
                            >
                              {availableSizes.map(v => (
                                <option key={v.id} value={v.id} disabled={v.stock_count === 0}>
                                  {v.size} {v.stock_count === 0 ? '(Sold out)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Delete Controls */}
                      <div className="flex items-center justify-between mt-3">
                        {/* Stepper with forgiving controls */}
                        <div className="flex items-center border border-border rounded-input bg-surface">
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-muted hover:text-primary transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-medium text-primary tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-muted hover:text-primary transition-colors disabled:opacity-30"
                            disabled={item.quantity >= item.stockCount}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-muted hover:text-danger flex items-center gap-1 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash size={14} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 bg-surface border-t border-border space-y-3">
              {/* Promo Code Input */}
              <div className="pt-1 pb-2 border-b border-border">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-canvas border border-border px-3 py-2 rounded-tight">
                    <div className="flex items-center gap-2 text-xs">
                      <Tag size={14} className="text-primary" weight="bold" />
                      <span className="font-mono font-bold text-primary">{appliedCoupon.code}</span>
                      <span className="text-muted text-[11px]">({appliedCoupon.discountPercent}% OFF)</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCouponCode}
                      className="text-xs text-muted hover:text-danger p-1"
                      title="Remove coupon"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="PROMO CODE (e.g. FLAMES20)"
                        className="flex-1 bg-canvas border border-border text-xs px-3 py-2 rounded-tight uppercase font-mono tracking-wider focus:outline-none focus:border-primary placeholder:text-muted/50"
                      />
                      <button
                        type="submit"
                        disabled={!couponInput.trim()}
                        className="px-3 py-2 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 disabled:opacity-40 transition-opacity"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-danger">{couponError}</p>}
                    {couponSuccess && <p className="text-[10px] text-success">{couponSuccess}</p>}
                    {coupons?.length > 0 && (
                      <div className="pt-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold block mb-1.5">
                          Available Vouchers
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {coupons.map(c => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setCouponError('');
                                setCouponSuccess('');
                                const res = applyCouponCode(c.code);
                                if (res.success) setCouponSuccess(res.message);
                                else setCouponError(res.message);
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-canvas border border-border hover:border-primary rounded-tight text-[10px] font-semibold text-primary transition-colors cursor-pointer"
                              title={c.label}
                            >
                              <Tag size={10} weight="bold" className="text-[#C43C30]" />
                              <span>{c.code}</span>
                              <span className="text-muted">({c.discountPercent}%)</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted">
                <span>Subtotal</span>
                <span className="font-medium text-primary tabular-nums">
                  {formatCurrency(cartSubtotal)}
                </span>
              </div>

              {couponDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-[#C43C30]">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="font-medium tabular-nums">
                    −{formatCurrency(couponDiscountAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted">
                <span>Shipping</span>
                <span>
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-success font-medium">Free Express</span>
                  ) : (
                    'Calculated at checkout'
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
                <span className="font-semibold text-primary">Estimated Total</span>
                <span className="font-semibold text-primary tabular-nums">
                  {formatCurrency(cartFinalTotal)}
                </span>
              </div>

              {currentUser ? (
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full mt-2 py-3.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.99] transition-all min-h-[44px]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to="/login?redirect=/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full mt-2 py-3.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.99] transition-all min-h-[44px]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </Link>
              )}

              <p className="text-[11px] text-center text-muted">
                Tax included. Instant dispatch in 24 hours.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
