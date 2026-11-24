import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveProductImageUrl } from '../lib/supabase';
import { useStore } from '../context/StoreContext';
import { calculateEffectiveProductPrice, formatCurrency } from '../lib/pricing';

/**
 * Clutter-Free 4:5 Apparel Catalogue Card
 * Clean, avant-garde design with subtle discount presentation
 */
export default function ProductCard({ product }) {
  const { saleConfig } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.variants?.[0]?.color_name || ''
  );

  const { currentPrice, originalPrice, isOnSale, discountPercent } = calculateEffectiveProductPrice(product, saleConfig);

  // Unique color swatches
  const colorMap = new Map();
  product.variants?.forEach(v => {
    if (!colorMap.has(v.color_name)) {
      colorMap.set(v.color_name, v.color_hex);
    }
  });
  const colorSwatches = Array.from(colorMap.entries()).map(([name, hex]) => ({
    name,
    hex
  }));

  const mainImage = product.images?.[activeImageIndex] || product.images?.[0];
  const secondaryImage = product.images?.[1] || product.images?.[0];

  return (
    <div className="group flex flex-col">
      {/* 1. 4:5 Aspect Ratio Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[4/5] bg-surface rounded-card overflow-hidden border border-border"
        onMouseEnter={() => {
          if (product.images?.length > 1) setActiveImageIndex(1);
        }}
        onMouseLeave={() => setActiveImageIndex(0)}
      >
        <img
          src={resolveProductImageUrl(mainImage)}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          loading="lazy"
        />

        {/* Minimal Archival Sale Pill */}
        {isOnSale && (
          <div className="absolute top-2.5 right-2.5 bg-[#0C0C0B]/90 backdrop-blur-sm text-[#FAF9F7] text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded-tight border border-white/10 shadow-sm">
            −{discountPercent}%
          </div>
        )}
      </Link>

      {/* Info Section (Underneath image, strictly unbloated) */}
      <div className="pt-3 pb-1 flex flex-col gap-1.5">
        {/* Row: Title & Price */}
        <div className="flex items-baseline justify-between gap-2">
          {/* 2. Title */}
          <Link
            to={`/product/${product.slug}`}
            className="text-sm font-medium text-primary hover:text-muted transition-colors truncate"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* 3. Price Display */}
          <div className="flex items-center gap-2 shrink-0 tabular-nums">
            {isOnSale && (
              <span className="text-xs text-muted/60 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
            <span className={`text-sm font-medium ${isOnSale ? 'text-[#C43C30] font-semibold' : 'text-muted'}`}>
              {formatCurrency(currentPrice)}
            </span>
          </div>
        </div>

        {/* 4. Color Swatch Dots */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {colorSwatches.map(swatch => {
            const isSelected = selectedColor === swatch.name;
            return (
              <button
                key={swatch.name}
                type="button"
                onClick={() => setSelectedColor(swatch.name)}
                className={`w-3 h-3 rounded-full transition-transform border border-border focus:outline-none ${isSelected ? 'scale-125 ring-1 ring-primary ring-offset-1 ring-offset-canvas' : 'hover:scale-110 opacity-80'
                  }`}
                style={{ backgroundColor: swatch.hex }}
                title={`${swatch.name}`}
                aria-label={`Select ${swatch.name}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
