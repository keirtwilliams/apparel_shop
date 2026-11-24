import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bag, User } from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { brandConfig } from '../config/brand';

export default function Header() {
  const { cartTotalCount, setIsCartOpen, currentUser, setIsAccountDrawerOpen, saleConfig } = useStore();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Catalogue', path: '/catalogue' },
    ...(currentUser ? [{ name: 'Orders', path: '/orders' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-border">
      {/* High-Fashion Editorial Top Ticker / Dynamic Flash Sale Banner */}
      {saleConfig?.active ? (
        <div className="bg-[#C43C30] text-[#FAF9F7] text-[11px] uppercase tracking-widest py-2 px-4 text-center font-mono flex items-center justify-center gap-3">
          <span className="font-bold tracking-widest">FLASH ARCHIVE DROP</span>
          <span className="opacity-40">·</span>
          <span className="font-semibold tracking-wider">
            {saleConfig.percentage}% OFF {saleConfig.categoryTarget !== 'All' ? `${saleConfig.categoryTarget.toUpperCase()} ` : 'STOREWIDE '}AUTOMATICALLY APPLIED
          </span>
          <span className="opacity-40 hidden sm:inline">·</span>
          <span className="hidden sm:inline tracking-wider">USE CODE 'PURGATORY10' FOR EXTRA 10%</span>
        </div>
      ) : (
        <div className="bg-[#C43C30] text-[#FAF9F7] text-[11px] uppercase tracking-widest py-2 px-4 text-center font-mono flex items-center justify-center gap-3 shadow-inner">
          <span className="font-semibold tracking-widest">PURGATORY WORLDWIDE</span>
          <span className="opacity-40">·</span>
          <span className="tracking-wider">COLLECTION 01: FALLING FLAMES</span>
          <span className="opacity-40 hidden sm:inline">·</span>
          <span className="hidden sm:inline text-[#FAF9F7]/90 tracking-wider">COMPLIMENTARY EXPRESS GLOBAL SHIPPING</span>
        </div>
      )}

      {/* Main Navigation Bar — Balanced Architectural Layout: Left Logo, Centered Links, Right Tools */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* 1. Left: Brand Logo Anchor (Classic Left Placement, Black on Light Navbar) */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="inline-flex items-center group py-1" aria-label="Purgatory Home">
            <img
              src={brandConfig.logoName}
              alt="Purgatory"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] filter invert"
            />
          </Link>
        </div>

        {/* 2. Center: Prominent Nav Links (Home, Catalogue, Orders) with Smooth Sliding Hover Line */}
        <nav className="hidden sm:flex items-center justify-center gap-8 md:gap-10 flex-1">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`group relative py-1 text-xs uppercase tracking-widest font-medium transition-colors ${
                  isActive ? 'text-primary font-bold' : 'text-muted hover:text-primary'
                }`}
              >
                <span>{link.name}</span>
                {/* Smooth Animated Hover & Active Line */}
                <span
                  className={`absolute left-0 bottom-0 h-[1.5px] bg-primary transition-transform duration-300 ease-out origin-left ${
                    isActive ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* 3. Right: Client Account Drawer & Shopping Bag Triggers */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
          {/* Customer Account Drawer Trigger */}
          <button
            onClick={() => setIsAccountDrawerOpen(true)}
            aria-label="Client Account"
            className="relative p-2.5 text-primary hover:text-muted transition-colors rounded-tight hover:bg-surface focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center border border-border"
            title={currentUser ? `Client: ${currentUser.full_name}` : 'Sign In / Client Access'}
          >
            <User size={19} weight={currentUser ? 'bold' : 'regular'} />
            {currentUser && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#2E5A44] rounded-full ring-2 ring-canvas" />
            )}
          </button>

          {/* Shopping Bag Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Bag"
            className="relative p-2.5 text-primary hover:text-muted transition-colors rounded-tight hover:bg-surface focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center border border-border"
          >
            <Bag size={19} weight="regular" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-canvas text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                {cartTotalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (Home, Catalogue, Orders) */}
      <div className="sm:hidden flex items-center justify-around border-t border-border/70 py-2.5 px-4 bg-canvas text-xs uppercase tracking-widest font-mono">
        {navLinks.map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`group relative py-1 px-3 transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted hover:text-primary'
              }`}
            >
              <span>{link.name}</span>
              <span
                className={`absolute left-0 bottom-0 h-[1.5px] bg-primary transition-transform duration-300 ease-out origin-left ${
                  isActive ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </Link>
          );
        })}
      </div>
    </header>
  );
}
