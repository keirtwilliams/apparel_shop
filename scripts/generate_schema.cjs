const fs = require('fs');
const path = require('path');

const products = [
  {
    id: 'a0000001-0000-0000-0000-000000000001',
    name: 'Walk With Gød Tee',
    slug: 'walk-with-god-tee',
    category: 'Tops',
    price: 890.00,
    description: 'Avant-garde heavyweight architectural tee featuring the signature Purgatory triple-cross chest embroidery and high-definition "WALK WITH GØD" inferno back screenprint. Crafted with reinforced ribbed collar and dropped shoulder geometry.',
    material: '240 GSM 100% Combed Compact Cotton',
    fit_note: 'Boxy architectural cut · True to size · Model is 5\'9" wearing size L',
    care: 'Cold machine wash inside-out · Hang dry in shade · Do not iron print',
    images: ['/products/img1-front.png', '/products/img1-back.png'],
    variants: [
      { id: 'b0000001-0001-0000-0000-000000000001', color: 'Chalk White', hex: '#FAF9F7', size: 'S', stock: 12 },
      { id: 'b0000001-0002-0000-0000-000000000002', color: 'Chalk White', hex: '#FAF9F7', size: 'M', stock: 18 },
      { id: 'b0000001-0003-0000-0000-000000000003', color: 'Chalk White', hex: '#FAF9F7', size: 'L', stock: 3 }, // Low stock
      { id: 'b0000001-0004-0000-0000-000000000004', color: 'Chalk White', hex: '#FAF9F7', size: 'XL', stock: 8 }
    ]
  },
  {
    id: 'a0000001-0000-0000-0000-000000000002',
    name: 'Godspeed Rosary Tee',
    slug: 'godspeed-rosary-tee',
    category: 'Tops',
    price: 890.00,
    description: 'Iconic gothic drape tee adorned with full chest oversized rosary bead illustration and sleek vertical "Godspeed" blackletter typography along the lateral seam.',
    material: '240 GSM Combed Ring-Spun Cotton',
    fit_note: 'Relaxed boxy silhouette · True to size · Model is 5\'11" wearing size L',
    care: 'Hand wash or gentle cycle cold · Do not tumble dry · Dry flat',
    images: ['/products/img2-front.png', '/products/img2-back.png'],
    variants: [
      { id: 'b0000002-0001-0000-0000-000000000001', color: 'Bone White', hex: '#F5F4F0', size: 'S', stock: 14 },
      { id: 'b0000002-0002-0000-0000-000000000002', color: 'Bone White', hex: '#F5F4F0', size: 'M', stock: 4 }, // Low stock
      { id: 'b0000002-0003-0000-0000-000000000003', color: 'Bone White', hex: '#F5F4F0', size: 'L', stock: 15 },
      { id: 'b0000002-0004-0000-0000-000000000004', color: 'Bone White', hex: '#F5F4F0', size: 'XL', stock: 6 }
    ]
  },
  {
    id: 'a0000001-0000-0000-0000-000000000003',
    name: 'In Money We Trust Tee',
    slug: 'in-money-we-trust-tee',
    category: 'Tops',
    price: 890.00,
    description: 'Raw deconstructed street tee showcasing the archival monetary collage graphics across the chest with bold "ALL WE NEED IS MONEY" graffiti typography across the back.',
    material: '240 GSM Heavyweight Organic Cotton',
    fit_note: 'Tailored boxy drape · Drop shoulders · Model is 5\'8" wearing size M',
    care: 'Machine wash 30°C · Do not bleach · Iron on reverse side',
    images: ['/products/img3-front.png', '/products/img3-back.png'],
    variants: [
      { id: 'b0000003-0001-0000-0000-000000000001', color: 'Vintage White', hex: '#F4F2EC', size: 'S', stock: 2 }, // Low stock
      { id: 'b0000003-0002-0000-0000-000000000002', color: 'Vintage White', hex: '#F4F2EC', size: 'M', stock: 20 },
      { id: 'b0000003-0003-0000-0000-000000000003', color: 'Vintage White', hex: '#F4F2EC', size: 'L', stock: 11 },
      { id: 'b0000003-0004-0000-0000-000000000004', color: 'Vintage White', hex: '#F4F2EC', size: 'XL', stock: 5 } // Low stock
    ]
  },
  {
    id: 'a0000001-0000-0000-0000-000000000004',
    name: 'Purgatory OG Green Tee',
    slug: 'purgatory-og-green-tee',
    category: 'Tops',
    price: 850.00,
    description: 'The foundation of the Purgatory permanent archive. Features the signature forest-green puff print logotype on the chest and contrasting botanical silhouette artwork on the reverse.',
    material: '240 GSM Compact Combed Cotton',
    fit_note: 'Standard boxy fit · True to size · Model is 5\'10" wearing size L',
    care: 'Cold wash · Line dry · Do not dry clean',
    images: ['/products/img4-front.png', '/products/img4-back.png'],
    variants: [
      { id: 'b0000004-0001-0000-0000-000000000001', color: 'Museum White', hex: '#FAF9F7', size: 'S', stock: 16 },
      { id: 'b0000004-0002-0000-0000-000000000002', color: 'Museum White', hex: '#FAF9F7', size: 'M', stock: 25 },
      { id: 'b0000004-0003-0000-0000-000000000003', color: 'Museum White', hex: '#FAF9F7', size: 'L', stock: 18 },
      { id: 'b0000004-0004-0000-0000-000000000004', color: 'Museum White', hex: '#FAF9F7', size: 'XL', stock: 3 } // Low stock
    ]
  },
  {
    id: 'a0000001-0000-0000-0000-000000000005',
    name: 'Icons Grid Tee',
    slug: 'icons-grid-tee',
    category: 'Tops',
    price: 920.00,
    description: 'Curated 10-portrait cultural icon collage rendered in high-density monochrome plastisol ink on museum-weight cotton jersey. Minimalist clean back panel.',
    material: '250 GSM High-Density Cotton Jersey',
    fit_note: 'Oversized drape · Model is 5\'7" wearing size S',
    care: 'Gentle cycle cold · Do not tumble dry · Dry in shade',
    images: ['/products/img5-front.png', '/products/img5-back.png'],
    variants: [
      { id: 'b0000005-0001-0000-0000-000000000001', color: 'Optic White', hex: '#FFFFFF', size: 'S', stock: 10 },
      { id: 'b0000005-0002-0000-0000-000000000002', color: 'Optic White', hex: '#FFFFFF', size: 'M', stock: 14 },
      { id: 'b0000005-0003-0000-0000-000000000003', color: 'Optic White', hex: '#FFFFFF', size: 'L', stock: 2 }, // Low stock
      { id: 'b0000005-0004-0000-0000-000000000004', color: 'Optic White', hex: '#FFFFFF', size: 'XL', stock: 7 }
    ]
  },
  {
    id: 'a0000001-0000-0000-0000-000000000006',
    name: 'Skull Pile Graphic Tee',
    slug: 'skull-pile-graphic-tee',
    category: 'Tops',
    price: 920.00,
    description: 'High-contrast macabre anatomical skull cluster illustrated across the abdomen with ironic retro digital block typography on the rear panel. Heavyweight hand-feel.',
    material: '240 GSM 100% Combed Cotton',
    fit_note: 'Boxy streetwear cut · True to size · Model is 6\'0" wearing size XL',
    care: 'Wash cold inside-out · Line dry · Avoid ironing direct on ink',
    images: ['/products/img6-front.png', '/products/img6-back.png'],
    variants: [
      { id: 'b0000006-0001-0000-0000-000000000001', color: 'Off-White', hex: '#F6F5F2', size: 'S', stock: 8 },
      { id: 'b0000006-0002-0000-0000-000000000002', color: 'Off-White', hex: '#F6F5F2', size: 'M', stock: 12 },
      { id: 'b0000006-0003-0000-0000-000000000003', color: 'Off-White', hex: '#F6F5F2', size: 'L', stock: 9 },
      { id: 'b0000006-0004-0000-0000-000000000004', color: 'Off-White', hex: '#F6F5F2', size: 'XL', stock: 1 } // Low stock
    ]
  }
];

