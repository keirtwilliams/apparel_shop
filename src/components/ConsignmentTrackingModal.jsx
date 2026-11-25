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
      <div className="relative w-full max-w-2xl bg-canvas border border-border rounded-card shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 font-sans">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package size={18} weight="bold" className="text-primary" />
            <span className="text-sm font-bold text-primary tracking-tight">
              {order.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-input text-muted hover:text-primary hover:bg-canvas transition-colors cursor-pointer"
            aria-label="Close tracking"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Active Connection Card */}
        <div className="p-4 sm:p-6 bg-canvas border-b border-border">
          <div className="p-4 bg-surface border border-border rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                {tracking.currentHeadline}
              </span>
              <div className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
                <MapPin size={14} weight="bold" className="text-[#C43C30] shrink-0 mt-0.5" />
                <span className="font-semibold text-primary">
                  {tracking.currentLocation}
                </span>
              </div>
              <p className="text-xs text-muted font-medium mt-1 leading-relaxed">
                {tracking.currentDetail}
              </p>
            </div>

            <div className="shrink-0 pt-2 sm:pt-0 sm:border-l sm:border-border sm:pl-4 sm:text-right">
              <span className="text-[11px] font-bold uppercase text-muted tracking-wider block">
                Estimated Delivery
              </span>
              <span className="text-xs font-bold text-primary block mt-0.5">
                {tracking.estimatedDelivery}
              </span>
            </div>
          </div>

          {/* Courier & Tracking Code Pill */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-surface/50 border border-border/80 px-4 py-2.5 rounded-input">
            <div className="flex items-center gap-2">
              <Truck size={16} weight="bold" className="text-primary" />
              <span className="font-bold text-primary">{tracking.courier}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted font-medium">Tracking No:</span>
              <span className="font-bold text-primary tabular-nums">{tracking.trackingNumber}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 hover:text-[#C43C30] transition-colors cursor-pointer"
                title="Copy tracking number"
              >
                {copied ? <Check size={13} weight="bold" className="text-emerald-600" /> : <Copy size={13} weight="bold" />}
              </button>
            </div>
          </div>

          {/* 5-Stage Stepper Progress Bar */}
          <div className="mt-6 pt-2">
            <div className="relative">
              {/* Track spanning strictly from center of Step 1 (10%) to center of Step 5 (90%) */}
              <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-border -translate-y-1/2 z-0">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, (currentStepIndex / (statusHierarchy.length - 1)) * 100))}%`
                  }}
                />
              </div>

              <div className="relative grid grid-cols-5 z-10">
                {TRACKING_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center px-1">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold ${
                          isDone
                            ? 'bg-primary border-primary text-canvas'
                            : 'bg-canvas border-border text-muted/60'
                        } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                      >
                        {isDone ? <CheckCircle size={15} weight="bold" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] mt-2 leading-tight uppercase tracking-wider ${
                          isDone ? 'font-bold text-primary' : 'font-semibold text-muted/60'
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

        {/* Detailed Vertical Milestone Timeline */}
        <div className="p-4 sm:p-6 max-h-[300px] overflow-y-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-4">
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
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-canvas border-border text-muted/60'
                    }`}
                  >
                    {entry.isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    ) : (
                      <Clock size={12} weight="bold" />
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
                      <span className="text-[11px] font-semibold text-muted tabular-nums">
                        {formattedDate} · {formattedTime}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary/90 mt-0.5">
                      {entry.location}
                    </p>
                    <p className="text-xs text-muted font-medium mt-1 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 bg-surface border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-muted font-medium">
            Destination: <span className="text-primary font-semibold">{order.shipping_address}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 transition-opacity cursor-pointer self-end sm:self-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
