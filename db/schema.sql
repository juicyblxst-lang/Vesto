create table if not exists profiles (
  wallet_address text primary key,
  handle text,
  created_at timestamptz not null default now()
);

create table if not exists theses (
  id text primary key,
  creator_wallet text references profiles(wallet_address),
  title text not null,
  thesis text not null,
  allocations jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists follows (
  follower_wallet text not null references profiles(wallet_address),
  thesis_id text not null references theses(id),
  created_at timestamptz not null default now(),
  primary key (follower_wallet, thesis_id)
);

create table if not exists reactions (
  wallet_address text not null references profiles(wallet_address),
  thesis_id text not null references theses(id),
  kind text not null check (kind in ('like','remix')),
  created_at timestamptz not null default now(),
  primary key (wallet_address, thesis_id, kind)
);

create table if not exists comments (
  id bigserial primary key,
  wallet_address text not null references profiles(wallet_address),
  thesis_id text not null references theses(id),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists executions (
  id bigserial primary key,
  wallet_address text not null,
  thesis_id text,
  asset_symbol text not null,
  sell_token text not null,
  buy_token text not null,
  sell_amount_base_units numeric(78,0) not null,
  tx_hash text unique not null,
  status text not null check (status in ('submitted','confirmed','reverted')),
  created_at timestamptz not null default now()
);
create index if not exists executions_wallet_idx on executions(wallet_address, created_at desc);
create index if not exists comments_thesis_idx on comments(thesis_id, created_at desc);
