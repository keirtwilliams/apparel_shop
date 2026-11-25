import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlass, ArrowClockwise,
  Check, XCircle, ArrowRight
} from '@phosphor-icons/react';
import { formatCurrency } from '../../lib/pricing';

export default function AdminOrdersTab({
  orders,
  updateOrderStatus,
  refundOrder,
  onOpenTrackingModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Filtered orders with instant search
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Status Filter
      if (selectedStatus !== 'All' && order.status !== selectedStatus) {
        return false;
      }

      // 2. Text Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const idMatch = order.id?.toLowerCase().includes(query);
        const nameMatch = order.customer_name?.toLowerCase().includes(query);
        const emailMatch = order.customer_email?.toLowerCase().includes(query);
        const addressMatch = order.shipping_address?.toLowerCase().includes(query);
        const cityMatch = order.city?.toLowerCase().includes(query);
        const itemsMatch = order.items?.some(it =>
          it.product_name?.toLowerCase().includes(query) ||
          it.category?.toLowerCase().includes(query)
        );

        if (!idMatch && !nameMatch && !emailMatch && !addressMatch && !cityMatch && !itemsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Status counts for pills
  const statusCounts = useMemo(() => {
    const counts = { All: orders.length };
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const statusPills = [
    { key: 'All', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Atelier Packed' },
    { key: 'shipped', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'refunded', label: 'Refunded' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. SEARCH & FILTER TOOLBAR */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted font-bold block">
              Consignments Ledger
            </span>
            <span className="text-sm font-bold text-primary tracking-tight">
              Order Fulfillment & Lifecycle
            </span>
          </div>

          {/* Instant Search Bar */}
          <div className="relative w-full sm:w-[340px]">
            <MagnifyingGlass
              size={15}
              weight="bold"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search by ID, recipient, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-canvas border border-border rounded-tight pl-9 pr-8 py-2 text-xs text-primary focus:outline-none focus:border-primary placeholder:text-muted/60 transition-colors font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer"
                aria-label="Clear search"
              >
                <XCircle size={14} weight="fill" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-border">
          {statusPills.map(tab => {
            const isActive = selectedStatus === tab.key;
            const count = statusCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-tight text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-canvas font-bold shadow-xs'
                    : 'bg-canvas hover:bg-surface text-muted hover:text-primary border border-border'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-canvas/20 text-canvas'
                      : 'bg-surface text-muted border border-border'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ORDERS MANAGEMENT TABLE */}
      <div className="bg-surface border border-border rounded-card overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-primary">
              Consignment Registry ({filteredOrders.length} Loaded)
            </span>
            {selectedStatus !== 'All' && (
              <span className="text-muted">
                · Status: <strong className="text-primary">{selectedStatus}</strong>
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-muted">
            1-Click Status Advancement & Automatic Inventory Restoration
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <p className="text-sm font-semibold">No consignments match this filter.</p>
            <p className="text-xs text-muted mt-1">Try clearing your search query or selecting 'All Orders'.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (< md) */}
            <div className="md:hidden divide-y divide-border">
              {filteredOrders.map(order => {
                const isRefunded = order.status === 'refunded';
                const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const nextMap = {
                  pending: { next: 'processing', label: 'Pack Atelier →' },
                  processing: { next: 'shipped', label: 'Dispatch Hub →' },
                  shipped: { next: 'out_for_delivery', label: 'Out for Delivery →' },
                  out_for_delivery: { next: 'delivered', label: 'Deliver ✓' }
                };
                const nextAction = nextMap[order.status];

                return (
                  <div
                    key={order.id}
                    onClick={() => onOpenTrackingModal(order)}
                    className="p-4 space-y-3 text-xs hover:bg-canvas/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-primary">
                          {order.id}
                        </span>
                        <div className="text-muted mt-0.5 truncate">
                          {order.customer_name} · {formattedDate}
                        </div>
                      </div>
                      <span className="font-bold text-primary tabular-nums shrink-0">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>

                    <div
                      className="flex flex-wrap items-center justify-between gap-2 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={isRefunded}
                        className={`text-xs px-2.5 py-1.5 rounded-tight border focus:outline-none cursor-pointer font-medium ${
                          isRefunded
                            ? 'bg-danger-light text-danger border-danger/30'
                            : order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === 'out_for_delivery'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-canvas text-primary border-border'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Atelier Packed</option>
                        <option value="shipped">In Transit</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="refunded">Refunded</option>
                      </select>

                      <div className="flex items-center gap-2">
                        {!isRefunded && nextAction && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, nextAction.next)}
                            className="px-2.5 py-1.5 bg-primary text-canvas rounded-tight text-xs font-semibold cursor-pointer"
                          >
                            {nextAction.label}
                          </button>
                        )}
                        {!isRefunded && (
                          <button
                            type="button"
                            onClick={() => refundOrder(order.id)}
                            className="px-2.5 py-1.5 bg-danger-light text-danger border border-danger/30 rounded-tight text-xs font-semibold cursor-pointer"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Registry Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-primary border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-canvas border-b border-border uppercase text-muted tracking-wider text-xs font-bold">
                  <th className="py-3 px-5 font-bold">Consignment ID</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Recipient</th>
                  <th className="py-3 px-4 font-bold">Payment</th>
                  <th className="py-3 px-4 font-bold">Total</th>
                  <th className="py-3 px-5 font-bold">Logistics Pipeline</th>
                  <th className="py-3 px-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border tabular-nums">
                {filteredOrders.map(order => {
                  const isRefunded = order.status === 'refunded';
                  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  const nextMap = {
                    pending: { next: 'processing', label: 'Pack Atelier →' },
                    processing: { next: 'shipped', label: 'Dispatch Hub →' },
                    shipped: { next: 'out_for_delivery', label: 'Out for Delivery →' },
                    out_for_delivery: { next: 'delivered', label: 'Deliver ✓' }
                  };

                  const nextAction = nextMap[order.status];

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onOpenTrackingModal(order)}
                      className="hover:bg-canvas/60 transition-colors cursor-pointer"
                      title="Click row to inspect tracking"
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-5 text-primary">
                        <span className="font-bold text-primary">
                          {order.id}
                        </span>
                        <div className="text-xs text-muted font-sans mt-0.5 truncate max-w-[200px]">
                          {order.items?.length || 0} item(s) · {order.items?.[0]?.product_name}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-muted whitespace-nowrap text-xs font-medium">
                        {formattedDate}
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-primary">{order.customer_name}</div>
                        <div className="text-xs text-muted truncate max-w-[180px] font-medium">{order.customer_email}</div>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex flex-col items-center gap-1 w-16">
                          <span className="w-full text-center uppercase text-[11px] font-bold px-2 py-0.5 bg-canvas border border-border rounded-tight text-primary">
                            {order.payment_method}
                          </span>
                          <span
                            className={`text-xs capitalize font-semibold ${
                              order.payment_status === 'refunded' ? 'text-danger' : 'text-muted'
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-primary text-xs tabular-nums">
                        {formatCurrency(order.total_amount)}
                      </td>

                      {/* Fulfillment Stage Controls */}
                      <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={isRefunded}
                            className={`text-xs px-2.5 py-1 rounded-tight border focus:outline-none cursor-pointer font-medium transition-colors ${
                              isRefunded
                                ? 'bg-danger-light text-danger border-danger/30'
                                : order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : order.status === 'out_for_delivery'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-canvas text-primary border-border'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Atelier Packed</option>
                            <option value="shipped">In Transit</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="refunded">Refunded</option>
                          </select>

                          {/* 1-Click Fast Stage Advance Button */}
                          {!isRefunded && nextAction && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, nextAction.next)}
                              className="px-2.5 py-1 bg-primary text-canvas text-xs font-bold uppercase tracking-wider rounded-tight hover:opacity-90 active:scale-95 transition-all shadow-2xs whitespace-nowrap cursor-pointer"
                              title={`Advance status to ${nextAction.next}`}
                            >
                              {nextAction.label}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {/* Instant Refund with Stock Auto-Restoration */}
                          {!isRefunded ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Issue full refund for ${order.id} (${formatCurrency(order.total_amount)})? This will automatically restore purchased variants to inventory stock.`)) {
                                  refundOrder(order.id);
                                }
                              }}
                              className="px-2 py-1 text-xs text-danger hover:bg-danger-light border border-transparent hover:border-danger/30 rounded-tight transition-colors font-semibold cursor-pointer"
                              title="Cancel consignment and restore inventory counts"
                            >
                              Refund
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-danger bg-danger-light px-2 py-0.5 rounded-tight border border-danger/30">
                              Restored
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
