import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { brandConfig } from './config/brand';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import AccountDrawer from './components/AccountDrawer';
import LandingPage from './pages/LandingPage';
import CataloguePage from './pages/CataloguePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import ReceiptPage from './pages/ReceiptPage';
import AccountOrdersPage from './pages/AccountOrdersPage';
import NotFoundPage from './pages/NotFoundPage';

// Security & Protected Admin Components
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminPortalLayout from './components/admin/AdminPortalLayout';

// Lazy-Loaded Admin Modules (Ensures 0% overhead for public storefront shoppers)
const AdminSecurityGate = lazy(() => import('./pages/admin/AdminSecurityGate'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

// High-Precision Minimalist Suspense Fallback
function AdminSuspenseFallback() {
  return (
    <div className="min-h-screen bg-[#0C0C0B] text-[#FAF9F7] flex flex-col items-center justify-center p-6 font-mono">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-[#FAF9F7] rounded-full animate-ping" />
        <span className="text-xs uppercase tracking-widest text-[#82807A]">
          Decrypting Console Module...
        </span>
      </div>
    </div>
  );
}

// Public Customer Layout Wrapper
function CustomerLayout() {
  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col font-sans selection:bg-primary selection:text-canvas">
      {/* Public Navigation */}
      <Header />

      {/* Cart Drawer Slide-Over */}
      <CartDrawer />

      {/* Client Account Drawer Slide-Over */}
      <AccountDrawer />

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* High-Fashion Editorial Footer */}
      <footer className="bg-surface border-t border-border mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border">
            <div>
              <div className="flex items-center">
                <img
                  src={brandConfig.logoName}
                  alt="Purgatory"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-muted mt-2 max-w-sm">
                {brandConfig.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-muted uppercase tracking-wider font-mono">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/catalogue" className="hover:text-primary transition-colors">Catalogue</Link>
              <Link to="/orders" className="hover:text-primary transition-colors">Orders</Link>
              <span className="text-border">|</span>
              <span>Complimentary Global Courier</span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted gap-3 font-mono">
            <p>© 2026 PURGATORY APPAREL LAB — FALLING FLAMES. ALL RIGHTS RESERVED.</p>
            <p className="flex items-center gap-2">
              <span>PALETTE: #FAF9F7 / #1C1C1B</span>
              <span>·</span>
              <span>REACT + TAILWIND + ISOLATED OPS GATE</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* 1. PUBLIC CUSTOMER STOREFRONT ROUTES */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/receipt/:orderId" element={<ReceiptPage />} />
            <Route path="/orders" element={<AccountOrdersPage />} />
            {/* Honeypot / Disguised route: standard /admin leads to 404 */}
            <Route path="/admin" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* 2. ISOLATED OPERATOR PORTAL GATEWAY */}
          <Route
            path="/ops-portal"
            element={
              <Suspense fallback={<AdminSuspenseFallback />}>
                <AdminSecurityGate />
              </Suspense>
            }
          />

          {/* 3. PROTECTED OPERATOR CONSOLE (Air-Gapped Layout + Session Guard) */}
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminPortalLayout />}>
              <Route
                path="/ops-portal/dashboard"
                element={
                  <Suspense fallback={<AdminSuspenseFallback />}>
                    <AdminDashboardPage />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
