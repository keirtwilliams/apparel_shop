import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bag, User, List, X } from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { brandConfig } from '../config/brand';

export default function Header() {
  const { cartTotalCount, setIsCartOpen, currentUser, setIsAccountDrawerOpen, saleConfig } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Catalogue', path: '/catalogue' },
    ...(currentUser ? [{ name: 'Orders', path: '/orders' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-border">
      {/* High-Fashion Editorial Top Ticker / Dynamic Flash Sale Banner (hidden on mobile for clean viewport) */}
      {saleConfig?.active ? (
        <div className="hidden sm:flex bg-[#C43C30] text-[#FAF9F7] text-[11px] uppercase tracking-widest py-2 px-4 text-center font-mono items-center justify-center gap-3">
          <span className="font-bold tracking-widest">FLASH ARCHIVE DROP</span>
          <span className="opacity-40">·</span>
          <span className="font-semibold tracking-wider">
            {saleConfig.percentage}% OFF {saleConfig.categoryTarget !== 'All' ? `${saleConfig.categoryTarget.toUpperCase()} ` : 'STOREWIDE '}AUTOMATICALLY APPLIED
          </span>
          <span className="opacity-40 hidden md:inline">·</span>
          <span className="hidden md:inline tracking-wider">USE CODE 'PURGATORY10' FOR EXTRA 10%</span>
        </div>
      ) : (
        <div className="hidden sm:flex bg-[#C43C30] text-[#FAF9F7] text-[11px] uppercase tracking-widest py-2 px-4 text-center font-mono items-center justify-center gap-3 shadow-inner">
          <span className="font-semibold tracking-widest">PURGATORY WORLDWIDE</span>
          <span className="opacity-40">·</span>
          <span className="tracking-wider">COLLECTION 01: FALLING FLAMES</span>
          <span className="opacity-40 hidden md:inline">·</span>
          <span className="hidden md:inline text-[#FAF9F7]/90 tracking-wider">COMPLIMENTARY EXPRESS GLOBAL SHIPPING</span>
        </div>
      )}

      {/* Main Navigation Bar — Mobile: Hamburger + Logo | Tools; Desktop: Left Logo, Center Links, Right Tools */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* 1. Left: Mobile Hamburger + Brand Logo Anchor */}
        <div className="flex items-center gap-2.5 sm:gap-0 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="sm:hidden p-2.5 text-primary hover:text-muted hover:bg-surface rounded-tight border border-border min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={19} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
          <Link to="/" className="inline-flex items-center group py-1" aria-label="Purgatory Home">
            <img
              src={brandConfig.logoName}
              alt="Purgatory"
              className="h-9 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] filter invert"
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
                className={`group relative py-1 text-xs uppercase tracking-widest font-medium transition-colors ${isActive ? 'text-primary font-bold' : 'text-muted hover:text-primary'
                  }`}
              >
                <span>{link.name}</span>
                {/* Smooth Animated Hover & Active Line */}
                <span
                  className={`absolute left-0 bottom-0 h-[1.5px] bg-primary transition-transform duration-300 ease-out origin-left ${isActive ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100'
                    }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* 3. Right: Desktop Account/Login + Shopping Bag Trigger */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
          {/* Desktop Account / Login Trigger (on mobile, lives inside the Hamburger menu) */}
          {currentUser ? (
            <button
              onClick={() => setIsAccountDrawerOpen(true)}
              aria-label="Client Account"
              className="hidden sm:flex relative p-2.5 text-primary hover:text-muted transition-colors rounded-tight hover:bg-surface focus:outline-none min-w-[44px] min-h-[44px] items-center justify-center border border-border cursor-pointer"
              title={`Client: ${currentUser.full_name}`}
            >
              <User size={19} weight="bold" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#2E5A44] rounded-full ring-2 ring-canvas" />
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-2.5 text-canvas bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all rounded-tight text-xs font-semibold uppercase tracking-wider border border-primary shadow-xs cursor-pointer whitespace-nowrap"
            >
              Login or Create Account
            </Link>
          )}

          {/* Shopping Bag Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Bag"
            className="relative p-2.5 text-primary hover:text-muted transition-colors rounded-tight hover:bg-surface focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center border border-border cursor-pointer"
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

      {/* Mobile Hamburger Slide-Down Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-canvas px-4 py-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-tight text-xs uppercase tracking-widest font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-canvas'
                    : 'text-primary hover:bg-surface'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-border">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAccountDrawerOpen(true);
                }}
                className="w-full px-3 py-2.5 rounded-tight bg-surface border border-border text-xs uppercase tracking-wider font-semibold text-primary flex items-center justify-between cursor-pointer"
              >
                <span>Account · {currentUser.full_name}</span>
                <span className="w-2 h-2 bg-[#2E5A44] rounded-full" />
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-3 py-2.5 rounded-tight bg-primary text-canvas text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
              >
                Login or Create Account
              </Link>
            )}
          </div>

          {saleConfig?.active && (
            <div className="pt-2 border-t border-border text-[11px] font-semibold uppercase tracking-wider text-[#C43C30] px-3 py-1">
              Flash Sale: {saleConfig.percentage}% Off {saleConfig.categoryTarget !== 'All' ? saleConfig.categoryTarget : 'Storewide'}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
