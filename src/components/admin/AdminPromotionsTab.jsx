import React, { useState } from 'react';
import {
  Percent, Tag, Sparkle, Plus, Trash, Check, Warning
} from '@phosphor-icons/react';
import { formatCurrency } from '../../lib/pricing';

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
    <div className="space-y-6">
      {/* 1. STOREWIDE SALE ENGINE */}
      <div className="p-5 bg-canvas border border-border rounded-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-tight bg-primary text-canvas flex items-center justify-center">
              <Percent size={18} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-primary">
                Storewide Promotional Engine
              </h2>
              <p className="text-xs text-muted">
                Broadcast storewide or category flash sales with live markdown percentage from 10% to 90% OFF.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saleConfig.active}
              onChange={(e) => setSaleConfig(prev => ({ ...prev, active: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-surface border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted peer-checked:after:bg-canvas after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-xs font-bold uppercase tracking-wider text-primary">
              {saleConfig.active ? 'Sale Live' : 'Sale Inactive'}
            </span>
          </label>
        </div>

        {/* Live Controls */}
        <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Discount Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-muted uppercase">Discount Percentage:</span>
              <span className="font-bold font-mono text-base text-primary bg-surface px-2.5 py-0.5 rounded-input border border-border">
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
            <div className="flex justify-between text-[10px] text-muted font-mono mt-1">
              <span>10%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Target Category Scope */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-2">
              Target Category Scope:
            </label>
            <select
              value={saleConfig.categoryTarget || 'All'}
              disabled={!saleConfig.active}
              onChange={(e) => setSaleConfig(prev => ({ ...prev, categoryTarget: e.target.value }))}
              className="w-full bg-surface border border-border rounded-input px-3.5 py-2.5 text-xs text-primary focus:outline-none focus:border-primary disabled:opacity-40 font-medium"
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
      <div className="p-5 bg-canvas border border-border rounded-card">
        <div className="pb-4 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Tag size={15} />
            <span>Promo Coupon Codes ({coupons.length} Active)</span>
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Create discount vouchers redeemable by customers in the slide-over cart and checkout page.
          </p>
        </div>

        {/* Add Coupon Form */}
        <form onSubmit={handleAddCoupon} className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-mono uppercase text-muted mb-1">
              Coupon Code
            </label>
            <input
              type="text"
              placeholder="e.g. VIP2026"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full bg-surface border border-border rounded-input px-3 py-2 text-xs font-mono font-bold text-primary focus:outline-none focus:border-primary uppercase placeholder:normal-case"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-muted mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              min="5"
              max="90"
              value={newDiscount}
              onChange={(e) => setNewDiscount(e.target.value)}
              className="w-full bg-surface border border-border rounded-input px-3 py-2 text-xs font-mono font-bold text-primary focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-muted mb-1">
              Label / Campaign Name
            </label>
            <input
              type="text"
              placeholder="e.g. Secret Drop Discount"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-surface border border-border rounded-input px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-input hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 min-h-[38px]"
          >
            <Plus size={14} weight="bold" />
            <span>Add Coupon</span>
          </button>
        </form>

        {couponSuccess && (
          <div className="mt-3 p-2.5 bg-success-light border border-success/30 rounded-input text-xs text-success flex items-center gap-1.5">
            <Check size={14} weight="bold" />
            <span>{couponSuccess}</span>
          </div>
        )}

        {/* Existing Coupons Pills */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map(c => (
            <div
              key={c.code}
              className="p-3 bg-surface border border-border rounded-input flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary text-sm">{c.code}</span>
                  <span className="px-1.5 py-0.2 bg-primary text-canvas rounded text-[10px] font-mono font-bold">
                    {c.discountPercent}% OFF
                  </span>
                </div>
                <span className="text-[11px] text-muted block mt-0.5 truncate max-w-[200px]">
                  {c.label}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveCoupon(c.code)}
                className="p-1.5 text-muted hover:text-danger hover:bg-canvas rounded transition-colors"
                title={`Delete ${c.code}`}
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PER-GARMENT INDIVIDUAL MARKDOWNS */}
      <div className="p-5 bg-canvas border border-border rounded-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkle size={15} weight="fill" className="text-[#C43C30]" />
              <span>Individual Garment Markdowns (Per-Item Sales)</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Select specific archival garments to place on discount without affecting the rest of the catalogue.
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted bg-surface px-2.5 py-1 rounded border border-border">
            {products.filter(p => (p.compare_at_price && p.compare_at_price > p.price) || p.on_sale).length} of {products.length} Garments On Sale
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {products.map(p => {
            const basePrice = p.original_base_price || p.compare_at_price || p.price;
            const isItemOnSale = Boolean((p.compare_at_price && p.compare_at_price > p.price) || p.on_sale);
            const currentDiscount = isItemOnSale
              ? p.discount_percent || Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
              : 20;

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-card border transition-all flex flex-col justify-between gap-3 ${
                  isItemOnSale
                    ? 'bg-surface border-[#C43C30]/40 shadow-xs'
                    : 'bg-canvas border-border/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={p.images?.[0] || '/brand/purgatory-logo-raw.png'}
                    alt={p.name}
                    className="w-12 h-14 object-contain bg-canvas rounded-input border border-border p-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-primary truncate" title={p.name}>
                      {p.name}
                    </h4>
                    <p className="text-[10px] font-mono text-muted uppercase mt-0.5">
                      {p.category} · Base: {formatCurrency(basePrice)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-xs font-bold tabular-nums ${isItemOnSale ? 'text-[#C43C30]' : 'text-primary'}`}>
                        {formatCurrency(p.price)}
                      </span>
                      {isItemOnSale && (
                        <>
                          <span className="text-[10px] text-muted/60 line-through tabular-nums">
                            {formatCurrency(basePrice)}
                          </span>
                          <span className="text-[10px] bg-[#C43C30] text-[#FAF9F7] font-bold px-1.5 py-0.2 rounded font-mono">
                            −{currentDiscount}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[10, 20, 30, 50].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => updateProductSale(p.id, { isOnSale: true, discountPercent: pct })}
                        className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                          isItemOnSale && currentDiscount === pct
                            ? 'bg-[#C43C30] text-canvas border-[#C43C30] font-bold'
                            : 'bg-surface text-muted border-border hover:text-primary'
                        }`}
                        title={`Set ${pct}% Off`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => updateProductSale(p.id, { isOnSale: !isItemOnSale, discountPercent: currentDiscount || 20 })}
                    className={`px-2.5 py-1 text-[10px] font-mono uppercase font-semibold rounded-tight border transition-colors ${
                      isItemOnSale
                        ? 'bg-danger-light text-danger border-danger/40 hover:bg-danger hover:text-white'
                        : 'bg-primary text-canvas border-primary hover:opacity-90'
                    }`}
                  >
                    {isItemOnSale ? 'End Sale' : 'Put on Sale'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
