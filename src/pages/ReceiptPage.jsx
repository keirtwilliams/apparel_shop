import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, CheckCircle, ArrowRight, Package, Truck, Clock } from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { brandConfig } from '../config/brand';

export default function ReceiptPage() {
  const { orderId } = useParams();
  const { orders } = useStore();

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

  const handlePrint = () => {
    window.print();
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
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-input border border-border bg-surface text-primary hover:bg-canvas text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[36px]"
          >
            <Printer size={15} />
            <span>Print Receipt</span>
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

        {/* Live Status Tracker (Stepped) */}
        <div className="py-6 border-b border-border print:hidden">
          <div className="flex items-center justify-between text-xs font-medium mb-3">
            <span className="text-muted">Fulfillment Tracking:</span>
            <span className={`px-2 py-0.5 rounded-input uppercase text-[10px] tracking-wider font-semibold ${
              order.status === 'refunded'
                ? 'bg-danger-light text-danger'
                : order.status === 'delivered'
                ? 'bg-success-light text-success'
                : 'bg-surface text-primary'
            }`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {steps.map((st, i) => (
              <div
                key={st.label}
                className={`p-2.5 rounded-tight border text-xs flex flex-col gap-1 ${
                  st.status === 'completed'
                    ? 'bg-surface border-primary text-primary'
                    : st.status === 'active'
                    ? 'bg-surface border-border text-primary'
                    : 'bg-canvas border-border text-muted/60'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold text-muted">
                  Step 0{i + 1}
                </span>
                <span className="font-medium truncate">{st.label}</span>
              </div>
            ))}
          </div>
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
                    ${Number(item.unit_price).toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-primary">
                    ${(Number(item.unit_price) * item.quantity).toFixed(2)}
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
                ${Number(order.total_amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Express Delivery</span>
              <span className="text-success font-medium">Complimentary</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between text-sm">
              <span className="font-semibold text-primary">Total Paid</span>
              <span className="font-bold text-primary tabular-nums">
                ${Number(order.total_amount).toFixed(2)}
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
    </div>
  );
}
