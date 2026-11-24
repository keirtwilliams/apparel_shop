import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ArrowRight, LockKey,
  User, CheckCircle, Warning, Clock, Truck, MapPin
} from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../lib/pricing';
import { getOrderTrackingMeta } from '../lib/tracking';
import ConsignmentTrackingModal from '../components/ConsignmentTrackingModal';

export default function AccountOrdersPage() {
  const { userOrders, currentUser, setIsAccountDrawerOpen } = useStore();
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);

  const statusColors = {
    pending: 'bg-surface text-primary border-border',
    shipped: 'bg-surface-subtle text-primary border-primary',
    delivered: 'bg-success-light text-success border-success/30',
    refunded: 'bg-danger-light text-danger border-danger/30'
  };

  const statusIcons = {
    pending: <Clock size={14} className="text-muted" />,
    shipped: <Truck size={14} className="text-primary" />,
    delivered: <CheckCircle size={14} className="text-success" />,
    refunded: <Warning size={14} className="text-danger" />
  };

  // 1. UNCOMMITTED / GUEST STATE: Strictly zero orders visible
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center font-sans">
        <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-primary mx-auto mb-4">
          <LockKey size={26} />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted">
          Restricted Client Area
        </span>
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-primary mt-2">
          Sign In to View Orders
        </h1>
        <p className="text-xs text-muted mt-2 leading-relaxed">
          Consignment history and live dispatch tracking are restricted to verified client accounts. Please sign in or register to access your orders.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setIsAccountDrawerOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center gap-2"
          >
            <User size={15} />
            <span>Sign In to Account</span>
          </button>
          <Link
            to="/catalogue"
            className="w-full sm:w-auto px-5 py-3 bg-surface hover:bg-surface-subtle border border-border text-xs font-semibold uppercase tracking-wider text-primary rounded-tight transition-colors min-h-[44px] flex items-center justify-center"
          >
            Browse Catalogue
          </Link>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED STATE: Scoped strictly to logged-in user's orders
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans">
      {/* Top Header */}
      <div className="pb-6 border-b border-border">
        <div>
          <span className="text-xs uppercase tracking-widest text-muted font-medium font-mono">
            Client Consignments
          </span>
          <h1 className="text-2xl font-semibold text-primary mt-1">
            Order Tracking & History
          </h1>
          <p className="text-xs text-muted mt-1">
            Displaying verified consignments for{' '}
            <span className="text-primary font-medium">{currentUser.full_name}</span> ({currentUser.email}).
          </p>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="mt-8">
        {userOrders.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-card bg-surface/40">
            <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-muted mx-auto mb-3">
              <Package size={22} />
            </div>
            <h3 className="text-sm font-semibold text-primary">No Consignments Placed Yet</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              You haven't placed an order with this account yet. When you complete checkout, real-time consignment tracking will appear here.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                to="/catalogue"
                className="px-5 py-2.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 transition-opacity"
              >
                Explore Catalogue
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map(order => {
              const tracking = getOrderTrackingMeta(order);
              const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={order.id}
                  className="bg-canvas border border-border rounded-card p-5 hover:border-primary/50 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-bold text-primary">{order.id}</span>
                      <span className="text-muted">·</span>
                      <span className="text-muted tabular-nums">{formattedDate}</span>
                      <span className="text-muted">·</span>
                      <span className="text-muted">{order.customer_name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-input text-[11px] font-semibold uppercase tracking-wider border ${
                          statusColors[order.status] || 'bg-surface text-primary'
                        }`}
                      >
                        {statusIcons[order.status] || <Clock size={14} className="text-muted" />}
                        <span>{order.status?.replace(/_/g, ' ')}</span>
                      </span>
                      <span className="font-mono font-bold text-primary tabular-nums">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Shopee / SHEIN Live Location Callout */}
                  <div className="py-2.5 px-3 bg-surface/70 border border-border/80 rounded-input flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-muted text-[11px] font-mono">Location:</span>
                      <span className="font-semibold text-primary truncate max-w-[280px] sm:max-w-none">
                        {tracking.currentLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
                      <span>{tracking.courier}</span>
                      <span>·</span>
                      <span className="font-bold text-primary">{tracking.trackingNumber}</span>
                    </div>
                  </div>

                  {/* Items preview & actions */}
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      {order.items?.map(it => (
                        <p key={it.id} className="text-muted">
                          <span className="text-primary font-medium">{it.quantity}x</span> {it.product_name}
                          <span className="text-muted/70"> ({it.color_name} · Size {it.size})</span>
                        </p>
                      ))}
                      {order.shipping_address && (
                        <p className="text-[11px] text-muted/80 font-mono pt-1">
                          Destination: {order.shipping_address}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedTrackingOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-canvas rounded-input text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity min-h-[36px]"
                      >
                        <Truck size={14} />
                        <span>Live Tracking</span>
                      </button>

                      <Link
                        to={`/receipt/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-canvas border border-border rounded-input text-xs font-semibold text-primary transition-colors min-h-[36px]"
                      >
                        <span>Receipt</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Consignment Tracking Modal (Shopee / SHEIN Stepper) */}
      <ConsignmentTrackingModal
        order={selectedTrackingOrder}
        isOpen={Boolean(selectedTrackingOrder)}
        onClose={() => setSelectedTrackingOrder(null)}
      />
    </div>
  );
}
