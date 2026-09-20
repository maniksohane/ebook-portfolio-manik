create extension if not exists pgcrypto;

create table if not exists public.ebooks (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 slug text unique not null,
 description text not null,
 author text not null default 'Manikya',
 price numeric(10,2) not null check(price>=0),
 currency text not null default 'INR',
 cover_path text not null,
 file_path text not null,
 preview_path text,
 pages integer,
 category text,
 tags text[] default '{}',
 is_published boolean not null default false,
 is_featured boolean not null default false,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text,
 role text not null default 'customer' check(role in ('customer','admin')),
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

create table if not exists public.transactions (
 id uuid primary key default gen_random_uuid(),
 ebook_id uuid not null references public.ebooks(id),
 user_id uuid references auth.users(id) on delete set null,
 customer_name text,
 customer_first_name text,
 customer_last_name text,
 customer_phone text,
 customer_email text not null,
 razorpay_order_id text unique not null,
 razorpay_payment_id text unique,
 razorpay_signature text,
 amount_paise bigint not null,
 currency text default 'INR',
 status text not null default 'created' check(status in ('created','authorized','captured','failed','refunded')),
 payment_method text,
 webhook_received boolean default false,
 payment_date timestamptz,
 delivery_email_sent_at timestamptz,
 delivery_email_error text,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

alter table public.transactions add column if not exists customer_first_name text;
alter table public.transactions add column if not exists customer_last_name text;
alter table public.transactions add column if not exists customer_phone text;
alter table public.transactions add column if not exists delivery_email_sent_at timestamptz;
alter table public.transactions add column if not exists delivery_email_error text;
alter table public.transactions add column if not exists payment_date timestamptz;

create table if not exists public.downloads (
 id uuid primary key default gen_random_uuid(),
 transaction_id uuid not null references public.transactions(id) on delete cascade,
 ebook_id uuid not null references public.ebooks(id),
 user_id uuid references auth.users(id) on delete set null,
 expires_at timestamptz not null,
 download_count integer not null default 0 check(download_count>=0),
 download_limit integer not null default 3 check(download_limit>0),
 created_at timestamptz default now()
);

alter table public.downloads add column if not exists download_count integer not null default 0;
alter table public.downloads add column if not exists download_limit integer not null default 3;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists ebooks_set_updated_at on public.ebooks;
create trigger ebooks_set_updated_at before update on public.ebooks for each row execute procedure public.set_updated_at();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at before update on public.transactions for each row execute procedure public.set_updated_at();

alter table public.ebooks enable row level security;
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.downloads enable row level security;

drop policy if exists "published ebooks are public" on public.ebooks;
create policy "published ebooks are public" on public.ebooks for select using(is_published=true);

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated using(id=auth.uid());

drop policy if exists "users read own transactions" on public.transactions;
create policy "users read own transactions" on public.transactions for select to authenticated using(user_id=auth.uid());

drop policy if exists "users read own downloads" on public.downloads;
create policy "users read own downloads" on public.downloads for select to authenticated using(user_id=auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,full_name)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''))
 on conflict(id) do nothing;
 return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into storage.buckets(id,name,public) values
('ebook-covers','ebook-covers',true),
('ebook-files','ebook-files',false),
('ebook-previews','ebook-previews',false)
on conflict(id) do nothing;

drop policy if exists "public read ebook covers" on storage.objects;
create policy "public read ebook covers" on storage.objects for select
using(bucket_id='ebook-covers');
