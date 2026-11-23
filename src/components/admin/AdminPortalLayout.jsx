import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { ShieldCheck, SignOut, ArrowSquareOut, Warning, ChartLineUp } from '@phosphor-icons/react';
import { useStore } from '../../context/StoreContext';
import { brandConfig } from '../../config/brand';

export default function AdminPortalLayout() {
  const navigate = useNavigate();
  const { lowStockVariants } = useStore();

  const handleTerminateSession = () => {
    // Purge all ephemeral session credentials
    sessionStorage.removeItem('purgatory_ops_session');
    navigate('/ops-portal', { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col font-sans selection:bg-primary selection:text-canvas">
      {/* 1. ENTERPRISE OPERATIONS STATUS HEADER */}
      <header className="sticky top-0 z-40 bg-[#0C0C0B] text-[#FAF9F7] border-b border-[#242422]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Identity & Operations Tag */}
          <div className="flex items-center gap-4">
            <Link to="/ops-portal/dashboard" className="flex items-center gap-3">
              <img
                src={brandConfig.logoName}
                alt="Purgatory"
                className="h-6 w-auto object-contain filter invert"
              />
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-[#82807A] border-l border-[#2B2B28] pl-3">
                Ops Portal · Isolated Gate
              </span>
            </Link>
          </div>

          {/* Right: Security Seal & Session Controls */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs font-mono">
            {/* Live Security Status */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A18] border border-[#2B2B28] rounded-tight text-success text-[11px]">
              <ShieldCheck size={14} />
              <span>TLS / SHA-256 SESSION</span>
            </div>

            {/* Link to Public Storefront (Opens in New Tab) */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#171716] hover:bg-[#222220] border border-[#262624] text-[#FAF9F7] rounded-tight flex items-center gap-1.5 transition-colors text-[11px]"
              title="Preview Customer Storefront in new tab"
            >
              <span>View Storefront</span>
              <ArrowSquareOut size={13} />
            </Link>

            {/* Terminate Session / Lock Console */}
            <button
              onClick={handleTerminateSession}
              className="px-3 py-1.5 bg-[#261211] hover:bg-[#381615] border border-[#C43C30]/40 text-[#E8756C] rounded-tight flex items-center gap-1.5 transition-colors text-[11px] font-bold"
              title="Destroy session tokens and lock the console gate"
            >
              <SignOut size={13} weight="bold" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {/* Operational Warning Ticker if Low-Stock variants detected */}
        {lowStockVariants.length > 0 && (
          <div className="bg-[#1C1010] text-[#E8756C] border-t border-[#381615] py-1.5 px-4 text-center text-[11px] font-mono flex items-center justify-center gap-2">
            <Warning size={14} className="shrink-0" />
            <span>CRITICAL INVENTORY ALERT: {lowStockVariants.length} garment variant(s) have ≤ 5 units remaining in stock.</span>
          </div>
        )}
      </header>

      {/* 2. DEDICATED OPERATIONS MAIN CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 3. HARDENED OPERATIONS FOOTER */}
      <footer className="bg-[#0C0C0B] text-[#82807A] border-t border-[#242422] py-6 text-center text-[10px] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PURGATORY APPAREL LAB — OPERATIONS CONSOLE (AIR-GAPPED FRONTEND ARCHITECTURE)</span>
          <span>EPHEMERAL SESSION AUTO-EXPIRY ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
