import React from 'react';
import { Bag } from '@phosphor-icons/react';

/**
 * Mobile-First Sticky "Add to Cart" Bar
 * Satisfies strict 44x44px minimum tap targets and instant feedback
 */
export default function StickyMobileBar({
  product,
  selectedVariant,
  onAddToCart,
  isAdding
}) {
  if (!product || !selectedVariant) return null;

  const isOutOfStock = selectedVariant.stock_count === 0;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-canvas/95 backdrop-blur-sm border-t border-border p-3 px-4 shadow-lg safe-bottom">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Info */}
        <div className="flex flex-col">
          <span className="text-xs text-muted truncate max-w-[140px]">
            {product.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary tabular-nums">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-xs text-muted">
              ({selectedVariant.color_name} · {selectedVariant.size})
            </span>
          </div>
        </div>

        {/* CTA Button (Strict 44px min-height tap target) */}
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isOutOfStock || isAdding}
          className={`flex-1 py-3 px-5 rounded-tight text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-h-[44px] ${
            isOutOfStock
              ? 'bg-surface text-muted cursor-not-allowed border border-border'
              : 'bg-primary text-canvas hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          <Bag size={16} />
          <span>
            {isOutOfStock
              ? 'Sold Out'
              : isAdding
              ? 'Added to Bag ✓'
              : 'Add to Bag'}
          </span>
        </button>
      </div>
    </div>
  );
}
