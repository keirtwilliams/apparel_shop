import React, { useState, useEffect } from 'react';
import {
  Plus, Trash, Check, Clock
} from '@phosphor-icons/react';
import { formatCurrency, calculateEffectiveProductPrice, formatCountdown } from '../../lib/pricing';

export default function AdminPromotionsTab({
  saleConfig,
  setSaleConfig,
  coupons,
  setCoupons,
  products,
  updateProductSale
}) {
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('15');
  const [newLabel, setNewLabel] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const hasActiveTimers = products.some(p => p.sale_ends_at && p.sale_ends_at > now);

  useEffect(() => {
    if (!hasActiveTimers) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [hasActiveTimers]);

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const formattedCode = newCode.trim().toUpperCase().replace(/\s+/g, '');
    const discountNum = Math.min(Math.max(Number(newDiscount) || 10, 5), 90);

    // Prevent duplicate codes
    if (coupons.some(c => c.code === formattedCode)) {
      alert(`Coupon code "${formattedCode}" already exists.`);
      return;
    }

    const newCouponObj = {
      code: formattedCode,
      discountPercent: discountNum,
      label: newLabel.trim() || `${discountNum}% Archival Privilege`
    };

    setCoupons(prev => [newCouponObj, ...prev]);
    setNewCode('');
    setNewLabel('');
    setCouponSuccess(`Coupon ${formattedCode} (${discountNum}% OFF) created successfully.`);
    setTimeout(() => setCouponSuccess(''), 3000);
  };

  const handleRemoveCoupon = (codeToRemove) => {
    setCoupons(prev => prev.filter(c => c.code !== codeToRemove));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. STOREWIDE SALE ENGINE */}
      <div className="p-6 bg-surface border border-border rounded-card shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border gap-4">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-primary">
              Storewide Promotional Engine
            </h2>
            <p className="text-xs text-muted">
              Broadcast storewide or category flash sales with live markdown percentage from 10% to 90% OFF.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saleConfig.active}
              onChange={(e) => setSaleConfig(prev => ({ ...prev, active: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-canvas border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-muted peer-checked:after:bg-canvas after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-xs font-bold uppercase tracking-wider text-primary">
              {saleConfig.active ? 'Sale Live' : 'Sale Inactive'}
            </span>
          </label>
        </div>

        {/* Live Controls */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Discount Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2.5">
              <span className="font-semibold text-muted uppercase tracking-wider text-xs">Discount Percentage:</span>
              <span className="font-bold text-sm text-primary bg-canvas px-3 py-1 rounded-tight border border-border tabular-nums">
                {saleConfig.percentage}% OFF
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={saleConfig.percentage}
              disabled={!saleConfig.active}
              onChange={(e) => setSaleConfig(prev => ({ ...prev, percentage: Number(e.target.value) }))}
              className="w-full accent-primary cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-xs text-muted font-medium mt-1.5">
              <span>10%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Target Category Scope */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Target Category Scope:
            </label>
            <select
              value={saleConfig.categoryTarget || 'All'}
              disabled={!saleConfig.active}
              onChange={(e) => setSaleConfig(prev => ({ ...prev, categoryTarget: e.target.value }))}
              className="w-full h-10 bg-canvas border border-border rounded-tight px-3.5 text-xs text-primary focus:outline-none focus:border-primary disabled:opacity-40 font-medium shadow-2xs cursor-pointer"
            >
              <option value="All">Storewide (All Garments)</option>
              <option value="Tops">Tops Only</option>
              <option value="Bottoms">Bottoms Only</option>
              <option value="Outerwear">Outerwear Only</option>
              <option value="Footwear">Footwear Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. PROMO COUPONS MANAGER */}
      <div className="p-6 bg-surface border border-border rounded-card shadow-2xs">
        <div className="pb-5 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
            <span>Promo Coupon Codes ({coupons.length} Active)</span>
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Create discount vouchers redeemable by customers in the slide-over cart and checkout page.
          </p>
        </div>

        {/* Add Coupon Form */}
        <form onSubmit={handleAddCoupon} className="pt-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs uppercase text-muted mb-1.5 font-bold tracking-wider">
              Coupon Code
            </label>
            <input
              type="text"
              placeholder="e.g. VIP2026"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full h-10 bg-canvas border border-border rounded-tight px-3 text-xs font-bold text-primary focus:outline-none focus:border-primary uppercase placeholder:normal-case shadow-2xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-muted mb-1.5 font-bold tracking-wider">
              Discount (%)
            </label>
            <input
              type="number"
              min="5"
              max="90"
              value={newDiscount}
              onChange={(e) => setNewDiscount(e.target.value)}
              className="w-full h-10 bg-canvas border border-border rounded-tight px-3 text-xs font-bold text-primary focus:outline-none focus:border-primary shadow-2xs tabular-nums"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-muted mb-1.5 font-bold tracking-wider">
              Label / Campaign Name
            </label>
            <input
              type="text"
              placeholder="e.g. Secret Drop Discount"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full h-10 bg-canvas border border-border rounded-tight px-3 text-xs text-primary focus:outline-none focus:border-primary shadow-2xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus size={15} weight="bold" />
            <span>Add Coupon</span>
          </button>
        </form>

        {couponSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-tight text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <Check size={15} weight="bold" />
            <span className="font-medium">{couponSuccess}</span>
          </div>
        )}

        {/* Existing Coupons Pills */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map(c => (
            <div
              key={c.code}
              className="p-3.5 bg-canvas border border-border rounded-tight flex items-center justify-between text-xs shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-sm">{c.code}</span>
                  <span className="px-2 py-0.5 bg-primary text-canvas rounded-tight text-xs font-bold">
                    {c.discountPercent}% OFF
                  </span>
                </div>
                <span className="text-xs text-muted block mt-1 truncate max-w-[200px] font-medium">
                  {c.label}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveCoupon(c.code)}
                className="p-2 text-muted hover:text-danger hover:bg-surface rounded-tight transition-colors cursor-pointer"
                title={`Delete ${c.code}`}
              >
                <Trash size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PER-GARMENT INDIVIDUAL MARKDOWNS */}
      <div className="p-6 bg-surface border border-border rounded-card shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-border">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              <span>Individual Garment Markdowns (Per-Item Sales)</span>
            </h3>
            <p className="text-xs text-muted mt-0.5 font-medium">
              Select specific archival garments to place on discount without affecting the rest of the catalogue.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase text-muted bg-canvas px-3 py-1.5 rounded-tight border border-border self-start sm:self-auto">
            {products.filter(p => (p.compare_at_price && p.compare_at_price > p.price) || p.on_sale).length} of {products.length} Garments On Sale
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {products.map(p => {
            const basePrice = p.original_base_price || p.compare_at_price || p.price;
            const isItemOnSale = Boolean((p.compare_at_price && p.compare_at_price > p.price) || p.on_sale);
            const itemDiscount = isItemOnSale
              ? p.discount_percent || Math.round(((basePrice - p.price) / basePrice) * 100)
              : 0;
            const effective = calculateEffectiveProductPrice(p, saleConfig);
            const isStorewideApplied = effective.isOnSale && (!isItemOnSale || effective.discountPercent > itemDiscount);
            const countdown = effective.saleEndsAt ? formatCountdown(effective.saleEndsAt - now) : null;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-card border transition-all flex flex-col justify-between gap-3.5 shadow-2xs ${
                  effective.isOnSale
                    ? 'bg-surface border-[#C43C30]/40 ring-1 ring-[#C43C30]/20'
                    : 'bg-canvas border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={p.images?.[0] || '/brand/purgatory-logo-raw.png'}
                    alt={p.name}
                    className="w-12 h-15 object-contain bg-surface rounded-tight border border-border p-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-primary truncate" title={p.name}>
                      {p.name}
                    </h4>
                    <p className="text-xs text-muted uppercase mt-0.5 font-medium">
                      {p.category} · Base: {formatCurrency(basePrice)}
                    </p>
                    <div className="mt-1.5 flex items-center flex-wrap gap-1.5">
                      <span className={`text-xs font-bold tabular-nums ${effective.isOnSale ? 'text-[#C43C30]' : 'text-primary'}`}>
                        {formatCurrency(effective.currentPrice)}
                      </span>
                      {effective.isOnSale && (
                        <>
                          <span className="text-xs text-muted/60 line-through tabular-nums">
                            {formatCurrency(effective.originalPrice)}
                          </span>
                          <span className="text-[10px] bg-[#C43C30] text-[#FAF9F7] font-bold px-1.5 py-0.2 rounded-tight">
                            −{effective.discountPercent}%
                          </span>
                          {isStorewideApplied && (
                            <span className="text-[10px] bg-primary text-canvas font-semibold px-1.5 py-0.2 rounded-tight uppercase">
                              Storewide
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[10, 20, 30, 50].map(pct => {
                      const isActivePct = isItemOnSale && itemDiscount === pct;
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() =>
                            updateProductSale(p.id, {
                              isOnSale: !isActivePct,
                              discountPercent: pct
                            })
                          }
                          className={`h-7 px-2 text-xs font-semibold rounded-tight border transition-all cursor-pointer ${
                            isActivePct
                              ? 'bg-[#C43C30] text-canvas border-[#C43C30] font-bold'
                              : 'bg-surface text-muted border-border hover:text-primary hover:border-primary/40'
                          }`}
                          title={isActivePct ? `Remove ${pct}% Discount` : `Set ${pct}% Off`}
                        >
                          {pct}%
                        </button>
                      );
                    })}
                  </div>

                  {isItemOnSale ? (
                    <button
                      type="button"
                      onClick={() => updateProductSale(p.id, { isOnSale: false, discountPercent: 0 })}
                      className="h-7 px-3 text-xs uppercase font-semibold rounded-tight border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-all cursor-pointer"
                    >
                      End Sale
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-muted">
                      {isStorewideApplied ? 'Storewide Active' : 'Regular Price'}
                    </span>
                  )}
                </div>

                {/* Optional Flash-Sale Timer Controls */}
                {isItemOnSale && (
                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-muted flex items-center gap-1 tabular-nums">
                      <Clock size={12} weight="bold" className={countdown ? 'text-[#C43C30]' : 'text-muted'} />
                      <span>{countdown ? countdown : 'No Timer'}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[
                        { label: 'Off', mins: null },
                        { label: '15m', mins: 15 },
                        { label: '30m', mins: 30 },
                        { label: '1h', mins: 60 },
                        { label: '24h', mins: 1440 }
                      ].map(opt => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() =>
                            updateProductSale(p.id, {
                              isOnSale: true,
                              discountPercent: itemDiscount,
                              durationMinutes: opt.mins
                            })
                          }
                          className={`h-6 px-1.5 text-[11px] font-semibold rounded-tight border transition-all cursor-pointer ${
                            opt.mins === null && !countdown
                              ? 'bg-primary text-canvas border-primary'
                              : 'bg-surface text-muted border-border hover:text-primary hover:border-primary/40'
                          }`}
                          title={opt.mins ? `Set ${opt.label} flash timer` : 'Remove timer'}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
