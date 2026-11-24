import React, { useState, useMemo } from 'react';
import {
  Truck, MapPin, Package, Clock, CheckCircle, ArrowRight,
  Eye, Broadcast, ArrowsClockwise
} from '@phosphor-icons/react';
import { getOrderTrackingMeta, TRACKING_STEPS, COURIERS } from '../../lib/tracking';
import { formatCurrency } from '../../lib/pricing';

export default function AdminLogisticsTab({
  orders,
  updateOrderStatus,
  onOpenTrackingModal
}) {
  const [courierFilter, setCourierFilter] = useState('All');

  // Active consignments (not refunded and not delivered)
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'refunded' && o.status !== 'delivered');
  }, [orders]);

  // Stage pipeline counts
  const stageCounts = useMemo(() => {
    const counts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0
    };
    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status] += 1;
      }
    });
    return counts;
  }, [orders]);

  // Orders filtered by courier
  const filteredActiveOrders = useMemo(() => {
    return activeOrders.filter(order => {
      if (courierFilter === 'All') return true;
      const meta = getOrderTrackingMeta(order);
      return meta.courier.toLowerCase().includes(courierFilter.toLowerCase());
    });
  }, [activeOrders, courierFilter]);

  const nextStepMap = {
    pending: { next: 'processing', label: 'Pack Atelier →', nextLocation: 'Atelier Packaging Lab' },
    processing: { next: 'shipped', label: 'Dispatch to Hub →', nextLocation: 'Pasig Sorting Gateway' },
    shipped: { next: 'out_for_delivery', label: 'Assign Rider →', nextLocation: 'Local Delivery Station' },
    out_for_delivery: { next: 'delivered', label: 'Mark Delivered ✓', nextLocation: 'Customer Address' }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 bg-canvas border border-border rounded-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">
                Shopee / SHEIN Live Logistics Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-primary mt-1">
              Consignment Dispatch & Hub Network
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Admin-driven 5-stage fulfillment pipeline with deterministic courier routing across Metro Manila hubs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted">Courier Fleet:</span>
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="bg-surface border border-border rounded-input px-3 py-1.5 text-xs text-primary font-medium focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">All Couriers (J&T, Flash, NinjaVan)</option>
              <option value="J&T">J&T Express PH</option>
              <option value="Flash">Flash Express</option>
              <option value="NinjaVan">NinjaVan PH</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5-STAGE PIPELINE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {TRACKING_STEPS.map((step, idx) => {
          const count = stageCounts[step.key] || 0;
          const isFinal = step.key === 'delivered';
          return (
            <div
              key={step.key}
              className={`p-4 rounded-card border flex flex-col justify-between gap-3 ${
                isFinal ? 'bg-success-light/20 border-success/30' : 'bg-canvas border-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted uppercase font-bold">
                    Stage 0{step.stepNumber}
                  </span>
                  {isFinal ? (
                    <CheckCircle size={15} className="text-success" weight="bold" />
                  ) : (
                    <Clock size={15} className="text-muted" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-primary mt-1">
                  {step.label}
                </h4>
              </div>

              <div>
                <span className="text-2xl font-bold font-mono text-primary tabular-nums">
                  {count}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  {isFinal ? 'Completed consignments' : 'Parcels currently queued'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE DISPATCH QUEUE */}
      <div className="bg-canvas border border-border rounded-card p-5">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Active Dispatch Queue ({filteredActiveOrders.length} Parcels In Pipeline)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Advance consignments from one hub to the next with 1-click execution.
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted bg-surface px-2.5 py-1 rounded border border-border">
            Real-Time Courier Sync Active
          </span>
        </div>

        {filteredActiveOrders.length === 0 ? (
          <div className="py-12 text-center text-muted text-xs">
            All current orders have reached final delivery or no active shipments in this courier filter.
          </div>
        ) : (
          <div className="divide-y divide-border mt-2">
            {filteredActiveOrders.map(order => {
              const meta = getOrderTrackingMeta(order);
              const action = nextStepMap[order.status];

              return (
                <div
                  key={order.id}
                  className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-surface/40 px-2 rounded-input transition-colors"
                >
                  {/* Order & Recipient Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenTrackingModal(order)}
                        className="font-mono font-bold text-xs text-primary hover:text-[#C43C30] hover:underline flex items-center gap-1"
                        title="Open live tracking preview"
                      >
                        <span>{order.id}</span>
                        <Eye size={12} className="text-muted" />
                      </button>
                      <span className="text-muted text-xs">·</span>
                      <span className="text-xs text-primary font-medium">{order.customer_name}</span>
                      <span className="text-muted text-xs">·</span>
                      <span className="text-xs font-mono font-bold text-primary">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted">
                      <MapPin size={12} className="text-[#C43C30] shrink-0" />
                      <span className="truncate max-w-md">
                        {order.shipping_address}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-muted pt-0.5">
                      <Truck size={12} className="text-primary" />
                      <span className="font-semibold text-primary">{meta.courier}</span>
                      <span>·</span>
                      <span className="text-primary/80">{meta.trackingNumber}</span>
                    </div>
                  </div>

                  {/* Current Hub Beacon & Stage Advancer */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                    <div className="bg-surface border border-border px-3 py-2 rounded-input text-left sm:text-right">
                      <span className="text-[10px] font-mono uppercase text-muted block">
                        Current Hub Connection
                      </span>
                      <span className="text-xs font-bold text-primary block truncate max-w-[240px]">
                        {meta.currentLocation}
                      </span>
                      <span className="text-[10px] text-muted block capitalize">
                        Status: {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {action && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, action.next)}
                          className="px-3.5 py-2 bg-primary text-canvas rounded text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-xs"
                          title={`Advance parcel to ${action.nextLocation}`}
                        >
                          {action.label}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenTrackingModal(order)}
                        className="px-3 py-2 bg-surface hover:bg-canvas border border-border rounded text-xs font-medium text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Eye size={13} />
                        <span>Live Modal</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
