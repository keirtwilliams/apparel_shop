import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  DownloadSimple, Warning, ArrowClockwise, Plus,
  ArrowCounterClockwise, Check, CaretDown, Funnel, Trash
} from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { exportToCSV, exportToXLSX, exportToXML, exportToTSV } from '../lib/exportUtils';

export default function AdminDashboardPage() {
  const {
    orders,
    products,
    refundOrder,
    updateOrderStatus,
    lowStockVariants,
    resetToSeedData
  } = useStore();

  // 3 Shared Interactive Filters
  const [dateFilter, setDateFilter] = useState('30'); // '7' | '14' | '30' | 'all'
  const [categoryFilter, setCategoryFilter] = useState('All'); // 'All' | 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'delivered' | 'shipped' | 'pending' | 'refunded'

  // Export dropdown state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState('');

  // Filtered Orders Dataset (Linked across all 4 charts + exports)
  const filteredOrders = useMemo(() => {
    const now = new Date('2026-11-23T23:59:59Z');
    const daysLimit = dateFilter === 'all' ? Infinity : parseInt(dateFilter, 10);
    const cutoffDate = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);

    return orders.filter(order => {
      // 1. Date filter
      const orderDate = new Date(order.created_at);
      if (dateFilter !== 'all' && orderDate < cutoffDate) {
        return false;
      }

      // 2. Status filter
      if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }

      // 3. Category filter (check if order contains any item in category)
      if (categoryFilter !== 'All') {
        const hasCategoryItem = order.items?.some(it => it.category === categoryFilter);
        if (!hasCategoryItem) return false;
      }

      return true;
    });
  }, [orders, dateFilter, statusFilter, categoryFilter]);

  // Overall KPI Metrics
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.status !== 'refunded')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
  }, [filteredOrders]);

  const totalRefundedAmount = useMemo(() => {
    return filteredOrders
      .filter(o => o.status === 'refunded')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
  }, [filteredOrders]);

  const activeOrdersCount = useMemo(() => {
    return filteredOrders.filter(o => o.status !== 'refunded').length;
  }, [filteredOrders]);

  // CHART 1: Revenue & Order Volume Over Time
  const revenueOverTimeData = useMemo(() => {
    const dayMap = {};
    filteredOrders.forEach(o => {
      const day = new Date(o.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      if (!dayMap[day]) {
        dayMap[day] = { date: day, revenue: 0, orders: 0, rawDate: new Date(o.created_at) };
      }
      if (o.status !== 'refunded') {
        dayMap[day].revenue += Number(o.total_amount);
      }
      dayMap[day].orders += 1;
    });

    return Object.values(dayMap).sort((a, b) => a.rawDate - b.rawDate);
  }, [filteredOrders]);

  // CHART 2: Sales by Category
  const salesByCategoryData = useMemo(() => {
    const categories = ['Tops', 'Bottoms', 'Outerwear', 'Footwear'];
    const map = {
      Tops: { category: 'Tops', revenue: 0, units: 0 },
      Bottoms: { category: 'Bottoms', revenue: 0, units: 0 },
      Outerwear: { category: 'Outerwear', revenue: 0, units: 0 },
      Footwear: { category: 'Footwear', revenue: 0, units: 0 },
    };

    filteredOrders.forEach(order => {
      if (order.status === 'refunded') return;
      order.items?.forEach(item => {
        const cat = item.category || 'Tops';
        if (map[cat]) {
          map[cat].revenue += Number(item.unit_price) * item.quantity;
          map[cat].units += item.quantity;
        }
      });
    });

    return categories.map(c => map[c]);
  }, [filteredOrders]);

  // CHART 3: Order Status Breakdown
  const orderStatusData = useMemo(() => {
    const counts = { delivered: 0, shipped: 0, pending: 0, refunded: 0 };
    filteredOrders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status] += 1;
      }
    });

    return [
      { name: 'Delivered', value: counts.delivered, color: '#2E5A44' }, // Success green
      { name: 'Shipped', value: counts.shipped, color: '#575654' },   // Muted
      { name: 'Pending', value: counts.pending, color: '#8B847A' },   // Taupe
      { name: 'Refunded', value: counts.refunded, color: '#9E3B33' }, // Danger red
    ].filter(item => item.value > 0);
  }, [filteredOrders]);

  // CHART 4: Inventory / Low-Stock Levels
  const inventoryStockData = useMemo(() => {
    const list = [];
    products.forEach(p => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return;
      p.variants?.forEach(v => {
        list.push({
          name: `${p.name.split(' ')[0]} ${v.size} (${v.color_name})`,
          shortName: `${p.name.slice(0, 10)}.. ${v.size}`,
          stock: v.stock_count,
          category: p.category,
          isLow: v.stock_count <= 5
        });
      });
    });
    // Sort so lowest stock appears first for operational priority
    return list.sort((a, b) => a.stock - b.stock).slice(0, 12);
  }, [products, categoryFilter]);

  // Prepare Exportable Flat Records
  const exportableData = useMemo(() => {
    return filteredOrders.map(order => ({
      order_id: order.id,
      date: new Date(order.created_at).toISOString().split('T')[0],
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      fulfillment_status: order.status,
      items_count: order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0,
      total_amount: Number(order.total_amount).toFixed(2),
      shipping_address: order.shipping_address
    }));
  }, [filteredOrders]);

  // Handle Client-Side Exports
  const handleExport = async (format) => {
    setIsExportOpen(false);
    const filename = `purgatory-sales-filtered-${dateFilter}d-${categoryFilter.toLowerCase()}.${format}`;

    try {
      if (format === 'csv') {
        exportToCSV(exportableData, filename);
      } else if (format === 'xlsx') {
        await exportToXLSX(exportableData, filename);
      } else if (format === 'tsv') {
        exportToTSV(exportableData, filename);
      } else if (format === 'xml') {
        exportToXML(exportableData, 'PurgatorySales', 'OrderRecord', filename);
      }
      setExportNotice(`Exported ${exportableData.length} records as ${format.toUpperCase()}`);
      setTimeout(() => setExportNotice(''), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header & Operational Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted font-medium">
              Enterprise Operations
            </span>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-medium">Live Supabase Sync Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary mt-1">
            Admin Sales & Inventory Intelligence
          </h1>
          <p className="text-xs text-muted mt-1">
            Recharts analytics, real-time stock decrements, multi-format export & refund automation.
          </p>
        </div>

        {/* Action Buttons: Export & Reset */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Data Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="px-3.5 py-2 rounded-input bg-surface border border-border text-primary hover:bg-canvas text-xs font-semibold flex items-center gap-2 transition-colors min-h-[38px]"
            >
              <DownloadSimple size={15} />
              <span>Export Dataset</span>
              <CaretDown size={12} />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-canvas border border-border rounded-card shadow-lg py-1 z-30 text-xs">
                <div className="px-3 py-1.5 font-semibold text-muted border-b border-border text-[10px] uppercase">
                  Select Format ({exportableData.length} rows)
                </div>
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full text-left px-3 py-2 hover:bg-surface text-primary flex items-center justify-between"
                >
                  <span>Excel (.xlsx)</span>
                  <span className="text-[10px] text-muted">write-excel-file</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-3 py-2 hover:bg-surface text-primary flex items-center justify-between"
                >
                  <span>Comma-Separated (.csv)</span>
                  <span className="text-[10px] text-muted">Blob</span>
                </button>
                <button
                  onClick={() => handleExport('tsv')}
                  className="w-full text-left px-3 py-2 hover:bg-surface text-primary flex items-center justify-between"
                >
                  <span>Tab-Separated (.tsv)</span>
                  <span className="text-[10px] text-muted">Blob</span>
                </button>
                <button
                  onClick={() => handleExport('xml')}
                  className="w-full text-left px-3 py-2 hover:bg-surface text-primary flex items-center justify-between"
                >
                  <span>XML Schema (.xml)</span>
                  <span className="text-[10px] text-muted">Blob</span>
                </button>
              </div>
            )}
          </div>

          {/* Reset Demo State to Initial Seed */}
          <button
            onClick={resetToSeedData}
            title="Reset to 46 synthetic seed orders & clean stock"
            className="p-2 rounded-input bg-surface border border-border text-muted hover:text-primary transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <ArrowCounterClockwise size={15} />
          </button>
        </div>
      </div>

      {/* Export notification banner */}
      {exportNotice && (
        <div className="mt-4 p-3 bg-success-light border border-success/30 rounded-input text-xs text-success flex items-center gap-2 animate-in fade-in">
          <Check size={14} weight="bold" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 3 Shared Interactive Filters (Updating all 4 charts simultaneously) */}
      <div className="mt-6 p-4 bg-surface border border-border rounded-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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
              className="bg-canvas border border-border rounded-input px-2.5 py-1 text-xs text-primary focus:outline-none focus:border-primary"
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
              className="bg-canvas border border-border rounded-input px-2.5 py-1 text-xs text-primary focus:outline-none focus:border-primary"
            >
              <option value="All">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="shipped">Shipped</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-canvas border border-border rounded-card p-4">
          <span className="text-xs text-muted uppercase font-medium">Net Realized Revenue</span>
          <div className="text-2xl font-bold text-primary mt-1 tabular-nums">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            Avg ${(totalRevenue / (activeOrdersCount || 1)).toFixed(2)} / order
          </span>
        </div>

        <div className="bg-canvas border border-border rounded-card p-4">
          <span className="text-xs text-muted uppercase font-medium">Low-Stock Variants</span>
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
            ${totalRefundedAmount.toFixed(2)}
          </div>
          <span className="text-[11px] text-muted mt-1 block">
            Auto-restored to inventory
          </span>
        </div>
      </div>

      {/* REAL-TIME LOW-STOCK ALERTS BANNER (Strict Requirement: Flag stock_count <= 5) */}
      {lowStockVariants.length > 0 && (
        <div className="mt-6 bg-danger-light border border-danger/30 rounded-card p-4">
          <div className="flex items-center gap-2 text-danger pb-2 border-b border-danger/20">
            <Warning size={18} weight="bold" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Real-Time Low-Stock Inventory Alerts ({lowStockVariants.length} Variants Flagged)
            </span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* GRAPH 1: Revenue Over Time */}
        <div className="bg-canvas border border-border rounded-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                1. Revenue Over Time
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Daily aggregated turnover in USD
              </p>
            </div>
            <span className="text-xs font-semibold text-primary tabular-nums">
              ${totalRevenue.toFixed(0)}
            </span>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueOverTimeData}>
                <defs>
                  <linearGradient id="purgatoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C1C1B" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1C1C1B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E4E0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#575654" fontSize={10} tickLine={false} />
                <YAxis stroke="#575654" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F7',
                    borderColor: '#E5E4E0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#1C1C1B'
                  }}
                  formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1C1C1B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#purgatoryGradient)"
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
                <YAxis stroke="#575654" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F7',
                    borderColor: '#E5E4E0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#1C1C1B'
                  }}
                  formatter={(val, name) => [name === 'revenue' ? `$${Number(val).toFixed(2)}` : val, name === 'revenue' ? 'Revenue' : 'Units Sold']}
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

      {/* ORDERS MANAGEMENT TABLE & 1-CLICK REFUND */}
      <div className="mt-8 bg-canvas border border-border rounded-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">
              Consignment & Orders Ledger ({filteredOrders.length} records)
            </h3>
            <p className="text-xs text-muted">
              Live fulfillment status toggles and 1-click refund stock recovery trigger
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-muted uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Order ID</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold">Method</th>
                <th className="py-2.5 px-3 font-semibold">Total</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Inventory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {filteredOrders.slice(0, 15).map(order => {
                const isRefunded = order.status === 'refunded';
                const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-primary">
                      {order.id.slice(0, 14)}...
                    </td>
                    <td className="py-3 px-3 text-muted">{formattedDate}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-primary">{order.customer_name}</div>
                      <div className="text-[10px] text-muted">{order.customer_email}</div>
                    </td>
                    <td className="py-3 px-3 uppercase text-[11px] text-muted">
                      {order.payment_method}
                    </td>
                    <td className="py-3 px-3 font-semibold text-primary">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={isRefunded}
                        className={`text-xs px-2 py-1 rounded-input border focus:outline-none cursor-pointer ${
                          isRefunded
                            ? 'bg-danger-light text-danger border-danger/30'
                            : order.status === 'delivered'
                            ? 'bg-success-light text-success border-success/30'
                            : 'bg-surface text-primary border-border'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isRefunded ? (
                        <span className="text-xs text-muted italic">
                          Stock Restored ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => refundOrder(order.id)}
                          className="px-2.5 py-1 bg-surface hover:bg-danger-light hover:text-danger hover:border-danger/40 border border-border rounded-input text-xs font-medium text-muted transition-colors min-h-[32px]"
                          title="Restores garment quantities back to product_variants stock"
                        >
                          1-Click Refund
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
