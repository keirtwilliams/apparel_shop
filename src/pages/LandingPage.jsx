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
  const { products, saleConfig } = useStore();
  const [activeTab, setActiveTab] = useState('All');

  // Curated pieces for the drop preview
  const filteredFeatured = activeTab === 'All'
    ? products.slice(0, 4)
    : products.filter(p => p.category === activeTab).slice(0, 4);

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
            <span>240 GSM DRY-TOUCH COMBED COTTON</span>
            <span className="text-[#82807A]">·</span>
            <span>NATIONWIDE CASH ON DELIVERY (COD)</span>
            <span className="text-[#82807A]">·</span>
            <span>GCASH & CARDS VERIFIED</span>
            <span className="text-[#82807A]">·</span>
            <span>SAME-DAY METRO MANILA DISPATCH</span>
            <span className="text-[#82807A]">·</span>
            <span>ARCHIVAL FALLING FLAMES GRAPHICS</span>
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
            <span>240 GSM DRY-TOUCH COMBED COTTON</span>
            <span className="text-[#82807A]">·</span>
            <span>NATIONWIDE CASH ON DELIVERY (COD)</span>
            <span className="text-[#82807A]">·</span>
            <span>GCASH & CARDS VERIFIED</span>
            <span className="text-[#82807A]">·</span>
            <span>SAME-DAY METRO MANILA DISPATCH</span>
            <span className="text-[#82807A]">·</span>
            <span>ARCHIVAL FALLING FLAMES GRAPHICS</span>
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
                  Archival deadstock once sold out. Hand-cured in limited atelier runs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURATED COLLECTION 01 DROPS (4:5 Clutter-Free Apparel Grid) */}
      <section id="archive" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-border gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase">
              Curated Archival Garments
            </h2>
          </div>

          {/* Quick Category Filter Pills (Bottoms & Outerwear removed as of now) */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Tops'].map(tab => (
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
            <span>View All {products.length} Garments</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* 6. MANIFESTO & HEAVYWEIGHT DISCIPLINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Philosophy & Technical Matrix */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
             
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mt-4 uppercase tracking-tight leading-[1.1]">
                Constructed For Longevity, Weight & Form
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-5 leading-relaxed">
                Mainstream fast fashion relies on 160–180 GSM fabrics that twist and degrade in tropical heat and wash cycles. We engineered Purgatory on uncompromising heavyweight principles: deliberate architectural drape that never clings, and reinforced collars that never sag.
              </p>
            </div>

            {/* Atelier Technical Spec Matrix */}
            <div className="mt-8 border border-border rounded-card bg-surface/50 backdrop-blur-sm overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border bg-surface flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                  Technical Specification
                </span>
                <span className="text-[10px] font-mono text-[#C43C30] font-semibold uppercase tracking-widest">
                  Atelier MNL
                </span>
              </div>
              <div className="divide-y divide-border/60 text-xs font-mono">
                <div className="px-5 py-3.5 flex items-center justify-between hover:bg-canvas/50 transition-colors">
                  <span className="text-muted uppercase tracking-wider text-[11px]">Base Fabric</span>
                  <span className="font-semibold text-primary">240 GSM Combed Ring-Spun Cotton</span>
                </div>
                <div className="px-5 py-3.5 flex items-center justify-between hover:bg-canvas/50 transition-colors">
                  <span className="text-muted uppercase tracking-wider text-[11px]">Collar Rib</span>
                  <span className="font-semibold text-primary">32mm 1x1 High-Tension Ribbed</span>
                </div>
                <div className="px-5 py-3.5 flex items-center justify-between hover:bg-canvas/50 transition-colors">
                  <span className="text-muted uppercase tracking-wider text-[11px]">Treatment</span>
                  <span className="font-semibold text-primary">Pre-Shrunk Cold Enzyme Wash</span>
                </div>
                <div className="px-5 py-3.5 flex items-center justify-between hover:bg-canvas/50 transition-colors">
                  <span className="text-muted uppercase tracking-wider text-[11px]">Sewing Spec</span>
                  <span className="font-semibold text-primary">Twin-Needle Topstitched Hems</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Architectural Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Pillar 01 */}
            <div className="group relative p-6 sm:p-7 bg-surface border border-border rounded-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-mono font-bold text-muted/30 group-hover:text-primary transition-colors">
                    01
                  </span>
                  <div className="w-8 h-8 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors">
                    <Scissors size={15} />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                  Drop-Shoulder Geometry
                </h3>
                <p className="text-xs text-muted mt-2.5 leading-relaxed">
                  Elongated shoulder lines paired with a tailored torso proportion. Sits broad and commanding on the chest with a clean boxy silhouette, eliminating excess pooling fabric.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest">
                <span>CUT PROFILE</span>
                <span className="text-primary font-semibold">RELAXED BOXY</span>
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="group relative p-6 sm:p-7 bg-surface border border-border rounded-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-mono font-bold text-muted/30 group-hover:text-primary transition-colors">
                    02
                  </span>
                  <div className="w-8 h-8 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors">
                    <ArrowsClockwise size={15} />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                  Cold Enzyme Wash
                </h3>
                <p className="text-xs text-muted mt-2.5 leading-relaxed">
                  Pre-shrunk through low-temperature enzyme tumbling to eliminate post-purchase shrinkage. The dry-touch yarn softens and patinas organically with every wear cycle.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest">
                <span>HAND-FEEL</span>
                <span className="text-primary font-semibold">DRY-TOUCH VINTAGE</span>
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="group relative p-6 sm:p-7 bg-surface border border-border rounded-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-mono font-bold text-muted/30 group-hover:text-primary transition-colors">
                    03
                  </span>
                  <div className="w-8 h-8 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors">
                    <ShieldCheck size={15} />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                  32mm High-Tension Collar
                </h3>
                <p className="text-xs text-muted mt-2.5 leading-relaxed">
                  Engineered with heavy-gauge 1x1 cotton ribbing reinforced by double-needle edge stitching. Eliminates neck roll and collar distortion even under humid tropical wear.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest">
                <span>CONSTRUCTION</span>
                <span className="text-primary font-semibold">ANTI-SAG RIB</span>
              </div>
            </div>

            {/* Pillar 04: Screenprint Durability */}
            <div className="group relative p-6 sm:p-7 bg-surface border border-border rounded-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-mono font-bold text-muted/30 group-hover:text-primary transition-colors">
                    04
                  </span>
                  <div className="w-8 h-8 rounded-tight bg-canvas border border-border flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors">
                    <Flame size={15} />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                  Cured Archival Screenprint
                </h3>
                <p className="text-xs text-muted mt-2.5 leading-relaxed">
                  High-definition soft-hand discharge and plastisol inks heat-cured directly into the cotton knit. Maintains razor-sharp graphic fidelity without peeling, cracking, or stiffening.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest">
                <span>INK FINISH</span>
                <span className="text-primary font-semibold">ZERO-CRACK DISCHARGE</span>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
