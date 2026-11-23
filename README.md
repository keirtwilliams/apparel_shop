# MONOKROM — Architectural Apparel & Functional Essentials
> **Production-Ready 3–4 Day MVP Clothing E-Commerce Web App & Admin Dashboard**
> Built with **React (Vite) + Tailwind CSS + Supabase + Recharts + write-excel-file**

---

## 1. Brand & Design System Philosophy

**MONOKROM** is a minimalist, high-end apparel label engineered around architectural silhouettes, heavy-density organic cottons, virgin tropical wools, and Japanese technical textiles.

### Strict Anti-AI-Slop Compliance
- **No Pure Colors:** Never `#FFFFFF` or `#000000`. We strictly employ warm museum canvas `#FAF9F7` and charcoal ink `#1C1C1B`.
- **Zero Bloat:** No popup modals, no countdown timers, no fake badges, no floating elements, and no bloated marketing banners.
- **Micro-interactivity:** Tactile button states, instant filter updates without page reloads, and tabular numerals on all prices, stock counts, and financial totals.

### Color Tokens
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| **Canvas** | `#FAF9F7` | Body background, modal base |
| **Surface** | `#F2F1EE` | Secondary containers, inputs, table headers |
| **Surface Subtle** | `#EAE9E5` | Hover backgrounds, secondary button states |
| **Primary** | `#1C1C1B` | Core text, primary buttons, monogram |
| **Muted** | `#575654` | Labels, specifications, metadata |
| **Border** | `#E5E4E0` | Tight `1px solid` architectural borders |
| **Success** | `#2E5A44` | In-stock tags, paid indicators, free shipping |
| **Danger / Low-Stock** | `#9E3B33` | Stock alerts (`≤ 5 units`), refunds, errors |

---

## 2. Core Architecture & Tech Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS 3, React Router v6.
- **State Management:** `StoreContext` syncing cart state to `localStorage` and maintaining optimistic local data for immediate demo readiness.
- **Analytics & Visualizations:** **Recharts** powering 4 linked real-time charts.
- **Client-Side Data Exports:** **`write-excel-file/browser`** for native `.xlsx` workbooks; Native JS `Blob` for `.csv`, `.tsv`, and `.xml`.
- **Backend & Database:** Supabase (`@supabase/supabase-js` v2 singleton in `src/lib/supabase.js`) + PostgreSQL RLS policies + inventory trigger automations.
- **Data Integrity:** Real-time stock reservation, low-stock flagging, and 1-click refund stock recovery.

---

## 3. Database Schema & Inventory Automation

The database runs on Supabase (PostgreSQL) with 2-role RBAC (`customer` and `admin`) and Row-Level Security:

### Tables
1. `profiles`: `id` (FK to `auth.users`), `email`, `full_name`, `role` (`'customer' | 'admin'`), `created_at`
2. `products`: `id`, `name`, `slug`, `category`, `price`, `description`, `material`, `fit_note`, `care`, `images[]`, `created_at`
3. `product_variants`: `id`, `product_id`, `color_name`, `color_hex`, `size`, `stock_count`
4. `orders`: `id`, `user_id`, `customer_name`, `customer_email`, `shipping_address`, `payment_method`, `payment_status`, `status`, `total_amount`, `created_at`
5. `order_items`: `id`, `order_id`, `variant_id`, `quantity`, `unit_price`, `created_at`

### PostgreSQL Triggers (`supabase/schema.sql`)
- **Stock Decrement on Purchase:**
  ```sql
  CREATE TRIGGER trigger_decrement_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_stock_decrement();
  ```
- **Stock Restoration on Refund:**
  ```sql
  CREATE TRIGGER trigger_restore_stock_on_refund
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_stock_restore_on_refund();
  ```

---

## 4. Key Features & Demo Flow

### A. Clutter-Free 4:5 Apparel Catalogue (`/`)
- Shows **ONLY 4 elements**: 4:5 photograph, title, price (`tabular-nums`), and color swatch dots.
- Instant, no-reload filters:
  - **Category:** All, Tops, Bottoms, Outerwear, Footwear
  - **Size:** All, S, M, L, XL
  - **Price Range & Sort:** Featured, Price Ascending, Price Descending, Alphabetical
  - **Search:** Instant matching across name, fabric, and silhouette

