import React, { useState } from 'react';
import {
  X, CheckCircle, Clock, Truck, Package,
  Copy, Check, MapPin, ArrowRight
} from '@phosphor-icons/react';
import { getOrderTrackingMeta, TRACKING_STEPS } from '../lib/tracking';
import { formatCurrency } from '../lib/pricing';

export default function ConsignmentTrackingModal({ order, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const tracking = getOrderTrackingMeta(order);
  const statusHierarchy = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStepIndex = statusHierarchy.indexOf(order.status);

  const handleCopy = () => {
    navigator.clipboard.writeText(tracking.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0C0C0B]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-canvas border border-border rounded-card shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-primary" />
            <div>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                Live Consignment Tracking
              </span>
              <span className="text-sm font-bold font-mono text-primary">
                {order.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-input text-muted hover:text-primary hover:bg-canvas transition-colors"
            aria-label="Close tracking"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shopee/SHEIN Active Connection Card */}
        <div className="p-6 bg-canvas border-b border-border">
          <div className="p-4 bg-surface border border-border rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {tracking.currentHeadline}
                </span>
              </div>
              <div className="mt-1 flex items-start gap-1.5 text-xs text-muted">
                <MapPin size={14} className="text-[#C43C30] shrink-0 mt-0.5" />
                <span className="font-medium text-primary/90">
                  {tracking.currentLocation}
                </span>
              </div>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                {tracking.currentDetail}
              </p>
            </div>

            <div className="shrink-0 pt-2 sm:pt-0 sm:border-l sm:border-border sm:pl-4 sm:text-right">
              <span className="text-[10px] font-mono uppercase text-muted tracking-wider block">
                Estimated Delivery
              </span>
              <span className="text-xs font-bold text-primary font-mono block mt-0.5">
                {tracking.estimatedDelivery}
              </span>
            </div>
          </div>

          {/* Courier & Tracking Code Pill */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-surface/50 border border-border/80 px-4 py-2.5 rounded-input">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-primary" />
              <span className="font-semibold text-primary">{tracking.courier}</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-muted">Tracking No:</span>
              <span className="font-bold text-primary">{tracking.trackingNumber}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 hover:text-[#C43C30] transition-colors"
                title="Copy tracking number"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Shopee/SHEIN 5-Stage Stepper Progress Bar */}
          <div className="mt-6 pt-2">
            <div className="relative">
              {/* Connected Background Track */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
              {/* Active Filled Progress Line */}
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
                    <div key={step.key} className="flex flex-col items-center text-center max-w-[80px]">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-primary border-primary text-canvas'
                            : 'bg-canvas border-border text-muted/60'
                        } ${isCurrent ? 'ring-4 ring-primary/20 scale-110 font-bold' : ''}`}
                      >
                        {isDone ? <CheckCircle size={15} weight="bold" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-mono mt-2 leading-tight uppercase tracking-wider ${
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
        </div>

        {/* Detailed Vertical Milestone Timeline (Shopee / SHEIN Style) */}
        <div className="p-6 max-h-[300px] overflow-y-auto">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted block mb-4">
            Consignment Journey Logs
          </span>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-border before:z-0">
            {tracking.timeline.map((entry, idx) => {
              const formattedTime = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
              const formattedDate = new Date(entry.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div key={idx} className="relative flex items-start gap-4 z-10">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      entry.isCurrent
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : 'bg-canvas border-border text-muted/60'
                    }`}
                  >
                    {entry.isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    ) : (
                      <Clock size={12} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4
                        className={`text-xs font-bold ${
                          entry.isCurrent ? 'text-primary' : 'text-muted'
                        }`}
                      >
                        {entry.title}
                      </h4>
                      <span className="text-[10px] font-mono text-muted/80">
                        {formattedDate} · {formattedTime}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-primary/80 mt-0.5">
                      📍 {entry.location}
                    </p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-between text-xs">
          <div className="text-muted">
            Destination: <span className="text-primary font-medium">{order.shipping_address}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
