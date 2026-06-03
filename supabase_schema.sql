-- Supabase SQL Schema for ONCOST Front-end Wiring

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id text NOT NULL,
  qty integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for Cart
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Cart Policies
CREATE POLICY "Users can manage their own cart" 
  ON public.cart_items FOR ALL 
  USING (auth.uid() = user_id);

-- 3. Leads (Enquiries) Table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  product_id text,
  summary text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads Policies
CREATE POLICY "Users can insert their own leads" 
  ON public.leads FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own leads" 
  ON public.leads FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all leads" 
  ON public.leads FOR SELECT 
  USING (auth.email() = 'enterprisepragna@gmail.com');

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  badge text,
  category text,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Anyone can view products" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage products" 
  ON public.products FOR ALL 
  USING (auth.email() = 'enterprisepragna@gmail.com');

-- Insert Dummy Products
INSERT INTO public.products (id, name, price, badge, category, description, image_url) VALUES
('brass-diya-set', 'Brass Diya Set', 149, 'Best Seller', 'Brass Collection', 'A warm traditional diya set for pooja return gifts and festive gifting.', 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop'),
('decorative-tin-box', 'Decorative Tin Box', 99, 'New', 'Tin Boxes', 'Reusable decorative tin packaging for sweets, dry fruits, and party favors.', 'https://images.unsplash.com/photo-1513885535751-8b9238bf345a?q=80&w=800&auto=format&fit=crop'),
('german-silver-bowl', 'German Silver Bowl', 199, 'Premium', 'German Silver', 'A polished bowl option for elegant pooja and wedding gifting.', 'https://images.unsplash.com/photo-1610992015732-28079237cc91?q=80&w=800&auto=format&fit=crop'),
('thambulam-gift-set', 'Thambulam Gift Set', 249, 'Bulk Ready', 'Thambulam Sets', 'A complete celebration gift set ready for guest distribution.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop'),
('birthday-favor-box', 'Birthday Favor Box', 129, 'Party Pick', 'Birthday Collection', 'A cheerful birthday return gift box for kids and family parties.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;
