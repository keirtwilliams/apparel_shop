import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DownloadSimple, CheckCircle, ArrowRight, Package, Truck, Clock, MapPin } from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { brandConfig } from '../config/brand';
import { formatCurrency } from '../lib/pricing';
import { downloadReceiptImage } from '../lib/exportUtils';
import { getOrderTrackingMeta, TRACKING_STEPS } from '../lib/tracking';
import ConsignmentTrackingModal from '../components/ConsignmentTrackingModal';

export default function ReceiptPage() {
  const { orderId } = useParams();
  const { orders } = useStore();
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-semibold text-primary">Receipt Not Found</h2>
        <p className="text-xs text-muted mt-1">The requested order confirmation cannot be retrieved.</p>
        <Link
          to="/"
          className="mt-4 inline-block px-5 py-2.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const handleDownload = () => {
    downloadReceiptImage(order);
  };

  const steps = [
    { label: 'Order Confirmed', status: 'completed' },
    { 
      label: 'Dispatch & Packing', 
      status: order.status === 'shipped' || order.status === 'delivered' ? 'completed' : 'active' 
    },
    { 
      label: 'Delivered', 
      status: order.status === 'delivered' ? 'completed' : 'pending' 
    }
  ];

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top action bar (hidden during print) */}
      <div className="flex items-center justify-between pb-6 border-b border-border print:hidden">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle size={20} weight="fill" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Order Successfully Placed
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-input border border-border bg-surface text-primary hover:bg-canvas text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[36px]"
            title="Download receipt as high-resolution PNG image"
          >
            <DownloadSimple size={15} />
            <span>Download Receipt (PNG)</span>
          </button>
          <Link
            to="/orders"
            className="px-3.5 py-1.5 rounded-input bg-primary text-canvas text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity min-h-[36px]"
          >
            <span>View All Orders</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-canvas border border-border rounded-card p-6 sm:p-8 mt-6 print:border-none print:p-0 print:m-0">
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-border gap-4">
          <div>
            <div className="flex items-center">
              <img
                src={brandConfig.logoName}
                alt="Purgatory"
                className="h-8 w-auto object-contain filter invert"
              />
            </div>
            <p className="text-xs text-muted mt-2 font-mono">
              {brandConfig.collection} — OFFICIAL CONSIGNMENT INVOICE
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-muted font-medium">
              Tax Invoice / Receipt
            </span>
            <div className="text-sm font-semibold font-mono text-primary mt-0.5">
              {order.id}
            </div>
            <div className="text-xs text-muted mt-1 tabular-nums">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Live Status Tracker (Shopee / SHEIN Stepped Journey) */}
        <div className="py-6 border-b border-border print:hidden space-y-4">
          {(() => {
            const tracking = getOrderTrackingMeta(order);
            const statusHierarchy = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
            const currentStepIndex = statusHierarchy.indexOf(order.status);

            return (
              <>
                {/* Shopee / SHEIN Live Connection Badge */}
                <div className="p-3.5 bg-surface border border-border rounded-input flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                        Current Hub Connection:
                      </span>
                      <span className="font-bold text-primary">
                        {tracking.currentLocation}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed pl-4">
                      {tracking.currentDetail}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTrackingOpen(true)}
                    className="px-3 py-1.5 bg-canvas hover:bg-surface border border-border rounded-tight text-xs font-semibold text-primary transition-colors shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <Truck size={14} />
                    <span>View Journey Logs</span>
                  </button>
                </div>

                {/* 5-Stage Stepper Track */}
                <div className="pt-2">
                  <div className="relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-4 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 z-0"
                      style={{
                        width: `${Math.max(0, Math.min(100, (currentStepIndex / (statusHierarchy.length - 1)) * 100))}%`
                      }}
                    />

                    <div className="relative flex justify-between z-10">
                      {TRACKING_STEPS.map((step, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center max-w-[70px]">
                            <div
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                                isDone
                                  ? 'bg-primary border-primary text-canvas'
                                  : 'bg-canvas border-border text-muted/60'
                              } ${isCurrent ? 'ring-3 ring-primary/20 scale-105 font-bold' : ''}`}
                            >
                              {isDone ? <CheckCircle size={13} weight="bold" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[9px] font-mono mt-1.5 leading-tight uppercase tracking-wider ${
                                isDone ? 'font-bold text-primary' : 'text-muted/60'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Customer & Shipping Summary */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-border text-xs">
          <div>
            <span className="text-muted font-medium uppercase tracking-wider text-[10px]">
              Customer Information
            </span>
            <p className="font-semibold text-primary mt-1">{order.customer_name}</p>
            <p className="text-muted mt-0.5">{order.customer_email}</p>
          </div>

          <div>
            <span className="text-muted font-medium uppercase tracking-wider text-[10px]">
              Delivery Destination & Payment
            </span>
            <p className="text-primary mt-1 leading-snug">{order.shipping_address}</p>
            <p className="text-muted mt-1 uppercase font-medium">
              Payment Method: <span className="text-primary font-semibold">{order.payment_method}</span> ({order.payment_status})
            </p>
          </div>
        </div>

        {/* Itemized Garment List */}
        <div className="py-6 border-b border-border">
          <span className="text-muted font-medium uppercase tracking-wider text-[10px] block mb-3">
            Purchased Pieces
          </span>
          <table className="w-full text-left text-xs">
            <thead className="text-muted border-b border-border pb-2">
              <tr>
                <th className="font-medium pb-2">Garment</th>
                <th className="font-medium pb-2 text-center">Specs</th>
                <th className="font-medium pb-2 text-center">Qty</th>
                <th className="font-medium pb-2 text-right">Price</th>
                <th className="font-medium pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {order.items?.map(item => (
                <tr key={item.id} className="py-2.5">
                  <td className="py-2.5 font-medium text-primary">
                    {item.product_name || 'Architectural Garment'}
                  </td>
                  <td className="py-2.5 text-center text-muted">
                    {item.color_name} / {item.size}
                  </td>
                  <td className="py-2.5 text-center text-muted">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 text-right text-muted">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-primary">
                    {formatCurrency(Number(item.unit_price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="pt-6 flex justify-end">
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-medium text-primary tabular-nums">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Express Delivery</span>
              <span className="text-success font-medium">Complimentary</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between text-sm">
              <span className="font-semibold text-primary">Total Paid</span>
              <span className="font-bold text-primary tabular-nums">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-border text-[11px] text-muted text-center leading-relaxed font-mono">
          PURGATORY WORLDWIDE — FALLING FLAMES DIVISION. EACH GARMENT IS CRAFTED WITH ZERO COMPROMISE.
          FOR RETURNS OR ARCHIVAL INQUIRIES: <span className="text-primary font-semibold">CONCIERGE@PURGATORY.LA</span> (REF: {order.id})
        </div>
      </div>

      {/* Shopee / SHEIN Live Consignment Journey Modal */}
      <ConsignmentTrackingModal
        order={order}
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />
    </div>
  );
}
