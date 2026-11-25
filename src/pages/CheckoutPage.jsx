import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, DeviceMobile, Money, ShieldCheck, ArrowLeft, CheckCircle, User, Sparkle, Tag, X } from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../lib/pricing';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    cartFinalTotal,
    couponDiscountAmount,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
    coupons,
    placeOrder,
    clearCart,
    currentUser,
    setIsAccountDrawerOpen
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: currentUser?.full_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    postalCode: currentUser?.postal_code || '',
    country: currentUser?.country || 'Philippines'
  });

  // Keep form in sync if user logs in or edits profile
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.full_name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        address: currentUser.address || prev.address,
        city: currentUser.city || prev.city,
        postalCode: currentUser.postal_code || prev.postalCode,
        country: currentUser.country || prev.country
      }));
    }
  }, [currentUser]);

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'gcash' | 'cod'
  const [cardData, setCardData] = useState({
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvc: '888'
  });
  const [gcashPhone, setGcashPhone] = useState('0917-555-0192');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-primary">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-muted mt-2">Add pieces from our architectural collection to proceed with checkout.</p>
        <Link
          to="/catalogue"
          className="mt-6 inline-block px-5 py-2.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight"
        >
          Browse Catalogue
        </Link>
      </div>
    );
  }

  // Option 1 Guard: Require login at checkout, keeping cart items safe in bag
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-primary mx-auto mb-4">
          <User size={22} weight="bold" />
        </div>
        <h2 className="text-base font-bold uppercase tracking-wider text-primary font-mono">
          Client Authentication Required
        </h2>
        <p className="text-xs text-muted mt-2 leading-relaxed max-w-sm mx-auto">
          Please sign in to your client profile to complete this consignment. Your bag items and discounts remain saved.
        </p>
        <div className="mt-6 space-y-3">
          <Link
            to="/login?redirect=/checkout"
            className="w-full py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-wider rounded-tight flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
          >
            <span>Sign In to Complete Order</span>
          </Link>
          <Link
            to="/register?redirect=/checkout"
            className="w-full py-3 bg-surface hover:bg-surface-subtle border border-border text-primary text-xs font-semibold uppercase tracking-wider rounded-tight flex items-center justify-center transition-all cursor-pointer"
          >
            Create Client Profile
          </Link>
        </div>
        <div className="mt-6">
          <Link to="/catalogue" className="text-xs text-muted hover:text-primary underline underline-offset-4 font-mono">
            ← Continue Browsing Collection
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = cartFinalTotal >= 150 ? 0 : 15;
  const grandTotal = cartFinalTotal + shippingCost;

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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.address || !formData.city) {
      setErrorMessage('Please fill in all required shipping fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`;
      const newOrder = await placeOrder({
        customerName: formData.name,
        customerEmail: formData.email,
        shippingAddress: fullAddress,
        paymentMethod: paymentMethod
      });

      // Brief delay for tactile feedback
      setTimeout(() => {
        navigate(`/receipt/${newOrder.id}`);
      }, 600);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred while creating your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Return Link */}
      <div className="mb-6">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors min-h-[36px]"
        >
          <ArrowLeft size={14} />
          <span>Return to Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Checkout Form */}
        <div className="lg:col-span-7">
          {/* Client Authentication Status Banner */}
          {currentUser ? (
            <div className="mb-6 p-4 bg-surface border border-border rounded-card flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center text-success">
                  <CheckCircle size={18} weight="fill" />
                </div>
                <div>
                  <span className="font-semibold text-primary block">
                    Express Checkout Active
                  </span>
                  <span className="text-muted font-mono text-[11px]">
                    Logged in as {currentUser.full_name} ({currentUser.email})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAccountDrawerOpen(true)}
                className="text-xs font-semibold text-primary hover:text-muted underline underline-offset-2 transition-colors"
              >
                Edit Saved Details
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-surface border border-border rounded-card flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center text-muted">
                  <User size={16} />
                </div>
                <div>
                  <span className="font-semibold text-primary block">
                    Checking out as Guest
                  </span>
                  <span className="text-muted text-[11px]">
                    Have an account? Sign in to use saved addresses and fast-track tracking.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAccountDrawerOpen(true)}
                className="px-3 py-1.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Customer Contact & Shipping Address */}
            <div className="bg-canvas border border-border rounded-card p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h2 className="text-sm font-semibold tracking-wide text-primary uppercase">
                  1. Shipping Information
                </h2>
                <span className="text-xs text-muted">Express Courier Delivery</span>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 bg-danger-light border border-danger/20 rounded-input text-xs text-danger">
                  {errorMessage}
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-muted mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-input text-primary focus:outline-none focus:border-primary min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-input text-primary focus:outline-none focus:border-primary min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-input text-primary focus:outline-none focus:border-primary min-h-[40px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-muted mb-1">Street Address & Unit *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-input text-primary focus:outline-none focus:border-primary min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1">City / Municipality *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-input text-primary focus:outline-none focus:border-primary min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1">Postal / ZIP Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-input text-primary focus:outline-none focus:border-primary min-h-[40px]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-canvas border border-border rounded-card p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h2 className="text-sm font-semibold tracking-wide text-primary uppercase">
                  2. Payment Method
                </h2>
                <div className="flex items-center gap-1 text-xs text-success">
                  <ShieldCheck size={14} />
                  <span>256-Bit Encrypted</span>
                </div>
              </div>

              {/* Payment Tabs: Test Card, GCash, COD */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-3 px-3 rounded-tight border text-xs font-medium flex flex-col items-center gap-1.5 transition-all min-h-[64px] ${paymentMethod === 'card'
                      ? 'bg-surface border-primary text-primary ring-1 ring-primary'
                      : 'bg-canvas border-border text-muted hover:border-primary'
                    }`}
                >
                  <CreditCard size={18} />
                  <span>Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('gcash')}
                  className={`py-3 px-3 rounded-tight border text-xs font-medium flex flex-col items-center gap-1.5 transition-all min-h-[64px] ${paymentMethod === 'gcash'
                      ? 'bg-surface border-primary text-primary ring-1 ring-primary'
                      : 'bg-canvas border-border text-muted hover:border-primary'
                    }`}
                >
                  <DeviceMobile size={18} />
                  <span>GCash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`py-3 px-3 rounded-tight border text-xs font-medium flex flex-col items-center gap-1.5 transition-all min-h-[64px] ${paymentMethod === 'cod'
                      ? 'bg-surface border-primary text-primary ring-1 ring-primary'
                      : 'bg-canvas border-border text-muted hover:border-primary'
                    }`}
                >
                  <Money size={18} />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {/* Dynamic Payment Method Fields */}
              <div className="mt-5 p-4 bg-surface rounded-input border border-border text-xs">
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Test Card Simulation</span>
                      <span className="text-[11px] text-muted font-mono">Any future MM/YY</span>
                    </div>
                    <div>
                      <label className="block text-muted mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        className="w-full px-3 py-2 bg-canvas border border-border rounded-input text-primary font-mono focus:outline-none focus:border-primary min-h-[38px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-muted mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full px-3 py-2 bg-canvas border border-border rounded-input text-primary font-mono focus:outline-none focus:border-primary min-h-[38px]"
                        />
                      </div>
                      <div>
                        <label className="block text-muted mb-1">CVC</label>
                        <input
                          type="text"
                          value={cardData.cvc}
                          onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                          className="w-full px-3 py-2 bg-canvas border border-border rounded-input text-primary font-mono focus:outline-none focus:border-primary min-h-[38px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'gcash' && (
                  <div className="space-y-3">
                    <p className="text-muted leading-relaxed">
                      Instant mobile wallet authorization. Your linked GCash account will receive an OTP confirmation.
                    </p>
                    <div>
                      <label className="block text-muted mb-1">Registered GCash Mobile Number</label>
                      <input
                        type="text"
                        value={gcashPhone}
                        onChange={(e) => setGcashPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-canvas border border-border rounded-input text-primary font-mono focus:outline-none focus:border-primary min-h-[38px]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div>
                    <p className="text-muted leading-relaxed">
                      Pay in cash upon physical receipt at your doorstep. Please prepare the exact amount of <span className="font-semibold text-primary tabular-nums">${grandTotal.toFixed(2)}</span> for the courier.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[48px] shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authorizing Order...</span>
              ) : (
                <span>Confirm & Authorize Order — {formatCurrency(grandTotal)}</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-canvas border border-border rounded-card p-6 sticky top-24">
            <h2 className="text-sm font-semibold tracking-wide text-primary uppercase pb-4 border-b border-border">
              Order Breakdown ({cart.length} {cart.length === 1 ? 'garment' : 'garments'})
            </h2>

            {/* Items list */}
            <div className="py-4 divide-y divide-border max-h-72 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                  <div className="w-14 aspect-[4/5] bg-surface rounded-input overflow-hidden border border-border shrink-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-primary truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[11px] text-muted">
                      {item.colorName} · Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-border space-y-2 text-xs">
              {/* Promo Code Input on Checkout */}
              <div className="pb-3 border-b border-border">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-surface border border-border px-3 py-2 rounded-tight">
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
                        placeholder="PROMO CODE"
                        className="flex-1 bg-surface border border-border text-xs px-3 py-2 rounded-tight uppercase font-mono tracking-wider focus:outline-none focus:border-primary placeholder:text-muted/50"
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
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface border border-border hover:border-primary rounded-tight text-[10px] font-semibold text-primary transition-colors cursor-pointer"
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

              <div className="flex items-center justify-between text-muted">
                <span>Garment Subtotal</span>
                <span className="font-medium text-primary tabular-nums">
                  {formatCurrency(cartSubtotal)}
                </span>
              </div>

              {couponDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-[#C43C30]">
                  <span>Promo Discount ({appliedCoupon?.code})</span>
                  <span className="font-medium tabular-nums">
                    −{formatCurrency(couponDiscountAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted">
                <span>Express Courier Shipping</span>
                <span className="tabular-nums">
                  {shippingCost === 0 ? (
                    <span className="text-success font-medium">Free</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Sales Tax (Included)</span>
                <span className="font-medium text-primary tabular-nums">{formatCurrency(0)}</span>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                <span className="font-semibold text-primary">Total Payable</span>
                <span className="text-base font-bold text-primary tabular-nums">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 bg-surface rounded-input border border-border text-[11px] text-muted leading-relaxed">
              <span className="font-semibold text-primary">Instant Inventory Guarantee: </span>
              Your selected garment variants are locked in real time upon authorization.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
