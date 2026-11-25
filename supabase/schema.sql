-- ============================================================
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

INSERT INTO public.products (id, name, slug, category, price, compare_at_price, description, material, fit_note, care, images)
VALUES (
    'a0000001-0000-0000-0000-000000000001',
    'Walk With Gød Tee',
    'walk-with-god-tee',
    'Tops',
    890.00,
    NULL,
    'Avant-garde heavyweight architectural tee featuring the signature Purgatory triple-cross chest embroidery and high-definition "WALK WITH GØD" inferno back screenprint. Crafted with reinforced ribbed collar and dropped shoulder geometry.',
    '240 GSM 100% Combed Compact Cotton',
    'Boxy architectural cut · True to size · Model is 5''9" wearing size L',
    'Cold machine wash inside-out · Hang dry in shade · Do not iron print',
    ARRAY['/products/img1-front.png', '/products/img1-back.png']
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    images = EXCLUDED.images;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000001-0001-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Chalk White', '#FAF9F7', 'S', 12)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000001-0002-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Chalk White', '#FAF9F7', 'M', 18)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000001-0003-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Chalk White', '#FAF9F7', 'L', 3)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000001-0004-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Chalk White', '#FAF9F7', 'XL', 8)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;

INSERT INTO public.products (id, name, slug, category, price, compare_at_price, description, material, fit_note, care, images)
VALUES (
    'a0000001-0000-0000-0000-000000000002',
    'Godspeed Rosary Tee',
    'godspeed-rosary-tee',
    'Tops',
    890.00,
    NULL,
    'Iconic gothic drape tee adorned with full chest oversized rosary bead illustration and sleek vertical "Godspeed" blackletter typography along the lateral seam.',
    '240 GSM Combed Ring-Spun Cotton',
    'Relaxed boxy silhouette · True to size · Model is 5''11" wearing size L',
    'Hand wash or gentle cycle cold · Do not tumble dry · Dry flat',
    ARRAY['/products/img2-front.png', '/products/img2-back.png']
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    images = EXCLUDED.images;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000002-0001-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'Bone White', '#F5F4F0', 'S', 14)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000002-0002-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'Bone White', '#F5F4F0', 'M', 4)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000002-0003-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000002', 'Bone White', '#F5F4F0', 'L', 15)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000002-0004-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000002', 'Bone White', '#F5F4F0', 'XL', 6)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;

INSERT INTO public.products (id, name, slug, category, price, compare_at_price, description, material, fit_note, care, images)
VALUES (
    'a0000001-0000-0000-0000-000000000003',
    'In Money We Trust Tee',
    'in-money-we-trust-tee',
    'Tops',
    890.00,
    NULL,
    'Raw deconstructed street tee showcasing the archival monetary collage graphics across the chest with bold "ALL WE NEED IS MONEY" graffiti typography across the back.',
    '240 GSM Heavyweight Organic Cotton',
    'Tailored boxy drape · Drop shoulders · Model is 5''8" wearing size M',
    'Machine wash 30°C · Do not bleach · Iron on reverse side',
    ARRAY['/products/img3-front.png', '/products/img3-back.png']
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    images = EXCLUDED.images;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000003-0001-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'Vintage White', '#F4F2EC', 'S', 2)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000003-0002-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000003', 'Vintage White', '#F4F2EC', 'M', 20)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000003-0003-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'Vintage White', '#F4F2EC', 'L', 11)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000003-0004-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000003', 'Vintage White', '#F4F2EC', 'XL', 5)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;

