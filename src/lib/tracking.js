/**
 * Purgatory Logistics & Consignment Tracking Engine
 * Modeled after Shopee & SHEIN live tracking systems
 */

export const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed', stepNumber: 1 },
  { key: 'processing', label: 'Atelier Packed', stepNumber: 2 },
  { key: 'shipped', label: 'In Transit', stepNumber: 3 },
  { key: 'out_for_delivery', label: 'Out for Delivery', stepNumber: 4 },
  { key: 'delivered', label: 'Delivered', stepNumber: 5 }
];

export const COURIERS = [
  { name: 'J&T Express PH', prefix: 'JNT-PH', express: 'Nationwide Express' },
  { name: 'Flash Express', prefix: 'FLS-MNL', express: 'Next-Day Express' },
  { name: 'NinjaVan PH', prefix: 'NVN-TAG', express: 'Standard Courier' }
];

/**
 * Get or generate deterministic tracking metadata for an order
 */
export function getOrderTrackingMeta(order) {
  if (!order) return null;

  // Consistent courier & tracking number derived from order ID
  const hash = (order.id || 'ORD-0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const courier = order.courier || COURIERS[hash % COURIERS.length].name;
  const trackingNumber = order.tracking_number || `${COURIERS[hash % COURIERS.length].prefix}-${1000000 + (hash * 89) % 9000000}`;

  const currentStatus = order.status || 'pending';
  const createdAt = new Date(order.created_at || Date.now());

  // Hub connections corresponding to status
  const hubMap = {
    pending: {
      hub: 'Purgatory Atelier — BGC Taguig Sorting Center',
      headline: 'Consignment Logged & Payment Verified',
      detail: `Order verified via ${order.payment_method || 'COD'}. Scheduled for inspection at BGC Lab.`,
      city: 'Taguig City, Metro Manila'
    },
    processing: {
      hub: 'Atelier Packaging Lab — Metro Manila Facility',
      headline: 'Garments Hand-Packed & Sealed',
      detail: 'Garments inspected, wrapped in archival tissue, and sealed in high-gauge matte black poly mailer.',
      city: 'Taguig City, Metro Manila'
    },
    shipped: {
      hub: `${courier} Central Sorting Gateway — Pasig Hub`,
      headline: 'Parcel Departed Sorting Gateway',
      detail: 'Package sorted on automated cross-dock conveyer. In transit to regional dispatch hub.',
      city: 'Pasig City, Metro Manila'
    },
    out_for_delivery: {
      hub: `${courier} Local Station (Rider: Kuya Jonathan M.)`,
      headline: 'Parcel is Out for Delivery',
      detail: `Rider is en route to ${order.shipping_address || 'client address'}. Please prepare exact amount for COD.`,
      city: 'Local Delivery Hub'
    },
    delivered: {
      hub: `Delivered to: ${order.customer_name || 'Recipient'}`,
      headline: 'Consignment Completed & Signed',
      detail: `Package safely received at ${order.shipping_address || 'destination'}. Verified signature on file.`,
      city: 'Recipient Destination'
    },
    refunded: {
      hub: 'Purgatory Restock & Returns Facility — BGC Lab',
      headline: 'Consignment Cancelled / Refunded',
      detail: 'Inventory units returned to archival stock. Payment reversed to customer.',
      city: 'Taguig City'
    }
  };

  const currentHub = hubMap[currentStatus] || hubMap.pending;

  // Build sequential timeline of milestones up to current status
  const statusHierarchy = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentIndex = statusHierarchy.indexOf(currentStatus);

  const timeline = [];

  // Generate realistic sequential timestamps
  statusHierarchy.forEach((st, idx) => {
    if (idx <= (currentIndex >= 0 ? currentIndex : 0)) {
      const milestoneTime = new Date(createdAt.getTime() + idx * (6 * 3600 * 1000));
      const info = hubMap[st];
      timeline.unshift({
        status: st,
        title: info.headline,
        description: info.detail,
        location: info.hub,
        city: info.city,
        timestamp: milestoneTime.toISOString(),
        isCurrent: idx === currentIndex
      });
    }
  });

  return {
    courier,
    trackingNumber,
    currentStatus,
    currentLocation: currentHub.hub,
    currentHeadline: currentHub.headline,
    currentDetail: currentHub.detail,
    currentCity: currentHub.city,
    timeline,
    estimatedDelivery: currentStatus === 'delivered' ? 'Completed' : 'Within 24–48 Hours (Express Courier)'
  };
}
