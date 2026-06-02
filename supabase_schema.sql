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
