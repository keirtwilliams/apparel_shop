# PURGATORY // FALLING FLAMES — ARCHIVAL LUXURY STREETWEAR

> **Production-Ready Philippine Luxury Apparel Web App & Operations Console**  
> Built with **React 18 + Vite + Tailwind CSS + Recharts + write-excel-file + HTML5 Canvas**  
> Tailored for live investor/evaluator demonstrations with 100% client-side resilience and zero external database blockers.

---

## 1. Brand Manifesto & Anti-AI-Slop Visual System

**PURGATORY (Falling Flames Collection)** is an independent luxury streetwear atelier based in Iloilo City and Metro Manila, Philippines. Engineered around raw architectural silhouettes, heavy-density 240 GSM combed cottons, cured archival screenprints, and industrial dark-minimalist aesthetics.

### Color Tokens (Unified Storefront & Admin Palette)
Strictly adheres to an organic, high-contrast, anti-AI-slop design system. Pure digital primaries (`#FFFFFF`, `#000000`, saturated blues) are forbidden:

| Token | Hex Value | Application |
| :--- | :--- | :--- |
| **Chalk Canvas** | `#FAF9F7` | Body background, card surfaces, modal bases |
| **Obsidian Primary** | `#0C0C0B` | Core typography, primary action buttons, active pills |
| **Surface Neutral** | `#F5F3EE` | Secondary containers, inputs, table headers, drawer bases |
| **Atelier Border** | `#E5E4E0` | Tight `1px` architectural borders and division lines |
| **Flame Red** | `#C43C30` | Sale badges, markdown accents, critical stock warnings |
| **Taupe Muted** | `#82807A` | Labels, specifications, metadata, breadcrumbs |
| **Success Emerald** | `#2E5A44` | In-stock tags, paid indicators, live tracking beacon |

---

## 2. Core Architecture & Resilient Performance Engine

```
┌────────────────────────────────────────────────────────┐
│                   PURGATORY WEB APP                    │
├───────────────────────────┬────────────────────────────┤
│     BUYER STOREFRONT      │   ADMIN OPERATIONS GATE    │
│   (Chalk Luxury Funnel)   │   (Left-Sidebar Console)   │
├───────────────────────────┴────────────────────────────┤
│                  SHARED CLIENT ENGINE                  │
│  ├── MemoryCache (L1 RAM) + SessionStorage (L2 SWR)    │
│  ├── Sliding-Window Rate Limiter (Debounce & Defense)  │
│  ├── Deterministic Tracking Engine (Shopee/SHEIN Hub)  │
│  └── HTML5 2x Retina Canvas PNG Receipt Generator      │
└────────────────────────────────────────────────────────┘
```

### High-Performance Tiered Caching (`src/lib/cache.js`)
- **L1 RAM Cache:** In-memory LRU storage with sub-millisecond lookups for products and order tracking.
- **L2 Persistent Session Cache:** Survives page navigations with configurable Time-To-Live (TTL).
- **Stale-While-Revalidate (SWR):** Instantly yields cached responses while quietly updating in the background.
- **Tag-Based Invalidation:** Adjusting product stock or markdowns automatically purges `'products'` and `'pricing'` tags across all components.

### Sliding-Window Rate Limiter (`src/lib/rateLimiter.js`)
- **Checkout Double-Click Throttle:** Prevents duplicate order placement during network or rapid click events.
- **Coupon Brute-Force Shield:** Limits promotional voucher testing to 5 attempts per minute.
- **Console Lockout:** Auto-throttles authentication retries.

---

## 3. Buyer Journey & Storefront Features

### A. Streamlined 3-Stage Luxury Funnel (`/`)
1. **Cinematic Lookbook Hero:** High-impact "Falling Flames" campaign artwork, inverted brand crest, and liquid-light typography.
2. **Curated Archival Garments (`#archive`):** 4:5 fashion card grid displaying authentic curated graphic tees (`img1` to `img6`), hover zoom, real-time PHP pricing, and color swatches.
3. **Fabrication Manifesto:** Architectural atelier matrix detailing 240 GSM combed cotton specifications, cured screenprinting, and deadstock drop policies.

