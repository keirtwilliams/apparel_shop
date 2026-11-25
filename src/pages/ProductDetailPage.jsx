import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ruler, Check, CaretDown, CaretUp, Bag, Clock } from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { resolveProductImageUrl } from '../lib/supabase';
import { calculateEffectiveProductPrice, formatCurrency, formatCountdown } from '../lib/pricing';
import SizeChartModal from '../components/SizeChartModal';
import StickyMobileBar from '../components/StickyMobileBar';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, saleConfig } = useStore();
  const [now, setNow] = useState(() => Date.now());

  const product = products.find(p => p.slug === slug);

  useEffect(() => {
    if (!product?.sale_ends_at || product.sale_ends_at <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [product?.sale_ends_at]);

  // Fallback if product not found
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-semibold text-primary">Garment Not Found</h2>
        <p className="text-xs text-muted mt-1">The garment you are looking for does not exist or has been archived.</p>
        <Link
          to="/"
          className="mt-4 inline-block px-5 py-2.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  // Active state
  const [selectedColor, setSelectedColor] = useState(
    product.variants?.[0]?.color_name || ''
  );
  const [selectedSize, setSelectedSize] = useState(() => {
    // Pick the first in-stock size if available, otherwise first size
    const inStock = product.variants?.find(v => v.stock_count > 0);
    return inStock?.size || product.variants?.[0]?.size || 'M';
  });
  const [activeImage, setActiveImage] = useState(product.images?.[0]);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Accordion state for upfront specs (Material, Fit, Care)
  const [openSpecs, setOpenSpecs] = useState({
    material: true,
    fit: true,
    care: false,
  });

  const toggleSpec = (key) => {
    setOpenSpecs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Find unique colors
  const colorMap = new Map();
  product.variants?.forEach(v => {
    if (!colorMap.has(v.color_name)) {
      colorMap.set(v.color_name, v.color_hex);
    }
  });
  const colorList = Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));

  // Find active variant matching selected color & size
  const currentVariant = useMemo(() => {
    return product.variants?.find(
      v => v.color_name === selectedColor && v.size === selectedSize
    ) || product.variants?.find(v => v.color_name === selectedColor) || product.variants?.[0];
  }, [product, selectedColor, selectedSize]);

  // Standard sizes for apparel
  const availableSizes = ['S', 'M', 'L', 'XL'];

  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stock_count === 0) return;
    setIsAdding(true);
    addToCart(product, currentVariant, 1);
    setTimeout(() => {
      setIsAdding(false);
    }, 1200);
  };

  const isOutOfStock = !currentVariant || currentVariant.stock_count === 0;
  const isLowStock = currentVariant && currentVariant.stock_count > 0 && currentVariant.stock_count <= 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 md:pb-16">
      {/* Breadcrumb / Back Link */}
      <div className="mb-6">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors min-h-[36px]"
        >
          <ArrowLeft size={14} />
          <span>Catalogue / {product.category}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left: Product Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 sm:w-20 aspect-square sm:aspect-[4/5] rounded-input overflow-hidden border p-1 bg-surface transition-all ${(activeImage || product.images[0]) === img
                      ? 'border-primary ring-2 ring-primary/40 scale-[1.02]'
                      : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img
                    src={resolveProductImageUrl(img)}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-contain object-center"
                  />
                  <span className="absolute bottom-1 right-1 text-[8px] font-mono uppercase bg-primary text-canvas px-1 rounded">
                    {idx === 0 ? 'F' : 'B'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Main Full-Garment Unclipped Canvas */}
          <div className="relative flex-1 aspect-square sm:aspect-[4/5] bg-surface rounded-card overflow-hidden border border-border p-4 sm:p-6 flex items-center justify-center group">
            <img
              src={resolveProductImageUrl(activeImage || product.images?.[0])}
              alt={product.name}
              className="w-full h-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
        </div>

        {/* Right: Product Details & Controls */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Title & Price */}
          <div className="pb-6 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-muted">
                PURGATORY · ARCHIVE
              </span>
              <span className="text-border">·</span>
              <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                {product.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary mt-1 tracking-tight">
              {product.name}
            </h1>

            {/* Price & Savings Display */}
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              {(() => {
                const { currentPrice, originalPrice, isOnSale, discountPercent, saleEndsAt } = calculateEffectiveProductPrice(product, saleConfig);
                const countdown = saleEndsAt ? formatCountdown(saleEndsAt - now) : null;
                return (
                  <>
                    <span className={`text-xl sm:text-2xl font-semibold tabular-nums ${isOnSale ? 'text-[#C43C30]' : 'text-primary'}`}>
                      {formatCurrency(currentPrice)}
                    </span>
                    {isOnSale && (
                      <>
                        <span className="text-sm text-muted/60 line-through tabular-nums">
                          {formatCurrency(originalPrice)}
                        </span>
                        <span className="bg-[#C43C30] text-[#FAF9F7] text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-tight">
                          SALE -{discountPercent}%
                        </span>
                        {countdown && (
                          <span className="inline-flex items-center gap-1 bg-primary text-canvas text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-tight tabular-nums">
                            <Clock size={12} weight="bold" className="text-[#C43C30]" />
                            <span>Ends in {countdown}</span>
                          </span>
                        )}
                      </>
                    )}
                    <span className="text-xs text-muted">Taxes included</span>
                  </>
                );
              })()}
            </div>

            {/* Evocative Garment Description */}
            <p className="mt-4 text-xs sm:text-sm text-muted leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Color Selection */}
          <div className="py-5 border-b border-border">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-muted">Color Palette:</span>
              <span className="font-medium text-primary">{selectedColor}</span>
            </div>
            <div className="flex items-center gap-2.5">
              {colorList.map(color => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-7 h-7 rounded-full border border-border flex items-center justify-center transition-all ${isSelected
                      ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-canvas'
                      : 'hover:scale-105 opacity-80'
                      }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                  >
                    {isSelected && (
                      <Check
                        size={12}
                        weight="bold"
                        className={color.hex === '#DDD9D1' || color.hex === '#E8E4DA' || color.hex === '#CBC7BD' ? 'text-primary' : 'text-canvas'}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fit-First Size Selector */}
          <div className="py-5 border-b border-border">
            {/* 1-Line Fit Tag */}
            <div className="mb-3 p-2.5 bg-surface rounded-input border border-border text-xs text-primary leading-snug">
              <span className="font-semibold">Fit Note: </span>
              {product.fit_note}
            </div>

            {/* Size Header with 1-Click Size Chart Modal Trigger */}
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-muted">Select Garment Size:</span>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="text-xs font-medium text-primary hover:text-muted flex items-center gap-1 transition-colors min-h-[36px]"
              >
                <Ruler size={14} />
                <span>Size & Fit Guide</span>
              </button>
            </div>

            {/* Clickable S / M / L / XL size pills (auto-disabled when stock_count === 0) */}
            <div className="grid grid-cols-4 gap-2">
              {availableSizes.map(size => {
                const variantForSize = product.variants?.find(
                  v => v.color_name === selectedColor && v.size === size
                );
                const stock = variantForSize ? variantForSize.stock_count : 0;
                const isSoldOut = stock === 0;
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => setSelectedSize(size)}
                    className={`relative py-3 rounded-input text-xs font-semibold tracking-wider uppercase border transition-all min-h-[44px] flex flex-col items-center justify-center ${isSoldOut
                      ? 'bg-surface text-muted/40 border-border cursor-not-allowed line-through opacity-60'
                      : isSelected
                        ? 'bg-primary text-canvas border-primary shadow-xs'
                        : 'bg-canvas text-primary border-border hover:border-primary hover:bg-surface'
                      }`}
                    title={isSoldOut ? 'Sold out in this size' : `Size ${size} (${stock} available)`}
                  >
                    <span>{size}</span>
                  </button>
                );
              })}
            </div>

            {/* Real-time Inventory Alert */}
            <div className="mt-3 min-h-[20px] text-xs">
              {isOutOfStock ? (
                <span className="text-danger font-medium flex items-center gap-1">
                  ● Currently sold out in {selectedColor} ({selectedSize})
                </span>
              ) : isLowStock ? (
                <span className="text-danger font-medium flex items-center gap-1">
                  ● Only {currentVariant.stock_count} remaining in stock — order soon
                </span>
              ) : (
                <span className="text-success font-medium flex items-center gap-1">
                  ● In stock and ready to dispatch
                </span>
              )}
            </div>
          </div>

          {/* Desktop Add to Cart CTA */}
          <div className="py-6 border-b border-border hidden md:block">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`w-full py-3.5 px-6 rounded-tight text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-h-[48px] ${isOutOfStock
                ? 'bg-surface text-muted cursor-not-allowed border border-border'
                : 'bg-primary text-canvas hover:opacity-90 active:scale-[0.99]'
                }`}
            >
              <Bag size={18} />
              <span>
                {isOutOfStock
                  ? 'Sold Out'
                  : isAdding
                    ? 'Added to Shopping Bag ✓'
                    : `Add to Bag — ${formatCurrency(product.price)}`}
              </span>
            </button>
          </div>

          {/* 3 Upfront Specs Accordions (Material, Fit, Care) */}
          <div className="divide-y divide-border pt-2 text-xs">
            {/* 1. Material */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleSpec('material')}
                className="w-full flex items-center justify-between text-left font-semibold text-primary min-h-[36px]"
              >
                <span>Material & Construction</span>
                {openSpecs.material ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </button>
              {openSpecs.material && (
                <p className="mt-2 text-muted leading-relaxed">
                  {product.material}
                </p>
              )}
            </div>

            {/* 2. Fit Specs */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleSpec('fit')}
                className="w-full flex items-center justify-between text-left font-semibold text-primary min-h-[36px]"
              >
                <span>Silhouette & Drape</span>
                {openSpecs.fit ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </button>
              {openSpecs.fit && (
                <p className="mt-2 text-muted leading-relaxed">
                  {product.fit_note}
                </p>
              )}
            </div>

            {/* 3. Care Specs */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleSpec('care')}
                className="w-full flex items-center justify-between text-left font-semibold text-primary min-h-[36px]"
              >
                <span>Garment Care</span>
                {openSpecs.care ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </button>
              {openSpecs.care && (
                <p className="mt-2 text-muted leading-relaxed">
                  {product.care}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category}
      />

      {/* Sticky Mobile "Add to Cart" Bar */}
      <StickyMobileBar
        product={product}
        selectedVariant={currentVariant}
        onAddToCart={handleAddToCart}
        isAdding={isAdding}
      />
    </div>
  );
}
