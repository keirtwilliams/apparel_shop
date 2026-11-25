import React, { useState, useMemo } from 'react';
import {
  Truck, MapPin, Package, Clock, CheckCircle, ArrowRight,
  Eye, ArrowsClockwise
} from '@phosphor-icons/react';
import { getOrderTrackingMeta, TRACKING_STEPS } from '../../lib/tracking';
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
    <div className="space-y-6 font-sans">
      {/* 1. DISPATCH CONTROL HEADER & COURIER SELECTOR */}
      <div className="p-6 bg-surface border border-border rounded-card shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary tracking-tight uppercase">
              Consignment Dispatch & Hub Network
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Deterministic courier routing across Metro Manila sorting hubs with real-time consignment milestone progression.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider shrink-0">Fleet:</span>
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="h-10 bg-canvas border border-border rounded-tight px-3.5 text-xs text-primary font-medium focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
            >
              <option value="All">All Fleets (J&T, Flash, NinjaVan)</option>
              <option value="J&T">J&T Express PH</option>
              <option value="Flash">Flash Express</option>
              <option value="NinjaVan">NinjaVan PH</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. 5-STAGE PIPELINE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {TRACKING_STEPS.map((step) => {
          const count = stageCounts[step.key] || 0;
          const isFinal = step.key === 'delivered';
          return (
            <div
              key={step.key}
              className="p-4 rounded-card border bg-surface border-border transition-all flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted uppercase font-bold tracking-wider">
                    Stage 0{step.stepNumber}
                  </span>
                  {isFinal ? (
                    <CheckCircle size={15} className="text-emerald-600" weight="bold" />
                  ) : (
                    <Clock size={15} className="text-muted" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-primary mt-1 tracking-tight">
                  {step.label}
                </h4>
              </div>

              <div>
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {count}
                </span>
                <span className="text-xs text-muted block mt-0.5 font-medium">
                  {isFinal ? 'Completed deliveries' : 'Parcels currently queued'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. ACTIVE DISPATCH QUEUE */}
      <div className="bg-surface border border-border rounded-card p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              Active Dispatch Queue ({filteredActiveOrders.length} Parcels In Pipeline)
            </h3>
          </div>
        </div>

        {filteredActiveOrders.length === 0 ? (
          <div className="py-16 text-center text-muted text-xs">
            All current consignments have reached final delivery or no active shipments match the selected fleet filter.
          </div>
        ) : (
          <div className="divide-y divide-border mt-1">
            {filteredActiveOrders.map(order => {
              const meta = getOrderTrackingMeta(order);
              const action = nextStepMap[order.status];

              return (
                <div
                  key={order.id}
                  className="py-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-canvas/50 px-2 rounded-tight transition-colors"
                >
                  {/* Order & Recipient Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenTrackingModal(order)}
                        className="font-bold text-xs text-primary hover:text-[#C43C30] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Open live tracking preview"
                      >
                        <span>{order.id}</span>
                        <Eye size={13} className="text-muted" />
                      </button>
                      <span className="text-muted text-xs">·</span>
                      <span className="text-xs text-primary font-medium">{order.customer_name}</span>
                      <span className="text-muted text-xs">·</span>
                      <span className="text-xs font-bold text-primary tabular-nums">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted font-medium">
                      <MapPin size={13} className="text-[#C43C30] shrink-0" />
                      <span className="truncate max-w-lg">
                        {order.shipping_address}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted pt-0.5 font-medium">
                      <Truck size={13} className="text-primary shrink-0" />
                      <span className="font-semibold text-primary">{meta.courier}</span>
                      <span>·</span>
                      <span className="text-primary/80">{meta.trackingNumber}</span>
                    </div>
                  </div>

                  {/* Current Hub Beacon & Stage Advancer */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                    <div className="bg-canvas border border-border px-3.5 py-2 rounded-tight text-left sm:text-right">
                      <span className="text-xs uppercase text-muted block font-semibold">
                        Current Hub Connection
                      </span>
                      <span className="text-xs font-bold text-primary block truncate max-w-[220px]">
                        {meta.currentLocation}
                      </span>
                      <span className="text-xs text-muted block capitalize mt-0.5 font-medium">
                        Status: {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {action && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, action.next)}
                          className="h-9 px-4 bg-primary text-canvas rounded-tight text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
                          title={`Advance parcel to ${action.nextLocation}`}
                        >
                          {action.label}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenTrackingModal(order)}
                        className="h-9 px-3 bg-canvas hover:bg-surface border border-border rounded-tight text-xs font-medium text-primary transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye size={14} />
                        <span>Tracking</span>
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
