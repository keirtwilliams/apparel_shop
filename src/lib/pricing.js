/**
 * Purgatory Pricing & Sale Engine Utility
 * Provides centralized calculation for:
 * 1. Per-product markdown (compare_at_price vs. price)
 * 2. Storewide / Category Flash Sale (10% - 90% off)
 * 3. Promo / Coupon validation & calculation (10% - 90% off)
 */

export const DEFAULT_PROMO_CODES = [
  { code: 'PURGATORY10', discountPercent: 10, label: 'Welcome 10% Off' },
  { code: 'FLAMES20', discountPercent: 20, label: 'Falling Flames 20% Off' },
  { code: 'VIP30', discountPercent: 30, label: 'VIP Archival 30% Off' },
  { code: 'DEADSTOCK50', discountPercent: 50, label: 'Deadstock Archive 50% Off' },
  { code: 'FLASH70', discountPercent: 70, label: 'Special Drop 70% Off' },
  { code: 'SAMPLE90', discountPercent: 90, label: 'Sample Clearance 90% Off' },
];

/**
 * Format currency strictly in Philippine Peso (PHP)
 */
export function formatCurrency(amount, currency = 'PHP') {
  const num = Number(amount) || 0;
  return `PHP ${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Calculate effective price of a product taking into account product-level discounts
 * and storewide/category sales (capped between 10% and 90% off).
 */
export function calculateEffectiveProductPrice(product, storeSaleConfig = null) {
  if (!product) return { currentPrice: 0, originalPrice: 0, isOnSale: false, discountPercent: 0 };

  const basePrice = Number(product.price) || 0;
  let originalPrice = product.compare_at_price ? Number(product.compare_at_price) : basePrice;
  let currentPrice = basePrice;

  // 1. Check Product-Level Discount
  let hasProductSale = originalPrice > currentPrice;
  let productDiscountPercent = hasProductSale
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // 2. Check Storewide / Category Sale
  if (storeSaleConfig && storeSaleConfig.active && storeSaleConfig.percentage > 0) {
    const isCategoryMatch =
      !storeSaleConfig.categoryTarget ||
      storeSaleConfig.categoryTarget === 'All' ||
      storeSaleConfig.categoryTarget === product.category;

    if (isCategoryMatch) {
      const storeDiscount = Math.min(Math.max(Number(storeSaleConfig.percentage) || 0, 10), 90);
      const discounted = basePrice * (1 - storeDiscount / 100);

      // If storewide discount gives a lower price than individual markdown, apply it
      if (discounted < currentPrice) {
        if (!hasProductSale) {
          originalPrice = basePrice;
        }
        currentPrice = Math.round(discounted * 100) / 100;
        productDiscountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        hasProductSale = true;
      }
    }
  }

  // Ensure percent is clamped between 0 and 90
  const finalDiscountPercent = Math.min(Math.max(productDiscountPercent, 0), 90);

  return {
    currentPrice,
    originalPrice,
    isOnSale: hasProductSale && finalDiscountPercent >= 5,
    discountPercent: finalDiscountPercent
  };
}

/**
 * Validate coupon code from active coupon registry
 */
export function validateCoupon(code, availableCoupons = DEFAULT_PROMO_CODES) {
  if (!code || typeof code !== 'string') return null;
  const cleanCode = code.trim().toUpperCase();
  const match = availableCoupons.find(c => c.code.toUpperCase() === cleanCode);
  if (!match) return null;

  return {
    code: match.code,
    discountPercent: Math.min(Math.max(Number(match.discountPercent) || 0, 10), 90),
    label: match.label || `${match.discountPercent}% Off`
  };
}
