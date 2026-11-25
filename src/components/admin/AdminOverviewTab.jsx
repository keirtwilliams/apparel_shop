import React from 'react';
import {
  TrendUp, ShoppingBag, Warning, ArrowDownRight,
  ArrowRight, Sparkle
} from '@phosphor-icons/react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { formatCurrency } from '../../lib/pricing';

export default function AdminOverviewTab({
  dateFilter,
  setDateFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  totalRevenue,
  activeOrdersCount,
  filteredOrders,
  lowStockVariants,
  totalRefundedAmount,
  revenueOverTimeData,
  salesByCategoryData,
  orderStatusData,
  inventoryStockData,
  onNavigateToTab
}) {
  return (
    <div className="space-y-6 font-sans">
      {/* 1. GLOBAL FILTER TOOLBAR */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted font-bold block">
            Executive Controls
          </span>
          <span className="text-sm font-bold text-primary tracking-tight">
            Telemetry Scope & Cohorts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-3">
          {/* Filter 1: Date Range */}
          <div className="grid grid-cols-4 sm:flex items-center gap-1 bg-canvas p-1 rounded-tight border border-border">
            {[
              { label: '7D', value: '7' },
              { label: '14D', value: '14' },
              { label: '30D', value: '30' },
              { label: 'All', value: 'all' },
            ].map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDateFilter(d.value)}
                className={`px-3 py-1.5 sm:py-1 rounded-tight text-xs font-semibold transition-all cursor-pointer text-center ${
                  dateFilter === d.value
                    ? 'bg-primary text-canvas font-bold shadow-xs'
                    : 'text-muted hover:text-primary hover:bg-surface'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Filter 2: Category Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-muted text-xs font-semibold uppercase shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-canvas border border-border rounded-tight px-3 py-1.5 text-xs text-primary focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Footwear">Footwear</option>
            </select>
          </div>

          {/* Filter 3: Order Status Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-muted text-xs font-semibold uppercase shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-canvas border border-border rounded-tight px-3 py-1.5 text-xs text-primary focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Atelier Packed</option>
              <option value="shipped">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE PERFORMANCE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Net Realized Revenue */}
        <div className="bg-surface border border-border rounded-card p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs uppercase tracking-wider font-bold">
              Net Realized Turnover
            </span>
            <div className="w-7 h-7 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary">
              <TrendUp size={14} weight="bold" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary tabular-nums tracking-tight">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
        </div>

        {/* Consignments Count */}
        <div className="bg-surface border border-border rounded-card p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs uppercase tracking-wider font-bold">
              Consignments Volume
            </span>
            <div className="w-7 h-7 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary">
              <ShoppingBag size={14} weight="bold" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary tabular-nums tracking-tight">
              {filteredOrders.length}
            </div>
          </div>
        </div>

        {/* Low-Stock Variants Flagged */}
        <div
          onClick={() => onNavigateToTab && onNavigateToTab('inventory')}
          className="bg-surface border border-border hover:border-danger/50 rounded-card p-5 sm:p-6 flex flex-col justify-between shadow-2xs cursor-pointer transition-all group"
          title="Click to view and adjust flagged stock in Inventory Matrix"
        >
          <div className="flex items-center justify-between text-muted group-hover:text-danger transition-colors">
            <span className="text-xs uppercase tracking-wider font-bold">
              Running Low
            </span>
            <span className="text-xs text-muted font-semibold flex items-center gap-1 group-hover:text-danger group-hover:underline">
              Restock →
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-danger tabular-nums tracking-tight">
              {lowStockVariants.length}
            </div>
            <div className="text-xs text-danger mt-2 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
              <span>5 or fewer left in stock</span>
            </div>
          </div>
        </div>

        {/* Refund Volume */}
        <div className="bg-surface border border-border rounded-card p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs uppercase tracking-wider font-bold">
              Restored & Refunded
            </span>
            <div className="w-7 h-7 rounded-tight bg-canvas border border-border flex items-center justify-center text-muted">
              <ArrowDownRight size={14} weight="bold" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-muted tabular-nums tracking-tight">
              {formatCurrency(totalRefundedAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. REAL-TIME LOW-STOCK TELEMETRY TICKER */}
      {lowStockVariants.length > 0 && (
        <div className="bg-danger-light/50 border border-danger/30 rounded-card p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-danger/20 gap-3">
            <div className="flex items-center gap-2.5 text-danger">
              <Warning size={18} weight="bold" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Real-Time Stock Alerts ({lowStockVariants.length} Variants Flagged)
              </span>
            </div>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('inventory')}
                className="text-xs font-semibold uppercase tracking-wider text-danger hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Inventory Matrix</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {lowStockVariants.slice(0, 8).map(v => (
              <div
                key={v.variantId}
                className="bg-surface p-3 rounded-tight border border-border text-xs flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">
                    {v.category}
                  </span>
                  <span className="font-semibold text-primary truncate block mt-0.5">
                    {v.productName}
                  </span>
                  <span className="text-muted text-xs block mt-0.5 font-medium">
                    {v.colorName} · Size {v.size}
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-muted">Available:</span>
                  <span className="font-bold text-danger tabular-nums">
                    {v.stockCount === 0 ? 'SOLD OUT' : `${v.stockCount} units`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RECHARTS ANALYTICAL MODELS (2x2 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* GRAPH 1: Revenue Over Time */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted font-bold block">
                Financial Velocity
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mt-0.5">
                1. Turnover Over Time
              </h3>
            </div>
            <span className="text-xs font-bold text-primary tabular-nums bg-canvas px-2.5 py-1 rounded-tight border border-border">
              {formatCurrency(totalRevenue)}
            </span>
          </div>

          <div className="h-64 mt-6 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueOverTimeData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="purgatoryOverviewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C43C30" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#C43C30" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E4E0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#82807A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#82807A"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => (v >= 1000 ? `₱${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `₱${v}`)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F7',
                    borderColor: '#E5E4E0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#0C0C0B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C43C30"
                  strokeWidth={2.25}
                  activeDot={{ r: 4, fill: '#C43C30', stroke: '#FAF9F7', strokeWidth: 2 }}
                  fillOpacity={1}
                  fill="url(#purgatoryOverviewGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Sales by Category */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted font-bold block">
                Category Segments
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mt-0.5">
                2. Sales by Division
              </h3>
            </div>
            <span className="text-xs font-semibold text-muted uppercase">Gross Sales & Volume</span>
          </div>

          <div className="h-64 mt-6 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByCategoryData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#E5E4E0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" stroke="#82807A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#82807A"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => (v >= 1000 ? `₱${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `₱${v}`)}
                />
                <Tooltip
                  cursor={{ fill: '#E5E4E0', opacity: 0.35 }}
                  contentStyle={{
                    backgroundColor: '#FAF9F7',
                    borderColor: '#E5E4E0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#0C0C0B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                  formatter={(val, name) => [name === 'revenue' ? formatCurrency(val) : val, name === 'revenue' ? 'Revenue' : 'Units Sold']}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  {salesByCategoryData.map((_, index) => {
                    const palette = ['#0C0C0B', '#C43C30', '#52525B', '#8B847A'];
                    return <Cell key={`cat-cell-${index}`} fill={palette[index % palette.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 3: Order Status Breakdown */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted font-bold block">
                Fulfillment Distribution
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mt-0.5">
                3. Order Status Breakdown
              </h3>
            </div>
            <span className="text-xs font-semibold text-muted uppercase">Lifecycle Distribution</span>
          </div>

          <div className="h-64 mt-6 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="46%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F7',
                    borderColor: '#E5E4E0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#0C0C0B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                  formatter={(val, name) => [`${val} orders`, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: '8px' }}
                  formatter={(val) => <span style={{ color: '#0C0C0B', fontSize: '11px', fontWeight: '600' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 4: Inventory / Low-Stock Levels */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted font-bold block">
                Warehouse Stock Matrix
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mt-0.5">
                4. Variant Inventory Levels
              </h3>
            </div>
            <span className="text-xs text-danger font-semibold uppercase">
              5 or fewer left flagged in red
            </span>
          </div>

          <div className="h-64 mt-6 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryStockData} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E5E4E0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#82807A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="shortName" type="category" stroke="#0C0C0B" fontSize={10} tickLine={false} axisLine={false} width={88} />
                <Tooltip
                  cursor={{ fill: '#E5E4E0', opacity: 0.35 }}
                  contentStyle={{
                    backgroundColor: '#FAF9F7',
                    borderColor: '#E5E4E0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#0C0C0B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                  formatter={(val, _, item) => [`${val} units`, item.payload.name]}
                />
                <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={14}>
                  {inventoryStockData.map((entry, index) => (
                    <Cell key={`stock-cell-${index}`} fill={entry.isLow ? '#C43C30' : '#2E5A44'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
