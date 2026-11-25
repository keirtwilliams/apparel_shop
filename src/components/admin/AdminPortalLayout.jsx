import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useSearchParams } from 'react-router-dom';
import {
  List, X, ShieldCheck, SignOut, ArrowSquareOut, WarningCircle,
  ChartLineUp, Receipt, Package, Truck, Tag, ArrowCounterClockwise
} from '@phosphor-icons/react';
import { useStore } from '../../context/StoreContext';
import { brandConfig } from '../../config/brand';

export default function AdminPortalLayout() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  // Desktop sidebar collapse (expanded vs icon-only) & mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const {
    orders,
    lowStockVariants,
    saleConfig,
    resetToSeedData
  } = useStore();

  const handleTerminateSession = () => {
    sessionStorage.removeItem('purgatory_ops_session');
    navigate('/ops-portal', { replace: true });
  };

  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId });
    setIsMobileOpen(false);
  };

  // Close mobile drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const inTransitCount = orders.filter(
    o => o.status === 'shipped' || o.status === 'out_for_delivery'
  ).length;

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <ChartLineUp size={18} weight="bold" />,
      badge: null
    },
    {
      id: 'orders',
      label: 'Consignments & Orders',
      icon: <Receipt size={18} weight="bold" />,
      badge: orders.length,
      badgeColor: 'bg-surface text-primary border border-border'
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock Matrix',
      icon: <Package size={18} weight="bold" />,
      badge: lowStockVariants.length > 0 ? `${lowStockVariants.length} Alert` : null,
      badgeColor: 'bg-danger text-white'
    },
    {
      id: 'logistics',
      label: 'Logistics & Dispatch Hub',
      icon: <Truck size={18} weight="bold" />,
      badge: inTransitCount > 0 ? `${inTransitCount} Active` : null,
      badgeColor: 'bg-primary text-canvas'
    },
    {
      id: 'promotions',
      label: 'Promotions & Coupons',
      icon: <Tag size={18} weight="bold" />,
      badge: saleConfig.active ? 'Sale Live' : null,
      badgeColor: 'bg-emerald-600 text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col lg:flex-row font-sans selection:bg-primary selection:text-canvas">
      {/* 1. MOBILE TOP NAVIGATION BAR */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md text-primary border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-tight bg-canvas border border-border text-primary hover:bg-surface active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Open navigation menu"
          >
            <List size={18} weight="bold" />
          </button>
          <img
            src={brandConfig.logoName}
            alt="Purgatory"
            className="h-5 w-auto object-contain filter invert"
          />
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-muted border-l border-border pl-2.5">
            Atelier Portal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTerminateSession}
            className="px-3 py-1.5 rounded-tight text-xs font-medium text-danger bg-canvas border border-border hover:bg-danger-light transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Logout"
          >
            <SignOut size={14} weight="bold" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* 2. DESKTOP FULL-HEIGHT ARCHITECTURAL SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col bg-surface text-primary border-r border-border sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out shrink-0 select-none ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Sidebar Header: Hamburger Toggle + Brand Identity */}
        <div className="h-16 px-4 border-b border-border flex items-center justify-between gap-3 bg-surface shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Collapse Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(prev => !prev)}
              className="p-2 rounded-tight bg-canvas hover:bg-surface border border-border text-primary transition-all active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
              title={isCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle navigation sidebar"
            >
              <List size={18} weight="bold" />
            </button>

            {!isCollapsed && (
              <Link to="/ops-portal/dashboard" className="flex items-center gap-2 min-w-0 group truncate">
                <img
                  src={brandConfig.logoName}
                  alt="Purgatory"
                  className="h-5 w-auto object-contain filter invert shrink-0 transition-opacity group-hover:opacity-80"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted border-l border-border pl-2.5 truncate">
                  Atelier Ops
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-6">
            <div>
              {!isCollapsed && (
                <span className="text-xs font-bold uppercase tracking-wider text-muted block px-2.5 mb-2.5">
                  Core Modules
                </span>
              )}
              <nav className="space-y-1">
                {navItems.map(item => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center rounded-tight text-xs font-medium transition-all group ${
                        isCollapsed
                          ? 'justify-center p-2.5'
                          : 'justify-between px-3 py-2.5 text-left'
                      } ${
                        isActive
                          ? 'bg-primary text-canvas font-bold shadow-xs'
                          : 'text-muted hover:text-primary hover:bg-canvas'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 transition-colors ${isActive ? 'text-canvas' : 'text-muted group-hover:text-primary'}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                            isActive ? 'bg-canvas/20 text-canvas' : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

          </div>

          {/* Logout */}
          <div className="pt-4 border-t border-border shrink-0">
            {!isCollapsed ? (
              <button
                type="button"
                onClick={handleTerminateSession}
                className="w-full py-2 px-3 bg-surface hover:bg-danger-light border border-border hover:border-danger/40 text-muted hover:text-danger rounded-tight text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="Logout"
              >
                <SignOut size={14} weight="bold" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTerminateSession}
                className="w-full p-2.5 bg-surface hover:bg-danger-light border border-border hover:border-danger/40 text-muted hover:text-danger rounded-tight flex items-center justify-center transition-colors cursor-pointer"
                title="Logout"
              >
                <SignOut size={16} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 3. MOBILE OFF-CANVAS DRAWER */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0C0C0B]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Pane */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-surface text-primary border-r border-border p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <img
                    src={brandConfig.logoName}
                    alt="Purgatory"
                    className="h-5 w-auto object-contain filter invert"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Atelier Portal
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-tight text-muted hover:text-primary hover:bg-canvas transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-2.5">
                  Core Modules
                </span>
                <nav className="space-y-1">
                  {navItems.map(item => {
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-tight text-xs font-medium transition-all text-left ${
                          isActive
                            ? 'bg-primary text-canvas font-bold shadow-xs'
                            : 'text-muted hover:text-primary hover:bg-canvas'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-canvas' : 'text-muted'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              isActive ? 'bg-canvas/20 text-canvas' : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleTerminateSession}
                className="w-full py-2.5 bg-danger-light text-danger border border-danger/30 rounded-tight text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <SignOut size={16} weight="bold" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN OPERATIONAL CANVAS (Fluid Full-Width Responsive Area) */}
      <main className="flex-1 min-w-0 flex flex-col bg-canvas text-primary">
        {/* Critical Low-Stock Warning Banner */}
        {lowStockVariants.length > 0 && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-surface border border-border border-l-4 border-l-[#C43C30] rounded-card px-4 py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <WarningCircle size={18} weight="fill" className="text-[#C43C30] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#C43C30] mr-2">
                    Low Stock Alert
                  </span>
                  <span className="text-primary font-medium">
                    {lowStockVariants.length} item size{lowStockVariants.length === 1 ? ' is' : 's are'} running low (5 or fewer left).
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTab('inventory')}
                className="h-8 px-3.5 rounded-tight bg-[#C43C30] text-[#FAF9F7] hover:opacity-90 active:scale-95 transition-all text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer self-start sm:self-auto"
              >
                Restock →
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
