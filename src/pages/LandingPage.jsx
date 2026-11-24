import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowDown, Flame, ShieldCheck,
  Truck, CreditCard, Tag, ArrowUpRight, Package,
  Scissors, ArrowsClockwise
} from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { brandConfig } from '../config/brand';
import ProductCard from '../components/ProductCard';

export default function LandingPage() {
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState('All');

  // Curated pieces for the drop preview
  const filteredFeatured = activeTab === 'All'
    ? products.slice(0, 4)
    : products.filter(p => p.category === activeTab).slice(0, 4);

  // Category divisions tailored for Philippine streetwear lovers
  const categoryTiles = [
    {
      name: 'Heavyweight Tops',
      category: 'Tops',
      desc: '240 GSM dry-touch combed cottons & boxy architectural cuts',
      image: '/products/walk-with-god-front.png',
      units: 'Limited 50 Units'
    },
    {
      name: 'Tactical Bottoms',
      category: 'Bottoms',
      desc: 'Deep pleats, relaxed studio drape & Japanese tropical wools',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
      units: 'Limited 40 Units'
    },
    {
      name: 'Transitional Outerwear',
      category: 'Outerwear',
      desc: 'Bonded DWR gabardine overshirts & brutalist trench coats',
      image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
      units: 'Limited 30 Units'
    },
    {
      name: 'Sculptural Footwear',
      category: 'Footwear',
      desc: 'Goodyear-welted Vibram lug derbies & bio-EVA minimalist mules',
      image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
      units: 'Limited 25 Units'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-primary selection:bg-primary selection:text-canvas font-sans">
      {/* 1. CINEMATIC LOOKBOOK HERO (Full Viewport, High-Impact Artwork, Cinematic Tagline, Zero Paragraph Clutter) */}
      <section className="relative min-h-[calc(100vh-5rem)] bg-[#0C0C0B] text-[#FAF9F7] flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16 overflow-hidden border-b border-[#242422]">
        {/* Atmospheric Ambient Lighting / Ember Gradient (Static, No Pulsing) */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,#C43C30_0%,transparent_60%)]"
          aria-hidden="true"
        />

        {/* Center: The Iconic Artwork + Wordmark + Cinematic Tagline (Animated Entrance) */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto py-8 max-w-4xl mx-auto animate-hero-fade">
          {/* Authentic Falling Flames Artwork as Central Campaign Motif with Ethereal Floating Motion */}
          <div className="relative mb-6 group cursor-pointer">
            <div className="w-40 sm:w-48 md:w-60 h-auto flex items-center justify-center transition-transform duration-500 group-hover:scale-105 animate-float">
              <img
                src={brandConfig.campaignArt}
                alt="Falling Flames Campaign Artwork"
                className="w-full h-auto object-contain drop-shadow-[0_4px_28px_rgba(255,255,255,0.22)] filter brightness-110"
              />
            </div>
          </div>

          {/* Pure White Purgatory Wordmark (Clean & Crisp, No Pulsating) */}
          <div className="mb-4">
            <img
              src={brandConfig.logoName}
              alt="Purgatory"
              className="h-16 sm:h-20 md:h-24 w-auto object-contain transition-transform duration-300 hover:scale-[1.02] drop-shadow-[0_2px_14px_rgba(255,255,255,0.25)]"
            />
          </div>

          {/* Static Headline Typography with Subtle Continuous Liquid Light Shimmer */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight text-[#FAF9F7] max-w-2xl font-sans leading-tight animate-text-shimmer">
            Raw Decay. Permanent Architecture.
          </h1>

          <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-[#A8A6A0] mt-2">
            “ Where the flames fall, the form remains. ”
          </p>

          {/* Single High-Contrast CTA Button (Min 44px Tap Target) */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/catalogue"
              className="px-8 sm:px-10 py-4 bg-[#FAF9F7] text-[#0C0C0B] text-xs font-bold uppercase tracking-widest rounded-tight hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2.5 min-h-[48px] shadow-sm"
            >
              <span>Explore Collection 01</span>
              <ArrowRight size={15} weight="bold" />
            </Link>
          </div>
        </div>

        {/* Bottom: Minimal Scroll Indicator */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#82807A] pt-4">
          <span>Scroll to Discover</span>
          <ArrowDown size={13} className="animate-bounce" />
        </div>
      </section>

      {/* 2. RUNNING STREETWEAR TICKER (High-Impact Transition) */}
      <div className="bg-[#0C0C0B] text-[#FAF9F7] border-b border-[#242422] overflow-hidden py-2.5 font-mono text-[11px] uppercase tracking-widest">
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-6 shrink-0 px-4">
            <span className="flex items-center gap-1.5 text-[#E8756C] font-bold">
              <Flame size={14} weight="fill" />
              <span>DROP 01 — FALLING FLAMES</span>
            </span>
            <span className="text-[#82807A]">·</span>
            <span>290 GSM DRY-TOUCH COMBED COTTON</span>
            <span className="text-[#82807A]">·</span>
            <span>NATIONWIDE CASH ON DELIVERY (COD)</span>
            <span className="text-[#82807A]">·</span>
            <span>GCASH & CARDS VERIFIED</span>
            <span className="text-[#82807A]">·</span>
            <span>SAME-DAY METRO MANILA DISPATCH</span>
            <span className="text-[#82807A]">·</span>
            <span>LIMITED 50-PIECE NUMBERED RUNS</span>
            <span className="text-[#82807A]">·</span>
            <span>NO MASS RESTOCKS</span>
            <span className="text-[#82807A]">·</span>
          </div>

          <div className="flex items-center gap-6 shrink-0 px-4">
            <span className="flex items-center gap-1.5 text-[#E8756C] font-bold">
              <Flame size={14} weight="fill" />
              <span>DROP 01 — FALLING FLAMES</span>
            </span>
            <span className="text-[#82807A]">·</span>
            <span>290 GSM DRY-TOUCH COMBED COTTON</span>
            <span className="text-[#82807A]">·</span>
            <span>NATIONWIDE CASH ON DELIVERY (COD)</span>
            <span className="text-[#82807A]">·</span>
            <span>GCASH & CARDS VERIFIED</span>
            <span className="text-[#82807A]">·</span>
            <span>SAME-DAY METRO MANILA DISPATCH</span>
            <span className="text-[#82807A]">·</span>
            <span>LIMITED 50-PIECE NUMBERED RUNS</span>
            <span className="text-[#82807A]">·</span>
            <span>NO MASS RESTOCKS</span>
            <span className="text-[#82807A]">·</span>
          </div>
        </div>
      </div>

      {/* 3. NATIONWIDE LOCAL TRUST & LOGISTICS BAR (Philippine Streetwear Standards) */}
      <section className="bg-surface border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Nationwide COD
                </h2>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">
                  Cash on Delivery available across Luzon, Visayas & Mindanao.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary shrink-0">
                <CreditCard size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  GCash & Cards
                </h2>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">
                  Instant verification via GCash, Maya, and Visa/Mastercard.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary shrink-0">
                <Package size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Same-Day Manila
                </h2>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">
                  Express dispatch from our Taguig Lab within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Zero Mass Restocks
                </h2>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">
                  Strictly 50 units per colorway. Archival deadstock once sold out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ARCHIVAL DIVISIONS (Visual Category Discovery) */}
      <section id="divisions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-border gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted font-mono font-semibold">
              Collection Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mt-1 tracking-tight uppercase">
              Archival Garment Divisions
            </h2>
          </div>

          <Link
            to="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:text-muted transition-colors min-h-[36px]"
          >
            <span>View All Garments</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 4-Card Category Division Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {categoryTiles.map(tile => (
            <Link
              key={tile.name}
              to={`/catalogue?category=${tile.category}`}
              className="group relative bg-surface border border-border rounded-card overflow-hidden flex flex-col hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {/* Category Image */}
              <div className="aspect-[4/5] overflow-hidden bg-surface relative">
                <img
                  src={tile.image}
                  alt={tile.name}
                  className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                />
                  <div className="absolute top-3 right-3 bg-[#0C0C0B]/90 backdrop-blur-md text-[#FAF9F7] text-[10px] font-sans font-semibold tracking-wider uppercase px-2.5 py-1 rounded-tight border border-white/10 shadow-sm">
                    {tile.units}
                  </div>
                </div>

                {/* Title & Description */}
                <div className="p-5 flex flex-col justify-between flex-1 bg-canvas">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary group-hover:underline underline-offset-4">
                      {tile.name}
                    </h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {tile.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono font-semibold text-primary">
                    <span>EXPLORE CATEGORY</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-200" />
                  </div>
                </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. CURATED COLLECTION 01 DROPS (4:5 Clutter-Free Apparel Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-border gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted font-mono font-semibold">
              Drop 01 Consignments
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mt-1 tracking-tight uppercase">
              Curated Archival Garments
            </h2>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Tops', 'Bottoms', 'Outerwear'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-tight border transition-colors ${activeTab === tab
                  ? 'bg-primary text-canvas border-primary'
                  : 'bg-surface text-muted border-border hover:text-primary hover:border-primary/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 4:5 Clutter-Free Cards (Only Image, Title, Price, and Color Swatches) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12 pt-8">
          {filteredFeatured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:opacity-90 transition-opacity min-h-[44px]"
          >
            <span>View All {products.length} Drop 01 Garments</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* 6. MANIFESTO & HEAVYWEIGHT DISCIPLINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <span className="text-xs uppercase tracking-widest text-muted font-mono font-semibold">
              Fabrication Manifesto
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-primary mt-2 uppercase tracking-tight leading-tight">
              Constructed for Longevity, Weight & Form
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-4 leading-relaxed">
              Mainstream fast fashion relies on 160–180 GSM fabrics that twist and degrade in tropical wash cycles. We engineered Purgatory Collection 01 on pure heavyweight principles: heavy drape that never clings, reinforced collars that never sag, and dry-touch hand feel.
            </p>

            <div className="mt-6 p-4 bg-surface border border-border rounded-card font-mono text-xs text-primary space-y-2">
              <div className="flex justify-between pb-1 border-b border-border">
                <span className="text-muted">BASE FABRIC</span>
                <span className="font-semibold">290 GSM Combed Cotton</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-border">
                <span className="text-muted">RIB THICKNESS</span>
                <span className="font-semibold">32mm Double-Needle</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-border">
                <span className="text-muted">TREATMENT</span>
                <span className="font-semibold">Pre-Shrunk Cold Enzyme</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">LOCATION</span>
                <span className="font-semibold">Manila Lab · BGC HQ</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-surface border border-border rounded-card">
              <div className="w-8 h-8 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary mb-3">
                <Scissors size={16} />
              </div>
              <h3 className="text-xs font-mono font-bold text-primary uppercase">
                01 · Drop-Shoulder Geometry
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Elongated shoulder lines with a slightly cropped torso hem. Sits broad on the chest with a clean boxy silhouette without excess fabric pooling around the waist.
              </p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-card">
              <div className="w-8 h-8 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary mb-3">
                <ArrowsClockwise size={16} />
              </div>
              <h3 className="text-xs font-mono font-bold text-primary uppercase">
                02 · Cold-Water Enzyme Wash
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Pre-shrunk through mineral stone-washing to eliminate shrinkage. The dry-touch texture breaks in and patinas naturally like vintage Japanese workwear.
              </p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-card">
              <div className="w-8 h-8 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary mb-3">
                <ShieldCheck size={16} />
              </div>
              <h3 className="text-xs font-mono font-bold text-primary uppercase">
                03 · 32mm High-Gauge Neckline
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Engineered with high-tension 1x1 cotton ribbing reinforced with topstitching. Completely eliminates the notorious "bacon neck" after prolonged wear.
              </p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-card">
              <div className="w-8 h-8 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary mb-3">
                <Tag size={16} />
              </div>
              <h3 className="text-xs font-mono font-bold text-primary uppercase">
                04 · Limited 50-Piece Serial
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Every release is strictly capped at 50 units worldwide. No reprint cycles, protecting the provenance and archival resale value of your consignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="bg-surface border-b border-border py-16 sm:py-24 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <span className="text-xs uppercase tracking-widest text-[#9E3B33] font-mono font-bold">
            ARCHIVE DROP 01 LIVE
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-primary mt-2 uppercase tracking-tight">
            Secure Your Consignment
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-3 max-w-lg mx-auto leading-relaxed">
            Same-day dispatch across Metro Manila. Complimentary express courier nationwide on orders over $150.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/catalogue"
              className="px-8 py-4 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2 min-h-[48px]"
            >
              <span>Explore Collection 01</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
