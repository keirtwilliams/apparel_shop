import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlass, Eye, Truck, Check, Warning,
  ArrowsClockwise, XCircle
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

  // Status breakdown counts
  const statusCounts = useMemo(() => {
    const counts = {
      All: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      refunded: 0
    };
    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status] += 1;
      }
    });
    return counts;
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Status filter
      if (selectedStatus !== 'All' && o.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = (o.id || '').toLowerCase().includes(q);
        const matchesCustomer = (o.customer_name || '').toLowerCase().includes(q);
        const matchesEmail = (o.customer_email || '').toLowerCase().includes(q);
        const matchesAddress = (o.shipping_address || '').toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesEmail && !matchesAddress) {
          return false;
        }
      }
      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const statusPills = [
    { key: 'All', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Atelier Packed' },
    { key: 'shipped', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'refunded', label: 'Refunded' }
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar & Quick Status Pills */}
      <div className="p-5 bg-canvas border border-border rounded-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-primary uppercase tracking-wide">
              Consignment & Orders Ledger
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Live status toggles, 1-click stage advancement, instant Shopee/SHEIN hub tracking & automated stock refunds.
            </p>
          </div>

          {/* Instant Search Bar */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <MagnifyingGlass
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search by ID, customer, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-input pl-9 pr-8 py-2 text-xs text-primary focus:outline-none focus:border-primary placeholder:text-muted/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-border/60">
          {statusPills.map(tab => {
            const isActive = selectedStatus === tab.key;
            const count = statusCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3 py-1.5 rounded-input text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-canvas font-semibold shadow-xs'
                    : 'bg-surface hover:bg-canvas text-muted hover:text-primary border border-border'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-canvas/20 text-canvas'
                      : 'bg-canvas text-muted border border-border/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-canvas border border-border rounded-card overflow-hidden">
        <div className="px-5 py-3.5 bg-surface border-b border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-primary">
              Showing {filteredOrders.length} of {orders.length} Consignments
            </span>
            {selectedStatus !== 'All' && (
              <span className="text-muted font-mono">
                · Filtered by <strong className="text-primary">{selectedStatus}</strong>
              </span>
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-muted">
            <p className="text-xs">No orders found matching the filter criteria.</p>
            {(searchQuery || selectedStatus !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('All');
                }}
                className="mt-3 text-xs text-primary underline font-medium"
              >
                Reset Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/60 text-muted uppercase tracking-wider border-b border-border font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Fulfillment Pipeline</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
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
                    <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-medium text-primary">
                        <button
                          type="button"
                          onClick={() => onOpenTrackingModal(order)}
                          className="hover:underline hover:text-[#C43C30] flex items-center gap-1.5 text-left group"
                          title="Click to view live Shopee/SHEIN tracking"
                        >
                          <span className="font-bold">{order.id}</span>
                          <Eye size={13} className="text-muted group-hover:text-[#C43C30]" />
                        </button>
                        <div className="text-[10px] text-muted font-sans mt-0.5">
                          {order.items?.length || 0} item(s) · {order.items?.[0]?.product_name?.slice(0, 20)}...
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-muted whitespace-nowrap">{formattedDate}</td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-primary">{order.customer_name}</div>
                        <div className="text-[10px] text-muted">{order.customer_email}</div>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4">
                        <span className="uppercase text-[10px] font-mono font-bold px-2 py-0.5 bg-surface border border-border rounded-input text-primary">
                          {order.payment_method}
                        </span>
                        <div className="text-[10px] text-muted mt-0.5 capitalize">
                          {order.payment_status}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-bold text-primary">
                        {formatCurrency(order.total_amount)}
                      </td>

                      {/* Fulfillment Stage Controls */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={isRefunded}
                            className={`text-xs px-2.5 py-1 rounded-input border focus:outline-none cursor-pointer font-medium ${
                              isRefunded
                                ? 'bg-danger-light text-danger border-danger/30'
                                : order.status === 'delivered'
                                ? 'bg-success-light text-success border-success/30'
                                : order.status === 'out_for_delivery'
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : 'bg-surface text-primary border-border'
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
                              className="px-2.5 py-1 bg-primary text-canvas rounded text-[10px] font-mono font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1 shadow-xs"
                              title={`Advance to ${nextAction.next}`}
                            >
                              <span>{nextAction.label}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenTrackingModal(order)}
                            className="px-2.5 py-1 bg-surface hover:bg-canvas border border-border rounded text-[11px] font-medium text-primary transition-colors flex items-center gap-1"
                            title="Inspect live Shopee/SHEIN tracking"
                          >
                            <Truck size={13} />
                            <span>Track</span>
                          </button>

                          {isRefunded ? (
                            <span className="text-[11px] text-muted italic px-2 py-0.5">
                              Restored ✓
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => refundOrder(order.id)}
                              className="px-2.5 py-1 bg-surface hover:bg-danger-light hover:text-danger hover:border-danger/40 border border-border rounded text-[11px] font-medium text-muted transition-colors"
                              title="Restores garment quantities back to stock"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