### B. Product Detail Page (`/product/:slug`)
- Dual-photo 4:5 gallery with front/back inspection.
- Tactile size selector (S, M, L, XL, XXL) with automatic sold-out strikethroughs.
- Low-stock indicator (`Only X units remaining`) for stock counts $\le 5$.
- Expandable accordions for **Fabrication Specs**, **Silhouette Fit**, and **Garment Care**.
- Mobile sticky checkout action bar with strict $\ge 44\text{px}$ touch targets.

### C. Slide-Over Cart Drawer
- Non-interruptive slide-out from any page.
- Inline size switcher and quantity stepper with stock clamping.
- Live promo coupon voucher redemption.

### D. Multi-Method Checkout (`/checkout`)
- Currency: **Philippine Peso (PHP, ₱)**.
- Payment options: **Cash on Delivery (COD)**, **GCash**, and **Card**.
- Instant local stock deduction and order reservation.

### E. Retina PNG Receipt Download & Shopee/SHEIN Tracking (`/receipt/:id`)
- **Direct PNG Image Download:** 2x Retina resolution receipt generated via HTML5 Canvas (`PURGATORY-RECEIPT-${id}.png`) for mobile galleries and proof of purchase.
- **Live Tracking Beacon:** Shows real-time Metro Manila hub location (e.g. *BGC Atelier Sorting Center*, *Pasig Sorting Gateway*).
- **Shopee/SHEIN 5-Stage Stepper:** Visual tracking pipeline synced directly to admin status updates.

---

## 4. Admin Operations Portal (`/ops-portal`)

### Secure Authentication (`/ops-portal`)
- Standard Email & Password authentication:
  - **Email:** `admin@purgatory.com` *(pre-filled)*
  - **Password:** `purgatory2026` *(pre-filled)*
- 1-click **"Fill Credentials"** helper for swift testing.
- Styled in the authentic buyer branding palette (Chalk `#FAF9F7`, Obsidian `#0C0C0B`).

### Collapsible Left-Sidebar Navigation Bar
- **Hamburger Toggle Icon:** Located at top-left.
  - **Desktop:** Smoothly collapses sidebar to compact icon-only column (`w-18`) or expands (`w-64`) to give full screen width to data tables and charts.
  - **Mobile:** Off-canvas slide-over drawer with backdrop blur.
- **5 Dedicated Functional Modules:**

#### 1. Overview (`?tab=overview`)
- Executive KPIs: Net Realized Revenue (PHP), Consignments Count, Low-Stock Flagged Count, Refund Volume.
- Interactive Global Filters: Date range (`7D`, `14D`, `30D`, `All`), Category, and Status simultaneously updating all 4 analytics charts.
- Low-Stock Alerts Banner: Instant overview of garments with $\le 5$ units remaining.
- 4 Recharts Analytics Visualizations:
  1. *Revenue & Order Volume Over Time* (Area chart)
  2. *Sales by Category* (Bar chart)
  3. *Order Status Breakdown* (Donut chart)
  4. *Variant Inventory Levels* (Horizontal bar chart flagging low stock in Flame Red)

#### 2. Consignments & Orders (`?tab=orders`)
- Search by Order ID, Customer Name, Email, or City.
- Status Filter Tabs with live count badges (`All`, `Pending`, `Atelier Packed`, `In Transit`, `Out for Delivery`, `Delivered`, `Refunded`).
- **1-Click Rapid Stage Advancement:**
  - `Pack Atelier →` (Moves order to BGC Packaging Facility)
  - `Dispatch Hub →` (Generates courier tracking code and logs package at Pasig Central Gateway)
  - `Out for Delivery →` (Dispatches with local courier rider Kuya Jonathan M.)
  - `Deliver ✓` (Marks consignment completed and signed)
