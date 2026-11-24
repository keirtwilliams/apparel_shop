import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChartLineUp, Receipt, Package, Truck, Tag,
  DownloadSimple, ArrowCounterClockwise, CaretDown, Check
} from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { exportToCSV, exportToXLSX, exportToXML, exportToTSV } from '../lib/exportUtils';
import ConsignmentTrackingModal from '../components/ConsignmentTrackingModal';

// Modular Tab Components
import AdminOverviewTab from '../components/admin/AdminOverviewTab';
import AdminOrdersTab from '../components/admin/AdminOrdersTab';
import AdminInventoryTab from '../components/admin/AdminInventoryTab';
import AdminLogisticsTab from '../components/admin/AdminLogisticsTab';
import AdminPromotionsTab from '../components/admin/AdminPromotionsTab';

export default function AdminDashboardPage() {
  const {
    orders,
    products,
    refundOrder,
    updateOrderStatus,
    updateVariantStock,
    lowStockVariants,
    resetToSeedData,
    saleConfig,
    setSaleConfig,
    coupons,
    setCoupons,
    updateProductSale
  } = useStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // 3 Shared Interactive Filters (for Overview tab & Data exports)
  const [dateFilter, setDateFilter] = useState('30'); // '7' | '14' | '30' | 'all'
  const [categoryFilter, setCategoryFilter] = useState('All'); // 'All' | 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'delivered' | 'shipped' | 'pending' | 'refunded'

  // Export dropdown state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState('');
  const [selectedAdminTrackingOrder, setSelectedAdminTrackingOrder] = useState(null);

  // Filtered Orders Dataset (Linked across charts + exports)
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

      // 3. Category filter
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

  // In-transit active logistics count
  const inTransitCount = useMemo(() => {
    return orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery').length;
  }, [orders]);

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
      { name: 'Delivered', value: counts.delivered, color: '#2E5A44' },
      { name: 'Shipped', value: counts.shipped, color: '#575654' },
      { name: 'Pending', value: counts.pending, color: '#8B847A' },
      { name: 'Refunded', value: counts.refunded, color: '#9E3B33' },
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

  const handleExport = async (format) => {
    setIsExportOpen(false);
    const filename = `purgatory_operations_${new Date().toISOString().split('T')[0]}`;
    try {
      if (format === 'xlsx') await exportToXLSX(exportableData, filename);
      if (format === 'csv') exportToCSV(exportableData, filename);
      if (format === 'tsv') exportToTSV(exportableData, filename);
      if (format === 'xml') exportToXML(exportableData, filename);

      setExportNotice(`Exported ${exportableData.length} records as ${format.toUpperCase()}`);
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const tabTitles = {
    overview: {
      title: 'Executive Sales & Stock Overview',
      subtitle: 'Real-time performance metrics, 4 Recharts analytics models, and low-stock telemetry.'
    },
    orders: {
      title: 'Consignments & Orders Ledger',
      subtitle: 'Order tracking, live fulfillment toggles, 1-click stage advancement & stock refunds.'
    },
    inventory: {
      title: 'Variant Stock & Inventory Matrix',
      subtitle: 'Interactive per-size stock adjustment, low-stock alerts, and warehouse totals.'
    },
    logistics: {
      title: 'Shopee / SHEIN Logistics Hub Network',
      subtitle: 'Deterministic courier dispatch, central sorting gateway tracking, and active transit pipeline.'
    },
    promotions: {
      title: 'Promotional Engine & Coupon Center',
      subtitle: 'Storewide flash sales (10% to 90% off), promo code vouchers, and per-garment markdowns.'
    }
  };

  const currentTabInfo = tabTitles[currentTab] || tabTitles.overview;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans">
      {/* 1. TOP OPERATIONS BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-muted font-bold">
              Operations Center · {currentTab.toUpperCase()}
            </span>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-mono text-success">Live Atelier Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mt-1 tracking-tight">
            {currentTabInfo.title}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {currentTabInfo.subtitle}
          </p>
        </div>

        {/* Global Operational Tools: Export & Reset Seed Data */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="px-3.5 py-2 rounded-input bg-surface border border-border text-primary hover:bg-canvas text-xs font-semibold flex items-center gap-2 transition-colors min-h-[38px]"
            >
              <DownloadSimple size={15} />
              <span>Export Dataset</span>
              <CaretDown size={12} />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-canvas border border-border rounded-card shadow-xl py-1 z-30 text-xs">
                <div className="px-3 py-1.5 font-semibold text-muted border-b border-border text-[10px] uppercase font-mono">
                  Select Format ({exportableData.length} records)
                </div>
                <button
                  type="button"
                  onClick={() => handleExport('xlsx')}
                  className="w-full text-left px-3 py-2 hover:bg-surface text-primary flex items-center justify-between"
                >
                  <span>Excel (.xlsx)</span>
                  <span className="text-[10px] text-muted">Formatted</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-3 py-2 hover:bg-surface text-primary flex items-center justify-between"
                >
                  <span>Comma-Separated (.csv)</span>
                  <span className="text-[10px] text-muted">Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('tsv')}
                  className="w-full text-left px-3 py-2 hover:bg-surface text-primary flex items-center justify-between"
                >
                  <span>Tab-Separated (.tsv)</span>
                  <span className="text-[10px] text-muted">Tabular</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('xml')}
                  className="w-full text-left px-3 py-2 hover:bg-surface text-primary flex items-center justify-between"
                >
                  <span>XML Schema (.xml)</span>
                  <span className="text-[10px] text-muted">Raw Schema</span>
                </button>
              </div>
            )}
          </div>

          {/* Reset Demo State to Initial Seed */}
          <button
            type="button"
            onClick={resetToSeedData}
            title="Reset to 46 synthetic seed orders & clean stock"
            className="px-3 py-2 rounded-input bg-surface border border-border text-muted hover:text-primary transition-colors min-h-[38px] flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowCounterClockwise size={14} />
            <span className="hidden sm:inline">Reset State</span>
          </button>
        </div>
      </div>

      {/* Export Notification */}
      {exportNotice && (
        <div className="mt-4 p-3 bg-success-light border border-success/30 rounded-input text-xs text-success flex items-center gap-2 animate-in fade-in">
          <Check size={14} weight="bold" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. DEDICATED TAB VIEWS */}
      <div className="mt-6">
        {currentTab === 'overview' && (
          <AdminOverviewTab
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            totalRevenue={totalRevenue}
            activeOrdersCount={activeOrdersCount}
            filteredOrders={filteredOrders}
            lowStockVariants={lowStockVariants}
            totalRefundedAmount={totalRefundedAmount}
            revenueOverTimeData={revenueOverTimeData}
            salesByCategoryData={salesByCategoryData}
            orderStatusData={orderStatusData}
            inventoryStockData={inventoryStockData}
            onNavigateToTab={handleTabChange}
          />
        )}

        {currentTab === 'orders' && (
          <AdminOrdersTab
            orders={orders}
            updateOrderStatus={updateOrderStatus}
            refundOrder={refundOrder}
            onOpenTrackingModal={(order) => setSelectedAdminTrackingOrder(order)}
          />
        )}

        {currentTab === 'inventory' && (
          <AdminInventoryTab
            products={products}
            updateVariantStock={updateVariantStock}
            lowStockVariants={lowStockVariants}
          />
        )}

        {currentTab === 'logistics' && (
          <AdminLogisticsTab
            orders={orders}
            updateOrderStatus={updateOrderStatus}
            onOpenTrackingModal={(order) => setSelectedAdminTrackingOrder(order)}
          />
        )}

        {currentTab === 'promotions' && (
          <AdminPromotionsTab
            saleConfig={saleConfig}
            setSaleConfig={setSaleConfig}
            coupons={coupons}
            setCoupons={setCoupons}
            products={products}
            updateProductSale={updateProductSale}
          />
        )}
      </div>

      {/* Global Shopee / SHEIN Consignment Tracking Inspector Modal */}
      <ConsignmentTrackingModal
        order={orders.find(o => o.id === selectedAdminTrackingOrder?.id) || selectedAdminTrackingOrder}
        isOpen={Boolean(selectedAdminTrackingOrder)}
        onClose={() => setSelectedAdminTrackingOrder(null)}
      />
    </div>
  );
}
