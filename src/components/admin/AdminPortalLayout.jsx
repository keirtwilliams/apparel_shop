import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useSearchParams } from 'react-router-dom';
import {
  List, X, ShieldCheck, SignOut, ArrowSquareOut, Warning,
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
      icon: <ChartLineUp size={20} />,
      badge: null
    },
    {
      id: 'orders',
      label: 'Consignments & Orders',
      icon: <Receipt size={20} />,
      badge: orders.length,
      badgeColor: 'bg-surface text-primary border border-border'
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock Matrix',
      icon: <Package size={20} />,
      badge: lowStockVariants.length > 0 ? `${lowStockVariants.length} Alert` : null,
      badgeColor: 'bg-danger text-white'
    },
    {
      id: 'logistics',
      label: 'Logistics & Dispatch Hub',
      icon: <Truck size={20} />,
      badge: inTransitCount > 0 ? `${inTransitCount} Active` : null,
      badgeColor: 'bg-primary text-canvas'
    },
    {
      id: 'promotions',
      label: 'Promotions & Coupons',
      icon: <Tag size={20} />,
      badge: saleConfig.active ? 'Sale Live' : null,
      badgeColor: 'bg-emerald-600 text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col lg:flex-row font-sans selection:bg-primary selection:text-canvas">
      {/* 1. MOBILE-ONLY COMPACT TOP BAR */}
      <div className="lg:hidden sticky top-0 z-40 bg-surface text-primary border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 rounded-input bg-canvas border border-border text-primary hover:bg-surface flex items-center justify-center transition-colors"
            aria-label="Open navigation menu"
          >
            <List size={20} weight="bold" />
          </button>
          <img
            src={brandConfig.logoName}
            alt="Purgatory"
            className="h-5 w-auto object-contain filter invert"
          />
          <span className="text-[10px] font-mono uppercase text-muted tracking-wider">
            Admin Portal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-xs text-muted hover:text-primary transition-colors"
            title="View Storefront"
          >
            <ArrowSquareOut size={16} />
          </Link>
          <button
            type="button"
            onClick={handleTerminateSession}
            className="p-1.5 text-xs text-danger hover:text-danger/80 transition-colors"
            title="Lock Console"
          >
            <SignOut size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* 2. DESKTOP FULL-HEIGHT LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`hidden lg:flex flex-col bg-surface text-primary border-r border-border sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out shrink-0 select-none ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Sidebar Header: Hamburger Icon + Logo */}
        <div className="h-16 px-4 border-b border-border flex items-center justify-between gap-3 bg-surface">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(prev => !prev)}
              className="p-2 rounded-input bg-canvas hover:bg-surface border border-border text-primary transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle sidebar"
            >
              <List size={20} weight="bold" />
            </button>

            {!isCollapsed && (
              <Link to="/ops-portal/dashboard" className="flex items-center gap-2 min-w-0 group truncate">
                <img
                  src={brandConfig.logoName}
                  alt="Purgatory"
                  className="h-5 w-auto object-contain filter invert shrink-0 transition-opacity group-hover:opacity-80"
                />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted border-l border-border pl-2 truncate font-medium">
                  Atelier Portal
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div>
              {!isCollapsed && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-semibold block px-2 mb-2">
                  Atelier Navigation
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
                      className={`w-full flex items-center rounded-input text-xs font-medium transition-all group ${
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
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`shrink-0 ${isActive ? 'text-canvas' : 'text-muted group-hover:text-primary'}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                        <span
                          className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
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

            {/* Quick Actions */}
            <div className="pt-4 border-t border-border">
              {!isCollapsed && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-semibold block px-2 mb-2">
                  Atelier Shortcuts
                </span>
              )}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={resetToSeedData}
                  className={`w-full flex items-center rounded-input text-xs text-muted hover:text-primary hover:bg-canvas transition-colors ${
                    isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2 text-left'
                  }`}
                  title="Reset to 46 synthetic seed orders & clean stock"
                >
                  <ArrowCounterClockwise size={18} className="shrink-0" />
                  {!isCollapsed && <span>Reset Seed State</span>}
                </button>

                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center rounded-input text-xs text-muted hover:text-primary hover:bg-canvas transition-colors ${
                    isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2 text-left'
                  }`}
                  title="Open Customer Storefront in new tab"
                >
                  <ArrowSquareOut size={18} className="shrink-0" />
                  {!isCollapsed && <span>View Storefront ↗</span>}
                </Link>
              </div>
            </div>
          </div>

          {/* Hardened Console Footer */}
          <div className="pt-4 border-t border-border space-y-2">
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-success">
                  <ShieldCheck size={14} />
                  <span>AUTHENTICATED SESSION</span>
                </div>
                <button
                  type="button"
                  onClick={handleTerminateSession}
                  className="w-full py-2 px-3 bg-surface hover:bg-danger-light border border-border hover:border-danger/40 text-muted hover:text-danger rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                  title="Sign out of the admin console"
                >
                  <SignOut size={14} weight="bold" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleTerminateSession}
                className="w-full p-2.5 bg-surface hover:bg-danger-light border border-border hover:border-danger/40 text-muted hover:text-danger rounded flex items-center justify-center transition-colors"
                title="Sign Out"
              >
                <SignOut size={18} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 3. MOBILE OFF-CANVAS SLIDE-OVER DRAWER */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0C0C0B]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <div className="relative w-72 max-w-[80vw] bg-surface text-primary border-r border-border h-full flex flex-col justify-between p-5 z-10 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <img
                    src={brandConfig.logoName}
                    alt="Purgatory"
                    className="h-5 w-auto object-contain filter invert"
                  />
                  <span className="text-[10px] font-mono uppercase text-muted tracking-wider">
                    Admin Portal
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded text-muted hover:text-primary hover:bg-canvas"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-semibold block mb-2">
                  Atelier Navigation
                </span>
                <nav className="space-y-1">
                  {navItems.map(item => {
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-input text-xs font-medium transition-all text-left ${
                          isActive
                            ? 'bg-primary text-canvas font-bold shadow-xs'
                            : 'text-muted hover:text-primary hover:bg-canvas'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={isActive ? 'text-canvas' : 'text-muted'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
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

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-border">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-semibold block mb-2">
                  Actions
                </span>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      resetToSeedData();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-input text-xs text-muted hover:text-primary hover:bg-canvas text-left"
                  >
                    <ArrowCounterClockwise size={16} />
                    <span>Reset Seed State</span>
                  </button>
                  <Link
                    to="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-input text-xs text-muted hover:text-primary hover:bg-canvas text-left"
                  >
                    <ArrowSquareOut size={16} />
                    <span>Open Storefront ↗</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleTerminateSession}
                className="w-full py-2 bg-danger-light text-danger border border-danger/30 rounded text-xs font-semibold flex items-center justify-center gap-2"
              >
                <SignOut size={14} weight="bold" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DEDICATED OPERATIONS MAIN CONTENT */}
      <main className="flex-1 min-w-0 flex flex-col bg-canvas text-primary">
        {/* Critical Low-Stock Alert Ticker */}
        {lowStockVariants.length > 0 && (
          <div className="bg-danger-light text-danger border-b border-danger/30 py-2 px-4 text-xs font-mono flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Warning size={15} className="shrink-0" />
              <span>CRITICAL INVENTORY ALERT: {lowStockVariants.length} garment variant(s) have ≤ 5 units remaining in stock.</span>
            </div>
            <button
              type="button"
              onClick={() => handleSelectTab('inventory')}
              className="underline hover:text-danger-dark font-bold"
            >
              Adjust Stock →
            </button>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1">
          <Outlet />
        </div>

        {/* Hardened Operations Footer */}
        <footer className="border-t border-border py-4 px-6 text-center sm:text-left text-[11px] font-mono text-muted bg-surface/30 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PURGATORY APPAREL LAB — OPERATIONS CONSOLE</span>
          <span className="text-[10px]">AUTHENTICATED SESSION · CLIENT-SYNCED ARCHITECTURE</span>
        </footer>
      </main>
    </div>
  );
}
