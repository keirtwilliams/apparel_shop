import React, { useState, useMemo } from 'react';
import { MagnifyingGlass, Funnel, X, ArrowDown } from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { brandConfig } from '../config/brand';
import ProductCard from '../components/ProductCard';

export default function CataloguePage() {
  const { products } = useStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(350);

  const categories = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear'];
  const sizes = ['All', 'S', 'M', 'L', 'XL'];

  // Instant, no-reload filter computation
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (product.price > maxPrice) {
        return false;
      }
      if (selectedSize !== 'All') {
        const hasSizeInStock = product.variants?.some(
          v => v.size === selectedSize && v.stock_count > 0
        );
        if (!hasSizeInStock) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesMaterial = product.material.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesMaterial) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, selectedCategory, selectedSize, maxPrice, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('All');
    setSearchQuery('');
    setMaxPrice(350);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSize !== 'All' ||
    searchQuery.trim() !== '' ||
    maxPrice < 350 ||
    sortBy !== 'featured';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Catalogue Header & Piece Count (Strictly Clutter-Free) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-border gap-3">
        <div>
          <span className="text-xs uppercase tracking-widest text-muted font-mono font-semibold">
            Collection 01 — Falling Flames
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mt-1 tracking-tight uppercase">
            Garment Catalogue
          </h1>
        </div>

        {/* Counter */}
        <div className="text-xs text-muted tabular-nums font-mono">
          Showing <span className="font-semibold text-primary">{filteredProducts.length}</span> of {products.length} archival pieces
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="py-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-input text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap min-h-[38px] ${
                selectedCategory === cat
                  ? 'bg-primary text-canvas'
                  : 'bg-surface text-muted hover:text-primary border border-border'
              }`}
            >
              {cat === 'All' ? 'All Pieces' : cat}
            </button>
          ))}
        </div>

        {/* Search, Size, & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56 min-w-[180px]">
            <MagnifyingGlass
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search pieces, fabrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-input text-primary placeholder-muted focus:outline-none focus:border-primary transition-colors min-h-[38px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Size Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted font-mono hidden sm:inline">SIZE:</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              aria-label="Filter by size"
              className="bg-surface border border-border rounded-input px-2.5 py-1.5 text-xs text-primary focus:outline-none focus:border-primary cursor-pointer min-h-[38px]"
            >
              <option value="All">All Sizes</option>
              {sizes.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>Size {s}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted font-mono hidden sm:inline">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="bg-surface border border-border rounded-input px-2.5 py-1.5 text-xs text-primary focus:outline-none focus:border-primary cursor-pointer min-h-[38px]"
            >
              <option value="featured">Featured Drop</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 text-xs text-muted hover:text-danger flex items-center gap-1 border border-border rounded-input bg-surface transition-colors min-h-[38px]"
              title="Reset all filters"
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Clutter-Free 4:5 Apparel Catalogue Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">
            No garments match your active filters
          </p>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Try adjusting your category, size, or search criteria.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-5 py-2.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 transition-opacity min-h-[44px]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12 pt-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
