import React, { useState, useMemo } from 'react';
import {
  Package, Warning, Plus, Minus, Check, MagnifyingGlass,
  Funnel, ArrowsClockwise
} from '@phosphor-icons/react';
import { formatCurrency } from '../../lib/pricing';

export default function AdminInventoryTab({
  products,
  updateVariantStock,
  lowStockVariants
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'low' | 'out_of_stock'

  // Global inventory stats
  const stats = useMemo(() => {
    let totalUnits = 0;
    let outOfStockCount = 0;
    let totalVariants = 0;

    products.forEach(p => {
      p.variants?.forEach(v => {
        totalVariants += 1;
        totalUnits += v.stock_count;
        if (v.stock_count === 0) outOfStockCount += 1;
      });
    });

    return {
      totalStyles: products.length,
      totalVariants,
      totalUnits,
      lowStockCount: lowStockVariants.length,
      outOfStockCount
    };
  }, [products, lowStockVariants]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesCategory = (p.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCategory) return false;
      }
      if (statusFilter === 'low') {
        const hasLow = p.variants?.some(v => v.stock_count <= 5 && v.stock_count > 0);
        if (!hasLow) return false;
      }
      if (statusFilter === 'out_of_stock') {
        const hasOut = p.variants?.some(v => v.stock_count === 0);
        if (!hasOut) return false;
      }
      return true;
    });
  }, [products, categoryFilter, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Inventory KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-canvas border border-border rounded-card p-4">
          <span className="text-xs text-muted uppercase font-medium">Garment Styles</span>
          <div className="text-2xl font-bold text-primary mt-1 tabular-nums">
            {stats.totalStyles}
          </div>
          <span className="text-[11px] text-muted mt-1 block">
            {stats.totalVariants} unique size variants
          </span>
        </div>

        <div className="bg-canvas border border-border rounded-card p-4">
          <span className="text-xs text-muted uppercase font-medium">Total Warehouse Units</span>
          <div className="text-2xl font-bold text-primary mt-1 tabular-nums">
            {stats.totalUnits.toLocaleString()}
          </div>
          <span className="text-[11px] text-success mt-1 block">
            Archival inventory units
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'All' : 'low')}
          className={`bg-canvas border rounded-card p-4 cursor-pointer transition-colors ${
            statusFilter === 'low' ? 'border-danger bg-danger-light/10' : 'border-border hover:border-danger/50'
          }`}
        >
          <span className="text-xs text-muted uppercase font-medium">Low Stock (≤ 5 units)</span>
          <div className="text-2xl font-bold text-danger mt-1 tabular-nums">
            {stats.lowStockCount}
          </div>
          <span className="text-[11px] text-danger mt-1 block">
            Click to filter low stock
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'out_of_stock' ? 'All' : 'out_of_stock')}
          className={`bg-canvas border rounded-card p-4 cursor-pointer transition-colors ${
            statusFilter === 'out_of_stock' ? 'border-danger bg-danger-light/10' : 'border-border hover:border-danger/50'
          }`}
        >
          <span className="text-xs text-muted uppercase font-medium">Sold Out Variants</span>
          <div className="text-2xl font-bold text-muted mt-1 tabular-nums">
            {stats.outOfStockCount}
          </div>
          <span className="text-[11px] text-muted mt-1 block">
            Click to filter sold out
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-canvas border border-border rounded-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface border border-border rounded-input px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Tops">Tops</option>
            <option value="Bottoms">Bottoms</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Footwear">Footwear</option>
          </select>

          {statusFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="px-2.5 py-1.5 bg-danger-light text-danger border border-danger/30 rounded-input text-xs font-medium"
            >
              Clear Filter: {statusFilter.replace('_', ' ')} ✕
            </button>
          )}
        </div>

        <div className="relative min-w-[260px]">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search garment title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-input pl-9 pr-3 py-2 text-xs text-primary focus:outline-none focus:border-primary placeholder:text-muted/60"
          />
        </div>
      </div>

      {/* Products Inventory List */}
      <div className="space-y-4">
        {filteredProducts.map(product => {
          const totalProdStock = product.variants?.reduce((sum, v) => sum + v.stock_count, 0) || 0;
          return (
            <div
              key={product.id}
              className="bg-canvas border border-border rounded-card p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={product.images?.[0] || '/brand/purgatory-logo-raw.png'}
                    alt={product.name}
                    className="w-14 h-16 object-contain bg-surface rounded-input border border-border p-1"
                  />
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted tracking-wider block">
                      {product.category} · SKU: {product.slug || product.id}
                    </span>
                    <h3 className="text-sm font-bold text-primary mt-0.5">
                      {product.name}
                    </h3>
                    <div className="text-xs text-primary font-mono mt-1 font-bold">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-muted uppercase block">
                    Total Garment Stock
                  </span>
                  <span className="text-base font-bold font-mono text-primary tabular-nums">
                    {totalProdStock} units
                  </span>
                </div>
              </div>

              {/* Variant Stock Adjustments Matrix */}
              <div className="pt-4">
                <span className="text-[11px] font-mono uppercase text-muted block mb-3 font-semibold">
                  Size & Stock Adjustment Matrix (Real-Time Synchronized)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {product.variants?.map(variant => {
                    const isLow = variant.stock_count <= 5 && variant.stock_count > 0;
                    const isOut = variant.stock_count === 0;

                    return (
                      <div
                        key={variant.id}
                        className={`p-3 rounded-card border flex flex-col justify-between gap-2.5 transition-colors ${
                          isOut
                            ? 'bg-danger-light/20 border-danger/30'
                            : isLow
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-surface border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary font-mono">
                            Size {variant.size}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                              isOut
                                ? 'bg-danger text-white'
                                : isLow
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {isOut ? 'Sold Out' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>

                        <div className="text-[10px] text-muted">
                          Color: {variant.color_name}
                        </div>

                        {/* Adjuster Stepper: [-] [input] [+] */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => updateVariantStock(product.id, variant.id, variant.stock_count - 1)}
                            disabled={variant.stock_count <= 0}
                            className="w-7 h-7 bg-canvas border border-border hover:bg-surface rounded flex items-center justify-center text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Decrement stock (-1)"
                          >
                            <Minus size={11} weight="bold" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={variant.stock_count}
                            onChange={(e) => updateVariantStock(product.id, variant.id, e.target.value)}
                            className="flex-1 w-full bg-canvas border border-border rounded text-center py-1 text-xs font-mono font-bold text-primary focus:outline-none focus:border-primary tabular-nums"
                          />

                          <button
                            type="button"
                            onClick={() => updateVariantStock(product.id, variant.id, variant.stock_count + 1)}
                            className="w-7 h-7 bg-canvas border border-border hover:bg-surface rounded flex items-center justify-center text-muted hover:text-primary transition-colors"
                            title="Increment stock (+1)"
                          >
                            <Plus size={11} weight="bold" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