- **1-Click Refund Action:** Instantly refunds payment and automatically restores garment quantities back into inventory.
- **Live Tracking Inspector:** Opens the Shopee/SHEIN tracking modal.

#### 3. Inventory & Stock Matrix (`?tab=inventory`)
- Real-time stock matrix per garment and size variant (S, M, L, XL, XXL).
- **Interactive Stock Adjuster:** `−` and `+` decrement/increment buttons and direct numeric input that instantly persists to state and `localStorage`.
- Real-time status tags: `In Stock` (green), `Low Stock` (amber), `Sold Out` (red).

#### 4. Logistics & Dispatch Hub (`?tab=logistics`)
- Shopee / SHEIN 5-Stage command board with parcel count cards.
- Courier Fleet filter (`J&T Express PH`, `Flash Express`, `NinjaVan PH`).
- Active Dispatch Queue with 1-click buttons to push packages to the next hub.

#### 5. Promotions & Coupons (`?tab=promotions`)
- Storewide flash sale switch with interactive slider (**10% to 90% OFF**).
- Promo coupon voucher creator (Add code, discount %, campaign label).
- Per-garment individual markdown manager with preset discount buttons (`10%`, `20%`, `30%`, `50%`).

#### Global Tools:
- **Dataset Export:** 1-click export of filtered orders to **Excel (.xlsx)**, **CSV**, **TSV**, or **XML**.
- **Reset Seed State:** 1-click button to reset testing state back to the original 46 orders and clean stock.

---

## 5. Local Setup & Testing

### Installation
```bash
# Enter directory
cd e-commerce

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 6. Project Directory Map

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminInventoryTab.jsx      # Per-variant stock matrix & live adjustment
│   │   ├── AdminLogisticsTab.jsx      # Shopee/SHEIN 5-stage dispatch command board
│   │   ├── AdminOrdersTab.jsx         # Searchable orders ledger & 1-click stage advancers
│   │   ├── AdminOverviewTab.jsx       # KPIs, interactive filters, 4 Recharts graphs
│   │   ├── AdminPortalLayout.jsx      # Collapsible Left-Sidebar layout & hamburger toggle
│   │   ├── AdminPromotionsTab.jsx     # Flash sale engine, coupons & garment markdowns
│   │   └── ProtectedAdminRoute.jsx    # Session-based route guard
│   ├── ConsignmentTrackingModal.jsx   # Shopee/SHEIN live tracking modal
│   ├── CartDrawer.jsx                 # Slide-over cart with live size editing
│   ├── Header.jsx                     # Customer navigation header
│   └── ProductCard.jsx                # 4:5 fashion garment card
├── context/
│   ├── AuthContext.jsx                # User authentication state
│   └── StoreContext.jsx               # Global inventory, orders, cart, and rate limiting
├── lib/
│   ├── cache.js                       # L1 RAM + L2 SessionStorage tiered cache
│   ├── exportUtils.js                 # XLSX, CSV, TSV, XML & Retina Canvas PNG receipt
│   ├── pricing.js                     # Strict Philippine Peso (PHP) formatting
│   ├── rateLimiter.js                 # Sliding-window debounce & security rate limiter
│   └── tracking.js                    # Deterministic tracking metadata & hub routing
└── pages/
    ├── admin/
    │   └── AdminSecurityGate.jsx      # Standard password-based admin login
    ├── AccountOrdersPage.jsx          # Customer order history & live hub beacon
    ├── AdminDashboardPage.jsx         # Admin container routing to dedicated tabs
    ├── CataloguePage.jsx              # Filterable garment archive
    ├── CheckoutPage.jsx               # PHP multi-method checkout
    ├── LandingPage.jsx                # Streamlined 3-stage luxury funnel
    ├── ProductDetailPage.jsx          # Fit-first garment detail view
    └── ReceiptPage.jsx                # Order invoice & 5-stage tracking stepper
```