// Generate 40 synthetic orders
const customerPool = [
  { name: 'Marcus V. Thorne', email: 'marcus.thorne@gmail.com', address: 'Unit 18B One Serendra, BGC, Taguig City, Philippines' },
  { name: 'Elena R. Santos', email: 'elena.santos94@gmail.com', address: '124 Legaspi St, Makati City, Metro Manila, Philippines' },
  { name: 'Julian K. Vance', email: 'julian.vance@gmail.com', address: '45 Emerald Ave, Ortigas Center, Pasig City, Philippines' },
  { name: 'Chloe M. Alcantara', email: 'chloe.alcantara@gmail.com', address: '88 Katipunan Ave, Loyola Heights, Quezon City, Philippines' },
  { name: 'Dominic F. Reyes', email: 'dom.reyes2026@gmail.com', address: 'Unit 402 Rockwell Center, Makati City, Philippines' },
  { name: 'Sophia L. Tan', email: 'sophia.tan.design@gmail.com', address: '22 Sunset Drive, Greenhills, San Juan, Philippines' },
  { name: 'Rafael D. Cruz', email: 'rafael.cruz88@gmail.com', address: '15 Jupiter St, Bel-Air, Makati City, Philippines' },
  { name: 'Hannah B. Lim', email: 'hannah.lim.studio@gmail.com', address: 'Unit 7C The Proscenium, Rockwell, Makati City, Philippines' },
  { name: 'Gabriel T. Mendoza', email: 'gabriel.mendoza@gmail.com', address: '502 Acacia Ave, Ayala Alabang, Muntinlupa, Philippines' },
  { name: 'Isabella N. Garcia', email: 'isabella.garcia@gmail.com', address: '78 McKinley Hill Rd, Taguig City, Philippines' },
  { name: 'Christian P. Navarro', email: 'chris.navarro@gmail.com', address: 'Unit 12A Pacific Plaza Towers, BGC, Taguig City, Philippines' },
  { name: 'Bea A. Valenzuela', email: 'bea.valenzuela@gmail.com', address: '33 Scout Gandia, Tomas Morato, Quezon City, Philippines' }
];

