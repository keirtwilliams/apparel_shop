import React, { useState, useMemo } from 'react';
import {
  Package, Warning, Plus, Minus, Check, MagnifyingGlass,
  Funnel, ArrowsClockwise, X, Image as ImageIcon
} from '@phosphor-icons/react';
import { formatCurrency } from '../../lib/pricing';

export default function AdminInventoryTab({
  products,
  updateVariantStock,
  lowStockVariants,
  addNewProduct
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'low' | 'out_of_stock'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Garment Form State
  const [newShirt, setNewShirt] = useState({
    name: '',
    category: 'Tops',
    price: 890,
    compare_at_price: '',
    description: '',
    material: '240 GSM 100% Combed Compact Cotton',
    fit_note: 'Boxy architectural cut · True to size',
    care: 'Cold wash inside-out · Line dry in shade',
    imageFront: '/products/img1-front.png',
    imageBack: '/products/img1-back.png',
    stockS: 15,
    stockM: 20,
    stockL: 15,
    stockXL: 10
  });

  const handleCreateShirt = async (e) => {
    e.preventDefault();
    if (!newShirt.name.trim()) return;

    setIsSubmitting(true);
    try {
      const slug = newShirt.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || `shirt-${Date.now()}`;

      const productId = `a0000001-${Math.floor(1000 + Math.random() * 9000)}-0000-0000-${Date.now().toString().slice(-12)}`;

      const garmentPayload = {
        id: productId,
        name: newShirt.name.trim(),
        slug,
        category: newShirt.category,
        price: Number(newShirt.price) || 890,
        compare_at_price: newShirt.compare_at_price ? Number(newShirt.compare_at_price) : null,
        description: newShirt.description.trim() || 'Avant-garde heavyweight streetwear tee.',
        material: newShirt.material,
        fit_note: newShirt.fit_note,
        care: newShirt.care,
        images: [newShirt.imageFront.trim(), newShirt.imageBack.trim()].filter(Boolean),
        created_at: new Date().toISOString(),
        variants: [
          { id: `b000-${productId.slice(5, 9)}-0001`, product_id: productId, color_name: 'Chalk White', color_hex: '#FAF9F7', size: 'S', stock_count: Number(newShirt.stockS) || 0 },
          { id: `b000-${productId.slice(5, 9)}-0002`, product_id: productId, color_name: 'Chalk White', color_hex: '#FAF9F7', size: 'M', stock_count: Number(newShirt.stockM) || 0 },
          { id: `b000-${productId.slice(5, 9)}-0003`, product_id: productId, color_name: 'Chalk White', color_hex: '#FAF9F7', size: 'L', stock_count: Number(newShirt.stockL) || 0 },
          { id: `b000-${productId.slice(5, 9)}-0004`, product_id: productId, color_name: 'Chalk White', color_hex: '#FAF9F7', size: 'XL', stock_count: Number(newShirt.stockXL) || 0 }
        ]
      };

      if (addNewProduct) {
        await addNewProduct(garmentPayload);
      }

      setIsAddModalOpen(false);
      setNewShirt({
        name: '',
        category: 'Tops',
        price: 890,
        compare_at_price: '',
        description: '',
        material: '240 GSM 100% Combed Compact Cotton',
        fit_note: 'Boxy architectural cut · True to size',
        care: 'Cold wash inside-out · Line dry in shade',
        imageFront: '/products/img1-front.png',
        imageBack: '/products/img1-back.png',
        stockS: 15,
        stockM: 20,
        stockL: 15,
        stockXL: 10
      });
    } catch (err) {
      console.error('Error adding garment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className={`bg-canvas border rounded-card p-4 cursor-pointer transition-colors ${statusFilter === 'low' ? 'border-danger bg-danger-light/10' : 'border-border hover:border-danger/50'
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
          className={`bg-canvas border rounded-card p-4 cursor-pointer transition-colors ${statusFilter === 'out_of_stock' ? 'border-danger bg-danger-light/10' : 'border-border hover:border-danger/50'
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

          <div className="flex items-center gap-2">
            <div className="relative min-w-[240px]">
              <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search garment title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border rounded-input pl-9 pr-3 py-2 text-xs text-primary focus:outline-none focus:border-primary placeholder:text-muted/60"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-input flex items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
            >
              <Plus size={14} weight="bold" />
              <span>Drop New Shirt</span>
            </button>
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
                          className={`p-3 rounded-card border flex flex-col justify-between gap-2.5 transition-colors ${isOut
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
                              className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${isOut
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

        {/* MODAL: DROP NEW SHIRT / REAL-TIME ARCHIVAL PIECE */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-primary/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-canvas border border-border rounded-card max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                    Drop New Shirt (Real-Time Live)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-muted hover:text-primary p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateShirt} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-muted font-medium mb-1">Shirt Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inferno Archival Tee"
                    value={newShirt.name}
                    onChange={(e) => setNewShirt({ ...newShirt, name: e.target.value })}
                    className="w-full bg-surface border border-border rounded-input px-3 py-2 text-primary focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted font-medium mb-1">Selling Price (PHP)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newShirt.price}
                      onChange={(e) => setNewShirt({ ...newShirt, price: e.target.value })}
                      className="w-full bg-surface border border-border rounded-input px-3 py-2 text-primary focus:outline-none focus:border-primary font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-muted font-medium mb-1">Compare-At Price (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1190"
                      value={newShirt.compare_at_price}
                      onChange={(e) => setNewShirt({ ...newShirt, compare_at_price: e.target.value })}
                      className="w-full bg-surface border border-border rounded-input px-3 py-2 text-primary focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted font-medium mb-1">Front Image Path</label>
                    <input
                      type="text"
                      required
                      value={newShirt.imageFront}
                      onChange={(e) => setNewShirt({ ...newShirt, imageFront: e.target.value })}
                      className="w-full bg-surface border border-border rounded-input px-3 py-2 text-primary focus:outline-none focus:border-primary font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-muted font-medium mb-1">Back Image Path</label>
                    <input
                      type="text"
                      required
                      value={newShirt.imageBack}
                      onChange={(e) => setNewShirt({ ...newShirt, imageBack: e.target.value })}
                      className="w-full bg-surface border border-border rounded-input px-3 py-2 text-primary focus:outline-none focus:border-primary font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Initial Size Variant Stock Allocation */}
                <div>
                  <label className="block text-muted font-medium mb-1.5">
                    Initial Variant Inventory (S, M, L, XL)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['S', 'M', 'L', 'XL'].map(size => {
                      const key = `stock${size}`;
                      return (
                        <div key={size} className="bg-surface border border-border rounded-input p-2 text-center">
                          <span className="text-[10px] font-mono text-muted block mb-1">Size {size}</span>
                          <input
                            type="number"
                            min="0"
                            value={newShirt[key]}
                            onChange={(e) => setNewShirt({ ...newShirt, [key]: e.target.value })}
                            className="w-full bg-canvas border border-border rounded text-center py-1 font-mono font-bold text-xs"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Garment Description</label>
                  <textarea
                    rows="2"
                    value={newShirt.description}
                    onChange={(e) => setNewShirt({ ...newShirt, description: e.target.value })}
                    placeholder="240 GSM heavy combed cotton with boxy cut..."
                    className="w-full bg-surface border border-border rounded-input px-3 py-2 text-primary focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-border rounded-input text-muted hover:text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-primary text-canvas font-semibold uppercase tracking-wider rounded-input hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {isSubmitting ? 'Broadcasting Drop...' : 'Publish to Storefront (Instant Live)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      );
}