### B. Fit-First Product Pages (`/product/:slug`)
- 4:5 dual-photo gallery with thumbnail switcher.
- **1-Line Fit Tag** positioned right above size pills.
- **Clickable S / M / L / XL size pills** that auto-disable with strikethrough styling when `stock_count === 0`.
- **Real-Time Stock Warning:** Dynamic alert (`Only X remaining in stock`) whenever `stock_count <= 5`.
- **1-Click Size Chart Modal:** High-precision garment measurements with instant `CM` and `INCHES` toggle.
- **3 Upfront Specs:** Accordions for **Material**, **Fit**, and **Care**.
- **Mobile Sticky "Add to Bag" Bar:** Strict `44px` minimum tap target.

### C. Editable Slide-Over Cart Drawer
- Open from any page without navigation interruption.
- Inline size dropdown to swap sizes directly inside the drawer.
- Stepper controls (`-`, `+`) with automatic stock limit clamping.
- Complimentary shipping progress indicator ($150 threshold).

### D. Multi-Method Checkout & Receipts (`/checkout` & `/receipt/:id`)
- Supports **Test Card** (`4242 4242 4242 4242`), **GCash**, and **Cash on Delivery (COD)**.
- Forgiving inline validation with upfront cost breakdowns.
- On order confirmation, stock counts decrement automatically.
- **Clean Printable Tax Invoice & Receipt** with fulfillment step tracker (`Pending` → `Shipped` → `Delivered`).

### E. Admin Intelligence & Operations Dashboard (`/admin`)
- **Role Switcher:** Instant `[ Customer ] | [ Admin ]` toggle in the header for frictionless testing.
- **4 Recharts Graphs:**
  1. *Revenue Over Time:* Daily financial volume and orders area chart.
  2. *Sales by Category:* Segment gross revenue comparison.
  3. *Order Status Breakdown:* Donut chart of Delivered, Shipped, Pending, Refunded.
  4. *Variant Inventory Levels:* Horizontal bar chart flagging variants with stock `≤ 5` in `#9E3B33`.
- **3 Shared Interactive Filters:** Date Range (7D, 14D, 30D, All), Category, and Order Status update all 4 charts and KPI cards simultaneously.
- **Real-Time Low-Stock Alerts Banner:** Highlights all variants with `stock_count <= 5`.
- **Multi-Format Client-Side Data Export:** 1-click export of the active filtered dataset to **CSV, XLSX (Excel), XML, and TSV**.
- **1-Click Refund Action:** Instantly marks order as refunded and restores variant inventory in real time.

---

## 5. Quickstart & Local Setup

### Installation
```bash
# Clone and enter workspace
cd e-commerce

# Install dependencies
npm install

# Start development server
npm run dev
```

### Connecting Live Supabase (Optional)
The application includes high-fidelity synthetic seed data (46 realistic orders, 8 products, 32 variants) out of the box.

To connect your live Supabase backend:
1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL schema found in `supabase/schema.sql` in the Supabase SQL Editor.
3. Run `supabase/seed.sql` to populate initial products and synthetic orders.
4. Copy `.env.example` to `.env.local` and add your project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart Vite (`npm run dev`).

---

## 6. Deployment to Vercel

```bash
# Build verification
npm run build

# Deploy via Vercel CLI or Git integration
vercel --prod
```

---

## 7. 3–4 Day MVP Milestone Breakdown

- **Day 1: Design Tokens, Schema & Curated Seed Data**
  - Setup Vite + Tailwind CSS with strict `#FAF9F7` / `#1C1C1B` tokens.
  - Implement Supabase SQL schema, RLS, and stock triggers (`trigger_decrement_stock`, `trigger_restore_stock_on_refund`).
  - Seed 46 synthetic orders over the last 30 days and 4:5 fashion catalogue.
- **Day 2: Storefront, Catalogue & Fit-First PDP**
  - Build clutter-free 4:5 product cards (image, title, price, swatches).
  - Implement no-reload instant category, size, price, and search filtering.
  - Build PDP with 1-line fit tag, disabled size pills on stockout, 1-click size chart, and specs accordions.
- **Day 3: Slide-Over Cart, Single-Page Checkout & Receipts**
  - Implement cart drawer with inline size editing and shipping threshold progress.
  - Multi-method checkout (Test Card `4242...`, GCash, COD) with stock reservation.
  - Printable receipt with live step tracker.
- **Day 4: Admin Dashboard, 4 Recharts & Exports**
  - Implement 4 Recharts graphs linked to 3 shared interactive filters.
  - Real-time low-stock alerts (`stock_count <= 5`).
  - Client-side export dropdown (CSV, XLSX, XML, TSV).
  - 1-click refund stock restoration.