const paymentMethods = ['Test Card', 'GCash', 'COD'];
const statuses = ['delivered', 'delivered', 'shipped', 'shipped', 'pending', 'refunded'];

const allVariants = [];
products.forEach(p => {
  p.variants.forEach(v => {
    allVariants.push({
      variant_id: v.id,
      product_id: p.id,
      product_name: p.name,
      category: p.category,
      price: p.price,
      size: v.size,
      color: v.color
    });
  });
});

const orders = [];
const orderItems = [];

const now = new Date('2026-11-23T18:00:00Z');

for (let i = 1; i <= 40; i++) {
  const orderId = `c0000001-0000-0000-0000-${String(i).padStart(12, '0')}`;
  const cust = customerPool[(i - 1) % customerPool.length];

  // Spread orders over last 28 days
  const daysAgo = Math.floor(((40 - i) / 40) * 28);
  const hoursAgo = (i * 7) % 24;
  const orderDate = new Date(now.getTime() - (daysAgo * 86400000 + hoursAgo * 3600000));

  const paymentMethod = paymentMethods[i % paymentMethods.length];
  const status = statuses[i % statuses.length];
  const paymentStatus = status === 'refunded' ? 'refunded' : 'paid';

  // 1 to 3 items per order
  const itemCount = (i % 3) + 1;
  let totalAmount = 0;

  for (let j = 0; j < itemCount; j++) {
    const itemIndex = (i * 3 + j) % allVariants.length;
    const v = allVariants[itemIndex];
    const qty = (j === 0 && i % 4 === 0) ? 2 : 1;
    const unitPrice = v.price;
    totalAmount += unitPrice * qty;

    orderItems.push({
      id: `d0000001-${String(i).padStart(4, '0')}-0000-0000-${String(j + 1).padStart(12, '0')}`,
      order_id: orderId,
      variant_id: v.variant_id,
      quantity: qty,
      unit_price: unitPrice,
      product_name: v.product_name,
      category: v.category,
      size: v.size
    });
  }

  orders.push({
    id: orderId,
    customer_name: cust.name,
    customer_email: cust.email,
    shipping_address: cust.address,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    status: status,
    total_amount: totalAmount,
    created_at: orderDate.toISOString()
  });
}

