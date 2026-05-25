create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percentage integer,
  bonus_credits integer,
  active boolean default true not null,
  expires_at timestamptz,
  show_banner boolean default false not null,
  banner_message text,
  created_at timestamptz default now() not null
);

-- RLS policies
alter table public.promo_codes enable row level security;

create policy "Enable read access for all users" on public.promo_codes
  for select using (true);

GRANT SELECT, INSERT, UPDATE ON promo_codes TO service_role;