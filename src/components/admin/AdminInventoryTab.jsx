import React, { useState, useMemo, useRef } from 'react';
import {
  Package, Plus, Minus, Check, MagnifyingGlass,
  Warning, Funnel, ArrowClockwise, Sparkle, X,
  ImageSquare, Trash, UploadSimple
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
  const fileInputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');

  // Form State for Add New Garment
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Tops',
    price: '',
    description: '',
    images: ['/brand/purgatory-logo-raw.png'],
    initialStock: 15
  });

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Category Filter
      if (categoryFilter !== 'All' && p.category !== categoryFilter) {
        return false;
      }

      // 2. Status Filter
      if (statusFilter === 'low') {
        const hasLowStock = p.variants?.some(v => v.stock_count <= 5 && v.stock_count > 0);
        if (!hasLowStock) return false;
      } else if (statusFilter === 'out_of_stock') {
        const isOutOfStock = p.variants?.every(v => v.stock_count === 0);
        if (!isOutOfStock) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = p.name?.toLowerCase().includes(query);
        const catMatch = p.category?.toLowerCase().includes(query);
        const skuMatch = p.slug?.toLowerCase().includes(query);
        if (!nameMatch && !catMatch && !skuMatch) return false;
      }

      return true;
    });
  }, [products, categoryFilter, statusFilter, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalUnits = 0;
    let totalVariants = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      p.variants?.forEach(v => {
        totalVariants += 1;
        totalUnits += v.stock_count;
        if (v.stock_count === 0) outOfStockCount += 1;
        else if (v.stock_count <= 5) lowStockCount += 1;
      });
    });

    return {
      totalStyles: products.length,
      totalVariants,
      totalUnits,
      lowStockCount,
      outOfStockCount
    };
  }, [products]);

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) return;

    const productId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const slug = newProduct.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const stockPerVariant = parseInt(newProduct.initialStock, 10) || 12;
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    const variants = sizes.map((size, idx) => ({
      id: `${productId}-var-${idx}`,
      product_id: productId,
      size,
      color_name: 'Default',
      color_hex: '#1C1C1B',
      stock_count: stockPerVariant
    }));

    addNewProduct({
      id: productId,
      slug,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      compare_at_price: null,
      original_base_price: parseFloat(newProduct.price),
      on_sale: false,
      discount_percent: 0,
      description: newProduct.description.trim() || 'Custom Archival Fabrication.',
      images: newProduct.images,
      variants
    });

    setIsAddModalOpen(false);
    setImageUrl('');
    setNewProduct({
      name: '',
      category: 'Tops',
      price: '',
      description: '',
      images: ['/brand/purgatory-logo-raw.png'],
      initialStock: 15
    });
  };

  // Handle local file upload → converts to blob URL for client-side preview
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // 5MB size limit
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB.');
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setNewProduct(prev => ({
      ...prev,
      images: [blobUrl, ...prev.images.filter(img => img !== '/brand/purgatory-logo-raw.png')]
    }));
    setImageUrl('');
  };

  // Handle pasting an image URL
  const handleAddImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert('Please enter a valid image URL.');
      return;
    }

    setNewProduct(prev => ({
      ...prev,
      images: [url, ...prev.images.filter(img => img !== '/brand/purgatory-logo-raw.png')]
    }));
    setImageUrl('');
  };

  // Remove an image from the new product
  const handleRemoveImage = (indexToRemove) => {
    setNewProduct(prev => {
      const updated = prev.images.filter((_, i) => i !== indexToRemove);
      // If all images removed, fall back to placeholder
      return {
        ...prev,
        images: updated.length > 0 ? updated : ['/brand/purgatory-logo-raw.png']
      };
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. EXECUTIVE KPI MATRIX CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface border border-border rounded-card p-5 sm:p-6 shadow-2xs">
          <span className="text-xs uppercase tracking-wider text-muted font-bold block">
            Garment Styles
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-primary mt-2 tabular-nums">
            {stats.totalStyles}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-5 sm:p-6 shadow-2xs">
          <span className="text-xs uppercase tracking-wider text-muted font-bold block">
            Warehouse Units
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-primary mt-2 tabular-nums">
            {stats.totalUnits.toLocaleString()}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'All' : 'low')}
          className={`bg-surface border rounded-card p-5 sm:p-6 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'low' ? 'border-danger bg-danger-light/10 ring-1 ring-danger' : 'border-border hover:border-danger/50'
          }`}
        >
          <span className="text-xs uppercase tracking-wider text-danger font-bold block">
            Low Stock (5 or fewer left)
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-danger mt-2 tabular-nums">
            {stats.lowStockCount}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'out_of_stock' ? 'All' : 'out_of_stock')}
          className={`bg-surface border rounded-card p-5 sm:p-6 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'out_of_stock' ? 'border-primary bg-canvas ring-1 ring-primary' : 'border-border hover:border-primary/50'
          }`}
        >
          <span className="text-xs uppercase tracking-wider text-muted font-bold block">
            Sold Out Units
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-muted mt-2 tabular-nums">
            {stats.outOfStockCount}
          </div>
        </div>
      </div>

      {/* 2. FILTER & ACTION TOOLBAR */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-canvas border border-border rounded-tight px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="All">All Divisions</option>
            <option value="Tops">Tops Only</option>
            <option value="Bottoms">Bottoms Only</option>
            <option value="Outerwear">Outerwear Only</option>
            <option value="Footwear">Footwear Only</option>
          </select>

          {statusFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="px-3 py-1.5 bg-danger-light text-danger border border-danger/30 rounded-tight text-xs font-semibold cursor-pointer"
            >
              Filter: {statusFilter.replace('_', ' ')} ✕
            </button>
          )}

          <div className="relative w-full sm:w-[240px]">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search garment or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-canvas border border-border rounded-tight pl-9 pr-3 py-2 text-xs text-primary focus:outline-none focus:border-primary placeholder:text-muted/60 font-medium"
            />
          </div>
        </div>

        {/* Add Garment Modal Trigger */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="h-10 px-5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <Plus size={15} weight="bold" />
          <span>Add New Garment</span>
        </button>
      </div>

      {/* 3. STRUCTURED INVENTORY TABLE MATRIX */}
      <div className="bg-surface border border-border rounded-card overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-primary">
            Garment Catalogue Matrix ({filteredProducts.length} Items Listed)
          </span>
          <span className="text-xs text-muted font-medium">
            Live Inline Stock Stepper · Synchronized with Storefront
          </span>
        </div>

        <div className="divide-y divide-border">
          {filteredProducts.map(product => {
            const totalProdStock = product.variants?.reduce((sum, v) => sum + v.stock_count, 0) || 0;
            const hasLow = product.variants?.some(v => v.stock_count <= 5 && v.stock_count > 0);
            const isAllOut = totalProdStock === 0;

            return (
              <div
                key={product.id}
                className="p-5 sm:p-6 hover:bg-canvas/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Garment Identification */}
                <div className="flex items-start gap-4 min-w-0 w-full lg:w-[280px] lg:shrink-0">
                  <img
                    src={product.images?.[0] || '/brand/purgatory-logo-raw.png'}
                    alt={product.name}
                    className="w-16 h-20 object-contain bg-canvas rounded-tight border border-border p-1.5 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-xs uppercase text-muted tracking-wider block font-bold">
                      {product.category} · SKU: {product.slug || product.id?.slice(0, 8) || '—'}
                    </span>
                    <h3 className="text-sm font-bold text-primary">
                      {product.name}
                    </h3>
                    <div className="text-xs font-bold text-primary tabular-nums">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-tight ${
                          isAllOut
                            ? 'bg-danger text-white'
                            : hasLow
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isAllOut ? 'SOLD OUT' : hasLow ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                      <span className="text-xs text-muted font-medium">
                        Total: <strong>{totalProdStock} units</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Variant Stepper Controls (Horizontal Grid) */}
                <div className="flex-1 max-w-2xl">
                  <span className="text-xs uppercase text-muted tracking-wider font-bold block mb-2">
                    Variant Sizing & Stock Stepper
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {product.variants?.map(variant => {
                      const isLow = variant.stock_count <= 5 && variant.stock_count > 0;
                      const isOut = variant.stock_count === 0;

                      return (
                        <div
                          key={variant.id}
                          className={`p-2.5 rounded-tight border flex flex-col justify-between gap-2 transition-all ${
                            isOut
                              ? 'bg-danger-light/20 border-danger/30'
                              : isLow
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : 'bg-canvas border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-primary">Size {variant.size}</span>
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                isOut ? 'text-danger' : isLow ? 'text-amber-700' : 'text-emerald-700'
                              }`}
                            >
                              {isOut ? '0 Left' : `${variant.stock_count} Left`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => updateVariantStock(product.id, variant.id, Math.max(0, variant.stock_count - 1))}
                              className="w-7 h-7 bg-surface hover:bg-canvas border border-border text-primary rounded-tight flex items-center justify-center transition-colors active:scale-95 cursor-pointer font-bold"
                              title="Decrease stock by 1"
                            >
                              <Minus size={12} weight="bold" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={variant.stock_count}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 0) {
                                  updateVariantStock(product.id, variant.id, val);
                                }
                              }}
                              className="w-full text-center py-1 bg-surface border border-border rounded-tight text-xs font-bold text-primary focus:outline-none focus:border-primary tabular-nums"
                            />

                            <button
                              type="button"
                              onClick={() => updateVariantStock(product.id, variant.id, variant.stock_count + 1)}
                              className="w-7 h-7 bg-surface hover:bg-canvas border border-border text-primary rounded-tight flex items-center justify-center transition-colors active:scale-95 cursor-pointer font-bold"
                              title="Increase stock by 1"
                            >
                              <Plus size={12} weight="bold" />
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

      {/* 4. ADD NEW GARMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs font-sans">
          <div className="bg-surface border border-border rounded-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Package size={18} weight="bold" className="text-primary" />
                <h3 className="text-base font-bold uppercase tracking-wider text-primary">
                  Add New Garment to Archival Matrix
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted hover:text-primary p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                  Garment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavyweight Raw Hem Oversized Tee"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-10 px-3 bg-canvas border border-border rounded-tight text-xs text-primary focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                  Product Images
                </label>

                {/* Current Images Preview */}
                {newProduct.images.length > 0 && newProduct.images[0] !== '/brand/purgatory-logo-raw.png' && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newProduct.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${idx + 1}`}
                          className="w-16 h-20 object-contain bg-canvas rounded-tight border border-border p-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          title="Remove image"
                        >
                          <X size={10} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Controls */}
                <div className="flex flex-col gap-2.5">
                  {/* File Upload Button */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 px-4 bg-canvas border border-border rounded-tight text-xs font-semibold text-primary hover:bg-surface active:scale-95 transition-all flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <UploadSimple size={15} weight="bold" />
                      <span>Upload from Device</span>
                    </button>
                  </div>

                  {/* OR: Paste URL */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Or paste image URL here..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                      className="flex-1 h-10 px-3 bg-canvas border border-border rounded-tight text-xs text-primary focus:outline-none focus:border-primary font-medium placeholder:text-muted/60"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!imageUrl.trim()}
                      className="h-10 px-3 bg-primary text-canvas rounded-tight text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <ImageSquare size={14} weight="bold" />
                      <span>Add</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-muted font-medium">
                    Accepts PNG, JPG, or WEBP. Max 5 MB per file. First image becomes the main catalogue photo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Division / Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-10 px-3 bg-canvas border border-border rounded-tight text-xs text-primary focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Price (PHP ₱)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="2490"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full h-10 px-3 bg-canvas border border-border rounded-tight text-xs text-primary focus:outline-none focus:border-primary font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                  Initial Stock Per Standard Variant (XS, S, M, L, XL)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={newProduct.initialStock}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, initialStock: e.target.value }))}
                  className="w-full h-10 px-3 bg-canvas border border-border rounded-tight text-xs text-primary focus:outline-none focus:border-primary font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                  Fabrication / Description
                </label>
                <textarea
                  rows="3"
                  placeholder="320 GSM French Terry Cotton, custom heavy wash finish."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-canvas border border-border rounded-tight text-xs text-primary focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-10 px-4 rounded-tight text-xs font-semibold uppercase text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary text-canvas rounded-tight text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  Publish Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
