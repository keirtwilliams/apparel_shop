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
  const [isHovered, setIsHovered] = useState(false);
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

  const frontImage = product.images?.[0];
  const backImage = product.images?.[1];

  // Active angle determined by hover state or manual button toggle
  const showBack = (isHovered && backImage) || activeImageIndex === 1;

  return (
    <div className="group flex flex-col">
      {/* 1. Full-Garment Image Container (Dual-Layer Silky Smooth Crossfade) */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-square sm:aspect-[4/5] bg-surface rounded-card overflow-hidden border border-border p-2 sm:p-3 transition-all duration-500 ease-out group-hover:border-primary/40 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setActiveImageIndex(0);
        }}
      >
        {/* Layer 1: Front Image (Silky Opacity Crossfade) */}
        {frontImage && (
          <img
            src={resolveProductImageUrl(frontImage)}
            alt={`${product.name} Front View`}
            className={`absolute inset-0 w-full h-full object-contain object-center p-2 sm:p-3 transition-all duration-700 ease-out ${
              showBack ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
            }`}
            loading="lazy"
          />
        )}

        {/* Layer 2: Back Image (Silky Opacity Crossfade) */}
        {backImage && (
          <img
            src={resolveProductImageUrl(backImage)}
            alt={`${product.name} Back View`}
            className={`absolute inset-0 w-full h-full object-contain object-center p-2 sm:p-3 transition-all duration-700 ease-out ${
              showBack ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            loading="lazy"
          />
        )}

        {/* Minimal Archival Sale Pill */}
        {isOnSale && (
          <div className="absolute top-2.5 right-2.5 z-10 bg-[#0C0C0B]/90 backdrop-blur-sm text-[#FAF9F7] text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded-tight border border-white/10 shadow-sm">
            −{discountPercent}%
          </div>
        )}
      </Link>

      {/* Info Section (Underneath image, strictly unbloated) */}
      <div className="pt-3 pb-1 flex flex-col gap-1.5">
        {/* Row: Title & Price */}
        <div className="flex items-baseline justify-between gap-2">
          {/* 2. Title without hover underline */}
          <Link
            to={`/product/${product.slug}`}
            className="text-sm font-medium text-primary hover:text-muted transition-colors truncate max-w-[70%]"
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

        {/* 4. Controls Row: Color Swatches */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5">
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
    </div>
  );
}
