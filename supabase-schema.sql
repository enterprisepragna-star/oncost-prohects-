-- ═══════════════════════════════════════════════════════
-- ONCOST Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════

-- ── CATEGORIES ──
create table if not exists categories (
  id          bigint primary key generated always as identity,
  name        text not null unique,
  slug        text not null unique,
  description text,
  created_at  timestamptz default now()
);

-- ── PRODUCTS (extended) ──
-- Add missing columns to existing products table
alter table products add column if not exists offer_price    integer;
alter table products add column if not exists stock          integer default 100;
alter table products add column if not exists status         text default 'active';
alter table products add column if not exists description    text;
alter table products add column if not exists seo_title      text;
alter table products add column if not exists seo_description text;
alter table products add column if not exists created_at     timestamptz default now();

-- ── PROFILES (ensure columns) ──
create table if not exists profiles (
  id         uuid primary key references auth.users(id),
  name       text,
  phone      text,
  email      text,
  created_at timestamptz default now()
);

-- ── ORDERS ──
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  customer_email text not null,
  user_id        uuid references auth.users(id),
  total_items    integer default 1,
  total_amount   integer default 0,
  status         text default 'Processing',
  payment_id     text,
  coupon_code    text,
  discount_amount integer default 0,
  notes          text,
  created_at     timestamptz default now()
);

-- ── CART ITEMS ──
create table if not exists cart_items (
  id         bigint primary key generated always as identity,
  user_id    uuid references auth.users(id) on delete cascade,
  product_id text not null,
  qty        integer default 1,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

-- ── LEADS ──
create table if not exists leads (
  id             bigint primary key generated always as identity,
  user_id        uuid references auth.users(id),
  customer_email text,
  product_id     text,
  summary        text,
  status         text default 'new',
  created_at     timestamptz default now()
);

-- ── COUPONS ──
create table if not exists coupons (
  id                bigint primary key generated always as identity,
  code              text not null unique,
  discount_type     text not null check (discount_type in ('percentage','flat')),
  discount_value    numeric not null,
  min_order_value   numeric,
  max_uses          integer,
  used_count        integer default 0,
  valid_from        timestamptz,
  valid_until       timestamptz,
  description       text,
  created_at        timestamptz default now()
);

-- ── SALE EVENTS ──
create table if not exists sale_events (
  id                   bigint primary key generated always as identity,
  name                 text not null,
  banner_text          text not null,
  discount_percentage  integer,
  banner_color         text default '#7a1f35',
  start_date           timestamptz not null,
  end_date             timestamptz not null,
  created_at           timestamptz default now()
);

-- ── TESTIMONIALS ──
create table if not exists testimonials (
  id             bigint primary key generated always as identity,
  user_id        uuid references auth.users(id),
  customer_name  text not null,
  customer_email text,
  product_id     text,
  product_name   text,
  rating         integer check (rating between 1 and 5),
  review_text    text,
  status         text default 'pending',
  created_at     timestamptz default now()
);

-- ── SITE SETTINGS (SEO, Social, etc.) ──
create table if not exists site_settings (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);

-- ══════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════

-- Products: public read, admin write
alter table products enable row level security;
create policy "Public can read products" on products for select using (true);
create policy "Admin can manage products" on products for all using (auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');

-- Categories: public read
alter table categories enable row level security;
create policy "Public can read categories" on categories for select using (true);
create policy "Admin can manage categories" on categories for all using (auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');

-- Cart items: user-scoped
alter table cart_items enable row level security;
create policy "Users manage own cart" on cart_items for all using (auth.uid() = user_id);

-- Orders: users see own, admin sees all
alter table orders enable row level security;
create policy "Users read own orders" on orders for select using (auth.uid() = user_id or auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');
create policy "Users insert own orders" on orders for insert with check (auth.uid() = user_id);
create policy "Admin update orders" on orders for update using (auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');

-- Profiles
alter table profiles enable row level security;
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Admin reads all profiles" on profiles for select using (auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');

-- Leads: insert by user, admin manages all
alter table leads enable row level security;
create policy "Users insert leads" on leads for insert with check (auth.uid() = user_id);
create policy "Admin manages leads" on leads for all using (auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');

-- Coupons: public read for validation, admin write
alter table coupons enable row level security;
create policy "Public read coupons" on coupons for select using (true);
create policy "Admin manage coupons" on coupons for all using (auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');

-- Sale events: public read
alter table sale_events enable row level security;
create policy "Public read sales" on sale_events for select using (true);
create policy "Admin manage sales" on sale_events for all using (auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');

-- Testimonials: public read approved, users insert, admin manages
alter table testimonials enable row level security;
create policy "Public read approved testimonials" on testimonials for select using (status = 'approved');
create policy "Users submit testimonials" on testimonials for insert with check (auth.uid() = user_id);
create policy "Admin manage testimonials" on testimonials for all using (auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');

-- Site settings: public read, admin write
alter table site_settings enable row level security;
create policy "Public read settings" on site_settings for select using (true);
create policy "Admin manage settings" on site_settings for all using (auth.jwt() ->> 'email' = 'enterprisepragna@gmail.com');