// Write schema.sql
let sql = `-- ============================================================
-- PURGATØRY E-COMMERCE DATABASE SCHEMA, TRIGGERS & SEED DATA
-- Platform: Supabase (PostgreSQL 15+)
-- Stack: React (Vite) + Tailwind CSS + Supabase + Recharts
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. DATABASE TABLES (5 CORE TABLES)
-- ============================================================

-- A. PROFILES TABLE (Linked directly to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- B. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Tops', 'Bottoms', 'Outerwear', 'Footwear')),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2) CHECK (compare_at_price >= 0),
    description TEXT,
    material TEXT,
    fit_note TEXT,
    care TEXT,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- C. PRODUCT VARIANTS TABLE (Colors, Sizes, Stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL')),
    stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- D. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Test Card', 'GCash', 'COD')),
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'refunded')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'refunded')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- E. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- 2. INDEXES FOR HIGH-PERFORMANCE ANALYTICS & FILTERING
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(stock_count);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- ============================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================

-- Helper: Check if active user is Admin without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- A. Auto-Create Profile Trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'customer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- B. Real-Time Stock Management Trigger on Orders
-- Decrement stock on 'pending' -> 'shipped'
-- Restore stock on 'shipped'/'delivered' -> 'refunded' and set payment_status = 'refunded'
CREATE OR REPLACE FUNCTION public.handle_order_inventory_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Deduct stock upon transition to 'shipped'
    IF (OLD.status = 'pending' AND NEW.status = 'shipped') THEN
        UPDATE public.product_variants pv
        SET stock_count = GREATEST(0, pv.stock_count - oi.quantity)
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id AND pv.id = oi.variant_id;
    END IF;

    -- 2. Restore stock upon transition to 'refunded' from 'shipped' or 'delivered'
    IF (NEW.status = 'refunded' AND OLD.status IN ('shipped', 'delivered')) THEN
        UPDATE public.product_variants pv
        SET stock_count = pv.stock_count + oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id AND pv.id = oi.variant_id;
        
        NEW.payment_status := 'refunded';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_order_inventory_sync ON public.orders;
CREATE TRIGGER trigger_order_inventory_sync
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_inventory_sync();

-- ============================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins view all"
ON public.profiles FOR SELECT
USING (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

-- Security Hardening: Users can update own profile, but CANNOT elevate their own role to 'admin'
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (id = (SELECT auth.uid()))
WITH CHECK (
    id = (SELECT auth.uid()) 
    AND (role = (SELECT role FROM public.profiles WHERE id = (SELECT auth.uid())) OR (SELECT public.is_admin()))
);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
ON public.products FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
USING ((SELECT public.is_admin()));

-- PRODUCT VARIANTS POLICIES
DROP POLICY IF EXISTS "Public can view product variants" ON public.product_variants;
CREATE POLICY "Public can view product variants"
ON public.product_variants FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert product variants" ON public.product_variants;
CREATE POLICY "Admins can insert product variants"
ON public.product_variants FOR INSERT
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can update product variants" ON public.product_variants;
CREATE POLICY "Admins can update product variants"
ON public.product_variants FOR UPDATE
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete product variants" ON public.product_variants;
CREATE POLICY "Admins can delete product variants"
ON public.product_variants FOR DELETE
USING ((SELECT public.is_admin()));

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Public and customers can create orders" ON public.orders;
CREATE POLICY "Public and customers can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Customers view own orders, admins view all" ON public.orders;
CREATE POLICY "Customers view own orders, admins view all"
ON public.orders FOR SELECT
USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
ON public.orders FOR DELETE
USING ((SELECT public.is_admin()));

-- ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Public and customers can insert order items" ON public.order_items;
CREATE POLICY "Public and customers can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Customers view own order items, admins view all" ON public.order_items;
CREATE POLICY "Customers view own order items, admins view all"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND (o.user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
    )
);

-- ============================================================
-- 5. SUPABASE STORAGE BUCKET SETUP (PRODUCT IMAGES)
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access for Product Images" ON storage.objects;
CREATE POLICY "Public Access for Product Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins Can Upload Images" ON storage.objects;
CREATE POLICY "Admins Can Upload Images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins Can Update Images" ON storage.objects;
CREATE POLICY "Admins Can Update Images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND (SELECT public.is_admin()))
WITH CHECK (bucket_id = 'product-images' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins Can Delete Images" ON storage.objects;
CREATE POLICY "Admins Can Delete Images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND (SELECT public.is_admin()));

-- ============================================================
-- 6. SYNTHETIC SEED DATA: PURGATØRY CATALOGUE (8 PRODUCTS)
-- ============================================================
`;

