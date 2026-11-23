-- ============================================================
-- MONOKROM E-COMMERCE DATABASE SCHEMA & RLS POLICIES
-- ============================================================

-- Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Tops', 'Bottoms', 'Outerwear', 'Footwear')),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    description TEXT NOT NULL,
    material TEXT NOT NULL,
    fit_note TEXT NOT NULL,
    care TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PRODUCT VARIANTS TABLE (Colors, Sizes, Stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
    stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'gcash', 'cod')),
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'refunded')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'refunded')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- INDEXES FOR HIGH-PERFORMANCE ANALYTICS & FILTERING
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_stock ON public.product_variants(stock_count);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id);

-- ============================================================
-- INVENTORY AUTOMATION TRIGGERS
-- ============================================================

-- A. Decrement stock on order item insertion
CREATE OR REPLACE FUNCTION public.handle_stock_decrement()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.product_variants
    SET stock_count = GREATEST(0, stock_count - NEW.quantity)
    WHERE id = NEW.variant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_decrement_stock ON public.order_items;
CREATE TRIGGER trigger_decrement_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_stock_decrement();

-- B. Restore stock on order refund
CREATE OR REPLACE FUNCTION public.handle_stock_restore_on_refund()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'refunded' AND OLD.status != 'refunded') OR 
       (NEW.payment_status = 'refunded' AND OLD.payment_status != 'refunded') THEN
        UPDATE public.product_variants pv
        SET stock_count = pv.stock_count + oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id AND pv.id = oi.variant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_restore_stock_on_refund ON public.orders;
CREATE TRIGGER trigger_restore_stock_on_refund
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_stock_restore_on_refund();

-- ============================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function to verify admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Public can view own profile or admins view all" ON public.profiles;
CREATE POLICY "Public can view own profile or admins view all"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- PRODUCTS POLICIES (Read-only for storefront, write for admins)
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins have full CRUD on products" ON public.products;
CREATE POLICY "Admins have full CRUD on products"
ON public.products FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- PRODUCT VARIANTS POLICIES
DROP POLICY IF EXISTS "Anyone can view variants" ON public.product_variants;
CREATE POLICY "Anyone can view variants"
ON public.product_variants FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins have full CRUD on variants" ON public.product_variants;
CREATE POLICY "Admins have full CRUD on variants"
ON public.product_variants FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Anyone can create order (guest checkout)" ON public.orders;
CREATE POLICY "Anyone can create order (guest checkout)"
ON public.orders FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Customers view own orders, admins view all" ON public.orders;
CREATE POLICY "Customers view own orders, admins view all"
ON public.orders FOR SELECT
USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    public.is_admin()
);

DROP POLICY IF EXISTS "Admins can update orders (refund / status)" ON public.orders;
CREATE POLICY "Admins can update orders (refund / status)"
ON public.orders FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Customers view own order items, admins view all" ON public.order_items;
CREATE POLICY "Customers view own order items, admins view all"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND ((auth.uid() IS NOT NULL AND o.user_id = auth.uid()) OR public.is_admin())
    )
);

-- ============================================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- ============================================================
-- Supabase Storage bucket setup (runs if storage schema exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for Product Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload to Product Images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND (auth.role() = 'authenticated'));