INSERT INTO public.products (id, name, slug, category, price, compare_at_price, description, material, fit_note, care, images)
VALUES (
    'a0000001-0000-0000-0000-000000000004',
    'Purgatory OG Green Tee',
    'purgatory-og-green-tee',
    'Tops',
    850.00,
    NULL,
    'The foundation of the Purgatory permanent archive. Features the signature forest-green puff print logotype on the chest and contrasting botanical silhouette artwork on the reverse.',
    '240 GSM Compact Combed Cotton',
    'Standard boxy fit · True to size · Model is 5''10" wearing size L',
    'Cold wash · Line dry · Do not dry clean',
    ARRAY['/products/img4-front.png', '/products/img4-back.png']
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    images = EXCLUDED.images;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000004-0001-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004', 'Museum White', '#FAF9F7', 'S', 16)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000004-0002-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000004', 'Museum White', '#FAF9F7', 'M', 25)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000004-0003-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000004', 'Museum White', '#FAF9F7', 'L', 18)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000004-0004-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'Museum White', '#FAF9F7', 'XL', 3)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;

INSERT INTO public.products (id, name, slug, category, price, compare_at_price, description, material, fit_note, care, images)
VALUES (
    'a0000001-0000-0000-0000-000000000005',
    'Icons Grid Tee',
    'icons-grid-tee',
    'Tops',
    920.00,
    NULL,
    'Curated 10-portrait cultural icon collage rendered in high-density monochrome plastisol ink on museum-weight cotton jersey. Minimalist clean back panel.',
    '250 GSM High-Density Cotton Jersey',
    'Oversized drape · Model is 5''7" wearing size S',
    'Gentle cycle cold · Do not tumble dry · Dry in shade',
    ARRAY['/products/img5-front.png', '/products/img5-back.png']
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    images = EXCLUDED.images;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000005-0001-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000005', 'Optic White', '#FFFFFF', 'S', 10)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000005-0002-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000005', 'Optic White', '#FFFFFF', 'M', 14)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000005-0003-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000005', 'Optic White', '#FFFFFF', 'L', 2)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000005-0004-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000005', 'Optic White', '#FFFFFF', 'XL', 7)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;

INSERT INTO public.products (id, name, slug, category, price, compare_at_price, description, material, fit_note, care, images)
VALUES (
    'a0000001-0000-0000-0000-000000000006',
    'Skull Pile Graphic Tee',
    'skull-pile-graphic-tee',
    'Tops',
    920.00,
    NULL,
    'High-contrast macabre anatomical skull cluster illustrated across the abdomen with ironic retro digital block typography on the rear panel. Heavyweight hand-feel.',
    '240 GSM 100% Combed Cotton',
    'Boxy streetwear cut · True to size · Model is 6''0" wearing size XL',
    'Wash cold inside-out · Line dry · Avoid ironing direct on ink',
    ARRAY['/products/img6-front.png', '/products/img6-back.png']
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    images = EXCLUDED.images;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000006-0001-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000006', 'Off-White', '#F6F5F2', 'S', 8)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000006-0002-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000006', 'Off-White', '#F6F5F2', 'M', 12)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000006-0003-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000006', 'Off-White', '#F6F5F2', 'L', 9)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;
INSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)
VALUES ('b0000006-0004-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000006', 'Off-White', '#F6F5F2', 'XL', 1)
ON CONFLICT (id) DO UPDATE SET stock_count = EXCLUDED.stock_count;

-- ============================================================
-- 7. SYNTHETIC SEED DATA: 40 ORDERS & ORDER ITEMS (LAST 30 DAYS)
-- ============================================================
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000001',
    'Marcus V. Thorne',
    'marcus.thorne@gmail.com',
    'Unit 18B One Serendra, BGC, Taguig City, Philippines',
    'GCash',
    'paid',
    'delivered',
    1780.00,
    '2026-10-27T11:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000002',
    'Elena R. Santos',
    'elena.santos94@gmail.com',
    '124 Legaspi St, Makati City, Metro Manila, Philippines',
    'COD',
    'paid',
    'shipped',
    2670.00,
    '2026-10-28T04:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000003',
    'Julian K. Vance',
    'julian.vance@gmail.com',
    '45 Emerald Ave, Ortigas Center, Pasig City, Philippines',
    'Test Card',
    'paid',
    'shipped',
    890.00,
    '2026-10-28T21:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000004',
    'Chloe M. Alcantara',
    'chloe.alcantara@gmail.com',
    '88 Katipunan Ave, Loyola Heights, Quezon City, Philippines',
    'GCash',
    'paid',
    'pending',
    2550.00,
    '2026-10-29T14:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000005',
    'Dominic F. Reyes',
    'dom.reyes2026@gmail.com',
    'Unit 402 Rockwell Center, Makati City, Philippines',
    'COD',
    'refunded',
    'refunded',
    2690.00,
    '2026-10-30T07:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000006',
    'Sophia L. Tan',
    'sophia.tan.design@gmail.com',
    '22 Sunset Drive, Greenhills, San Juan, Philippines',
    'Test Card',
    'paid',
    'delivered',
    920.00,
    '2026-10-31T00:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000007',
    'Rafael D. Cruz',
    'rafael.cruz88@gmail.com',
    '15 Jupiter St, Bel-Air, Makati City, Philippines',
    'GCash',
    'paid',
    'delivered',
    1840.00,
    '2026-10-31T17:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000008',
    'Hannah B. Lim',
    'hannah.lim.studio@gmail.com',
    'Unit 7C The Proscenium, Rockwell, Makati City, Philippines',
    'COD',
    'paid',
    'shipped',
    3560.00,
    '2026-11-01T10:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000009',
    'Gabriel T. Mendoza',
    'gabriel.mendoza@gmail.com',
    '502 Acacia Ave, Ayala Alabang, Muntinlupa, Philippines',
    'Test Card',
    'paid',
    'shipped',
    890.00,
    '2026-11-02T03:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000010',
    'Isabella N. Garcia',
    'isabella.garcia@gmail.com',
    '78 McKinley Hill Rd, Taguig City, Philippines',
    'GCash',
    'paid',
    'pending',
    1780.00,
    '2026-11-01T20:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000011',
    'Christian P. Navarro',
    'chris.navarro@gmail.com',
    'Unit 12A Pacific Plaza Towers, BGC, Taguig City, Philippines',
    'COD',
    'refunded',
    'refunded',
    2670.00,
    '2026-11-03T13:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000012',
    'Bea A. Valenzuela',
    'bea.valenzuela@gmail.com',
    '33 Scout Gandia, Tomas Morato, Quezon City, Philippines',
    'Test Card',
    'paid',
    'delivered',
    1700.00,
    '2026-11-04T06:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000013',
    'Marcus V. Thorne',
    'marcus.thorne@gmail.com',
    'Unit 18B One Serendra, BGC, Taguig City, Philippines',
    'GCash',
    'paid',
    'delivered',
    1770.00,
    '2026-11-04T23:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000014',
    'Elena R. Santos',
    'elena.santos94@gmail.com',
    '124 Legaspi St, Makati City, Metro Manila, Philippines',
    'COD',
    'paid',
    'shipped',
    2760.00,
    '2026-11-05T16:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000015',
    'Julian K. Vance',
    'julian.vance@gmail.com',
    '45 Emerald Ave, Ortigas Center, Pasig City, Philippines',
    'Test Card',
    'paid',
    'shipped',
    920.00,
    '2026-11-06T09:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000016',
    'Chloe M. Alcantara',
    'chloe.alcantara@gmail.com',
    '88 Katipunan Ave, Loyola Heights, Quezon City, Philippines',
    'GCash',
    'paid',
    'pending',
    2670.00,
    '2026-11-07T02:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000017',
    'Dominic F. Reyes',
    'dom.reyes2026@gmail.com',
    'Unit 402 Rockwell Center, Makati City, Philippines',
    'COD',
    'refunded',
    'refunded',
    2670.00,
    '2026-11-06T19:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000018',
    'Sophia L. Tan',
    'sophia.tan.design@gmail.com',
    '22 Sunset Drive, Greenhills, San Juan, Philippines',
    'Test Card',
    'paid',
    'delivered',
    890.00,
    '2026-11-08T12:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000019',
    'Rafael D. Cruz',
    'rafael.cruz88@gmail.com',
    '15 Jupiter St, Bel-Air, Makati City, Philippines',
    'GCash',
    'paid',
    'delivered',
    1780.00,
    '2026-11-09T05:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000020',
    'Hannah B. Lim',
    'hannah.lim.studio@gmail.com',
    'Unit 7C The Proscenium, Rockwell, Makati City, Philippines',
    'COD',
    'paid',
    'shipped',
    3400.00,
    '2026-11-08T22:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000021',
    'Gabriel T. Mendoza',
    'gabriel.mendoza@gmail.com',
    '502 Acacia Ave, Ayala Alabang, Muntinlupa, Philippines',
    'Test Card',
    'paid',
    'shipped',
    850.00,
    '2026-11-10T15:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000022',
    'Isabella N. Garcia',
    'isabella.garcia@gmail.com',
    '78 McKinley Hill Rd, Taguig City, Philippines',
    'GCash',
    'paid',
    'pending',
    1840.00,
    '2026-11-11T08:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000023',
    'Christian P. Navarro',
    'chris.navarro@gmail.com',
    'Unit 12A Pacific Plaza Towers, BGC, Taguig City, Philippines',
    'COD',
    'refunded',
    'refunded',
    2760.00,
    '2026-11-12T01:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000024',
    'Bea A. Valenzuela',
    'bea.valenzuela@gmail.com',
    '33 Scout Gandia, Tomas Morato, Quezon City, Philippines',
    'Test Card',
    'paid',
    'delivered',
    1780.00,
    '2026-11-12T18:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000025',
    'Marcus V. Thorne',
    'marcus.thorne@gmail.com',
    'Unit 18B One Serendra, BGC, Taguig City, Philippines',
    'GCash',
    'paid',
    'delivered',
    1780.00,
    '2026-11-13T11:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000026',
    'Elena R. Santos',
    'elena.santos94@gmail.com',
    '124 Legaspi St, Makati City, Metro Manila, Philippines',
    'COD',
    'paid',
    'shipped',
    2670.00,
    '2026-11-14T04:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000027',
    'Julian K. Vance',
    'julian.vance@gmail.com',
    '45 Emerald Ave, Ortigas Center, Pasig City, Philippines',
    'Test Card',
    'paid',
    'shipped',
    890.00,
    '2026-11-13T21:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000028',
    'Chloe M. Alcantara',
    'chloe.alcantara@gmail.com',
    '88 Katipunan Ave, Loyola Heights, Quezon City, Philippines',
    'GCash',
    'paid',
    'pending',
    2550.00,
    '2026-11-15T14:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000029',
    'Dominic F. Reyes',
    'dom.reyes2026@gmail.com',
    'Unit 402 Rockwell Center, Makati City, Philippines',
    'COD',
    'refunded',
    'refunded',
    2690.00,
    '2026-11-16T07:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000030',
    'Sophia L. Tan',
    'sophia.tan.design@gmail.com',
    '22 Sunset Drive, Greenhills, San Juan, Philippines',
    'Test Card',
    'paid',
    'delivered',
    920.00,
    '2026-11-16T00:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000031',
    'Rafael D. Cruz',
    'rafael.cruz88@gmail.com',
    '15 Jupiter St, Bel-Air, Makati City, Philippines',
    'GCash',
    'paid',
    'delivered',
    1840.00,
    '2026-11-17T17:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000032',
    'Hannah B. Lim',
    'hannah.lim.studio@gmail.com',
    'Unit 7C The Proscenium, Rockwell, Makati City, Philippines',
    'COD',
    'paid',
    'shipped',
    3560.00,
    '2026-11-18T10:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000033',
    'Gabriel T. Mendoza',
    'gabriel.mendoza@gmail.com',
    '502 Acacia Ave, Ayala Alabang, Muntinlupa, Philippines',
    'Test Card',
    'paid',
    'shipped',
    890.00,
    '2026-11-19T03:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000034',
    'Isabella N. Garcia',
    'isabella.garcia@gmail.com',
    '78 McKinley Hill Rd, Taguig City, Philippines',
    'GCash',
    'paid',
    'pending',
    1780.00,
    '2026-11-18T20:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000035',
    'Christian P. Navarro',
    'chris.navarro@gmail.com',
    'Unit 12A Pacific Plaza Towers, BGC, Taguig City, Philippines',
    'COD',
    'refunded',
    'refunded',
    2670.00,
    '2026-11-20T13:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000036',
    'Bea A. Valenzuela',
    'bea.valenzuela@gmail.com',
    '33 Scout Gandia, Tomas Morato, Quezon City, Philippines',
    'Test Card',
    'paid',
    'delivered',
    1700.00,
    '2026-11-21T06:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000037',
    'Marcus V. Thorne',
    'marcus.thorne@gmail.com',
    'Unit 18B One Serendra, BGC, Taguig City, Philippines',
    'GCash',
    'paid',
    'delivered',
    1770.00,
    '2026-11-20T23:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000038',
    'Elena R. Santos',
    'elena.santos94@gmail.com',
    '124 Legaspi St, Makati City, Metro Manila, Philippines',
    'COD',
    'paid',
    'shipped',
    2760.00,
    '2026-11-22T16:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000039',
    'Julian K. Vance',
    'julian.vance@gmail.com',
    '45 Emerald Ave, Ortigas Center, Pasig City, Philippines',
    'Test Card',
    'paid',
    'shipped',
    920.00,
    '2026-11-23T09:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)
VALUES (
    'c0000001-0000-0000-0000-000000000040',
    'Chloe M. Alcantara',
    'chloe.alcantara@gmail.com',
    '88 Katipunan Ave, Loyola Heights, Quezon City, Philippines',
    'GCash',
    'paid',
    'pending',
    2670.00,
    '2026-11-23T02:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0001-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0001-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'b0000002-0001-0000-0000-000000000001', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0002-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', 'b0000002-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0002-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002', 'b0000002-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0002-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000002', 'b0000003-0001-0000-0000-000000000001', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0003-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003', 'b0000003-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0004-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004', 'b0000004-0001-0000-0000-000000000001', 2, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0004-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000004', 'b0000004-0002-0000-0000-000000000002', 1, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0005-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005', 'b0000004-0004-0000-0000-000000000004', 1, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0005-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000005', 'b0000005-0001-0000-0000-000000000001', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0005-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000005', 'b0000005-0002-0000-0000-000000000002', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0006-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006', 'b0000005-0003-0000-0000-000000000003', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0007-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000007', 'b0000006-0002-0000-0000-000000000002', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0007-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000007', 'b0000006-0003-0000-0000-000000000003', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0008-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008', 'b0000001-0001-0000-0000-000000000001', 2, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0008-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000008', 'b0000001-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0008-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000008', 'b0000001-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0009-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000009', 'b0000001-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0010-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000010', 'b0000002-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0010-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000010', 'b0000002-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0011-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000011', 'b0000003-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0011-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000011', 'b0000003-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0011-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000011', 'b0000003-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0012-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000012', 'b0000004-0001-0000-0000-000000000001', 2, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0013-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000013', 'b0000004-0004-0000-0000-000000000004', 1, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0013-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000013', 'b0000005-0001-0000-0000-000000000001', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0014-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000014', 'b0000005-0003-0000-0000-000000000003', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0014-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000014', 'b0000005-0004-0000-0000-000000000004', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0014-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000014', 'b0000006-0001-0000-0000-000000000001', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0015-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000015', 'b0000006-0002-0000-0000-000000000002', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0016-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000016', 'b0000001-0001-0000-0000-000000000001', 2, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0016-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000016', 'b0000001-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0017-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000017', 'b0000001-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0017-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000017', 'b0000002-0001-0000-0000-000000000001', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0017-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000017', 'b0000002-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0018-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000018', 'b0000002-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0019-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000019', 'b0000003-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0019-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000019', 'b0000003-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0020-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000020', 'b0000004-0001-0000-0000-000000000001', 2, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0020-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000020', 'b0000004-0002-0000-0000-000000000002', 1, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0020-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000020', 'b0000004-0003-0000-0000-000000000003', 1, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0021-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000021', 'b0000004-0004-0000-0000-000000000004', 1, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0022-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000022', 'b0000005-0003-0000-0000-000000000003', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0022-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000022', 'b0000005-0004-0000-0000-000000000004', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0023-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000023', 'b0000006-0002-0000-0000-000000000002', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0023-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000023', 'b0000006-0003-0000-0000-000000000003', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0023-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000023', 'b0000006-0004-0000-0000-000000000004', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0024-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000024', 'b0000001-0001-0000-0000-000000000001', 2, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0025-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000025', 'b0000001-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0025-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000025', 'b0000002-0001-0000-0000-000000000001', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0026-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000026', 'b0000002-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0026-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000026', 'b0000002-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0026-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000026', 'b0000003-0001-0000-0000-000000000001', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0027-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000027', 'b0000003-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0028-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000028', 'b0000004-0001-0000-0000-000000000001', 2, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0028-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000028', 'b0000004-0002-0000-0000-000000000002', 1, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0029-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000029', 'b0000004-0004-0000-0000-000000000004', 1, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0029-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000029', 'b0000005-0001-0000-0000-000000000001', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0029-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000029', 'b0000005-0002-0000-0000-000000000002', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0030-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000030', 'b0000005-0003-0000-0000-000000000003', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0031-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000031', 'b0000006-0002-0000-0000-000000000002', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0031-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000031', 'b0000006-0003-0000-0000-000000000003', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0032-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000032', 'b0000001-0001-0000-0000-000000000001', 2, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0032-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000032', 'b0000001-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0032-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000032', 'b0000001-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0033-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000033', 'b0000001-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0034-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000034', 'b0000002-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0034-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000034', 'b0000002-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0035-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000035', 'b0000003-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0035-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000035', 'b0000003-0003-0000-0000-000000000003', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0035-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000035', 'b0000003-0004-0000-0000-000000000004', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0036-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000036', 'b0000004-0001-0000-0000-000000000001', 2, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0037-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000037', 'b0000004-0004-0000-0000-000000000004', 1, 850.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0037-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000037', 'b0000005-0001-0000-0000-000000000001', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0038-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000038', 'b0000005-0003-0000-0000-000000000003', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0038-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000038', 'b0000005-0004-0000-0000-000000000004', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0038-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000038', 'b0000006-0001-0000-0000-000000000001', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0039-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000039', 'b0000006-0002-0000-0000-000000000002', 1, 920.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0040-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000040', 'b0000001-0001-0000-0000-000000000001', 2, 890.00)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price)
VALUES ('d0000001-0040-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000040', 'b0000001-0002-0000-0000-000000000002', 1, 890.00)
ON CONFLICT (id) DO NOTHING;
