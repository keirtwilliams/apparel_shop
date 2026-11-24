import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Warning, Funnel } from '@phosphor-icons/react';
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
    <div className="space-y-6">
      {/* 3 Shared Interactive Filters (Updating all 4 charts simultaneously) */}
      <div className="p-4 bg-surface border border-border rounded-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Funnel size={14} />
          <span>Interactive Global Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Filter 1: Date Range */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted">Date:</span>
            <div className="flex bg-canvas p-0.5 rounded-input border border-border">
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
                  className={`px-2.5 py-1 rounded-input font-medium transition-colors ${
                    dateFilter === d.value
                      ? 'bg-primary text-canvas'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 2: Category */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-canvas border border-border rounded-input px-2.5 py-1 text-xs text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Footwear">Footwear</option>
            </select>
          </div>

          {/* Filter 3: Order Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-canvas border border-border rounded-input px-2.5 py-1 text-xs text-primary focus:outline-none focus:border-primary cursor-pointer"
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-canvas border border-border rounded-card p-4">
          <span className="text-xs text-muted uppercase font-medium">Net Realized Revenue</span>
          <div className="text-2xl font-bold text-primary mt-1 tabular-nums">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[11px] text-success mt-1 block">
            {activeOrdersCount} paid consignments
          </span>
        </div>

        <div className="bg-canvas border border-border rounded-card p-4">
          <span className="text-xs text-muted uppercase font-medium">Orders Count</span>
          <div className="text-2xl font-bold text-primary mt-1 tabular-nums">
            {filteredOrders.length}
          </div>
          <span className="text-[11px] text-muted mt-1 block">
            Avg {formatCurrency(totalRevenue / (activeOrdersCount || 1))} / order
          </span>
        </div>

        <div
          onClick={() => onNavigateToTab && onNavigateToTab('inventory')}
          className="bg-canvas border border-border rounded-card p-4 cursor-pointer hover:border-danger/50 transition-colors group"
          title="Click to view low stock items in Inventory tab"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted uppercase font-medium group-hover:text-danger transition-colors">
              Low-Stock Variants
            </span>
            <span className="text-[10px] text-muted font-mono group-hover:underline">View →</span>
          </div>
          <div className="text-2xl font-bold text-danger mt-1 tabular-nums">
            {lowStockVariants.length}
          </div>
          <span className="text-[11px] text-danger mt-1 block">
            Stock count ≤ 5 units
          </span>
        </div>

        <div className="bg-canvas border border-border rounded-card p-4">
          <span className="text-xs text-muted uppercase font-medium">Refunded Volume</span>
          <div className="text-2xl font-bold text-muted mt-1 tabular-nums">
            {formatCurrency(totalRefundedAmount)}
          </div>
          <span className="text-[11px] text-muted mt-1 block">
            Auto-restored to inventory
          </span>
        </div>
      </div>

      {/* Real-time Low-Stock Alerts Banner */}
      {lowStockVariants.length > 0 && (
        <div className="bg-danger-light border border-danger/30 rounded-card p-4">
          <div className="flex items-center justify-between pb-2 border-b border-danger/20">
            <div className="flex items-center gap-2 text-danger">
              <Warning size={18} weight="bold" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Real-Time Low-Stock Inventory Alerts ({lowStockVariants.length} Variants Flagged)
              </span>
            </div>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('inventory')}
                className="text-[11px] font-mono text-danger hover:underline font-semibold"
              >
                Manage Inventory →
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {lowStockVariants.slice(0, 8).map(v => (
              <div
                key={v.variantId}
                className="bg-canvas p-2.5 rounded-input border border-border text-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] text-muted uppercase font-medium block">
                    {v.category}
                  </span>
                  <span className="font-semibold text-primary truncate block">
                    {v.productName}
                  </span>
                  <span className="text-muted text-[11px]">
                    {v.colorName} · Size {v.size}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted">Available:</span>
                  <span className="font-bold text-danger tabular-nums">
                    {v.stockCount === 0 ? 'SOLD OUT' : `${v.stockCount} units`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 RECHARTS ANALYTICS GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: Revenue Over Time */}
        <div className="bg-canvas border border-border rounded-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                1. Revenue Over Time
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Daily aggregated turnover in PHP
              </p>
            </div>
            <span className="text-xs font-semibold text-primary tabular-nums">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueOverTimeData}>
                <defs>
                  <linearGradient id="purgatoryOverviewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C1C1B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1C1C1B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E4E0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#575654" fontSize={10} tickLine={false} />
                <YAxis stroke="#575654" fontSize={10} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F7',
                    borderColor: '#E5E4E0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#1C1C1B'
                  }}
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1C1C1B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#purgatoryOverviewGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Sales by Category */}
        <div className="bg-canvas border border-border rounded-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                2. Sales by Category
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Volume and total gross sales per segment
              </p>
            </div>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByCategoryData}>
                <CartesianGrid stroke="#E5E4E0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" stroke="#575654" fontSize={10} tickLine={false} />
                <YAxis stroke="#575654" fontSize={10} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F7',
                    borderColor: '#E5E4E0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#1C1C1B'
                  }}
                  formatter={(val, name) => [name === 'revenue' ? formatCurrency(val) : val, name === 'revenue' ? 'Revenue' : 'Units Sold']}
                />
                <Bar dataKey="revenue" fill="#1C1C1B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 3: Order Status Breakdown */}
        <div className="bg-canvas border border-border rounded-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                3. Order Status Breakdown
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Fulfillment pipeline & refund distribution
              </p>
            </div>
          </div>
          <div className="h-64 mt-4 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
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
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#1C1C1B'
                  }}
                  formatter={(val, name) => [`${val} orders`, name]}
                />
                <Legend
                  formatter={(val) => <span style={{ color: '#1C1C1B', fontSize: '11px' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 4: Inventory / Low-Stock Levels */}
        <div className="bg-canvas border border-border rounded-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                4. Variant Inventory Levels
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Units in stock (Red denotes low-stock ≤ 5 units)
              </p>
            </div>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryStockData} layout="vertical">
                <CartesianGrid stroke="#E5E4E0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#575654" fontSize={10} tickLine={false} />
                <YAxis dataKey="shortName" type="category" stroke="#575654" fontSize={9} tickLine={false} width={85} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F7',
                    borderColor: '#E5E4E0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#1C1C1B'
                  }}
                  formatter={(val, _, item) => [`${val} units`, item.payload.name]}
                />
                <Bar dataKey="stock" radius={[0, 3, 3, 0]}>
                  {inventoryStockData.map((entry, index) => (
                    <Cell key={`stock-cell-${index}`} fill={entry.isLow ? '#9E3B33' : '#1C1C1B'} />
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