// Products INSERT
products.forEach(p => {
  const imgArray = `ARRAY[${p.images.map(img => `'${img}'`).join(', ')}]`;
  const compareAtSql = p.compare_at_price ? `${Number(p.compare_at_price).toFixed(2)}` : 'NULL';
  sql += `
INSERT INTO public.products (id, name, slug, category, price, compare_at_price, description, material, fit_note, care, images)
VALUES (
    '${p.id}',
    '${p.name.replace(/'/g, "''")}',
    '${p.slug}',
    '${p.category}',
    ${p.price.toFixed(2)},
    ${compareAtSql},
    '${p.description.replace(/'/g, "''")}',
    '${p.material.replace(/'/g, "''")}',
    '${p.fit_note.replace(/'/g, "''")}',
    '${p.care.replace(/'/g, "''")}',
    ${imgArray}
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    images = EXCLUDED.images;
`;

  p.variants.forEach(v => {
    sql += `INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('${v.id}', '${p.id}', '${v.color}', '${v.hex}', '${v.size}', ${v.stock})
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
`;
  });
});

sql += `
-- ============================================================
-- 7. SYNTHETIC SEED DATA: 40 ORDERS & ORDER ITEMS (LAST 30 DAYS)
-- ============================================================
`;

orders.forEach(o => {
  sql += `INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    '${o.id}',
    '${o.customer_name.replace(/'/g, "''")}',
    '${o.customer_email}',
    '${o.shipping_address.replace(/'/g, "''")}',
    '${o.payment_method}',
    '${o.payment_status}',
    '${o.status}',
    ${o.total_amount.toFixed(2)},
    '${o.created_at}'
) ON CONFLICT (id) DO NOTHING;
`;
});

orderItems.forEach(oi => {
  sql += `INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('${oi.id}', '${oi.order_id}', '${oi.variant_id}', ${oi.quantity}, ${oi.unit_price.toFixed(2)})
ON CONFLICT (id) DO NOTHING;
`;
});

fs.writeFileSync(path.join(__dirname, '../supabase/schema.sql'), sql, 'utf-8');
console.log('Successfully generated supabase/schema.sql!');

// Also write initialData.json for full frontend offline-first compatibility
const fullLocalData = {
  products: products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: p.price,
    description: p.description,
    material: p.material,
    fit_note: p.fit_note,
    care: p.care,
    images: p.images,
    variants: p.variants.map(v => ({
      id: v.id,
      color_name: v.color,
      color_hex: v.hex,
      size: v.size,
      stock_count: v.stock
    }))
  })),
  orders: orders.map(o => ({
    ...o,
    items: orderItems.filter(oi => oi.order_id === o.id).map(oi => ({
      id: oi.id,
      order_id: oi.order_id,
      variant_id: oi.variant_id,
      product_name: oi.product_name,
      category: oi.category,
      size: oi.size,
      quantity: oi.quantity,
      unit_price: oi.unit_price
    }))
  }))
};

fs.writeFileSync(path.join(__dirname, '../src/data/initialData.json'), JSON.stringify(fullLocalData, null, 2), 'utf-8');
console.log('Successfully updated src/data/initialData.json!');
