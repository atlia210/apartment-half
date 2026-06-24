-- rooms テーブルを作成
create table if not exists rooms (
  id          text        primary key,
  resident_name text,
  twitter     text,
  instagram   text,
  bio         text,
  bg_color    text        not null default '#ffffff',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS を有効化
alter table rooms enable row level security;

-- 誰でも読み取り可能
create policy "public read"
  on rooms for select
  using (true);

-- 誰でも挿入可能
create policy "public insert"
  on rooms for insert
  with check (true);

-- 誰でも更新可能（オーナー判定はクライアント側 localStorage で行う）
create policy "public update"
  on rooms for update
  using (true);

-- リアルタイム有効化
alter publication supabase_realtime add table rooms;

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rooms_updated_at
  before update on rooms
  for each row execute function update_updated_at();

-- room_logs: 訪問・入居イベントのログ
create table if not exists room_logs (
  id           bigint generated always as identity primary key,
  room_id      text        not null,
  event_type   text        not null check (event_type in ('visit', 'checkin', 'checkout')),
  visitor_name text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_room_logs_room_id
  on room_logs(room_id, created_at desc);

alter table room_logs enable row level security;

create policy "room_logs read"
  on room_logs for select using (true);

create policy "room_logs insert"
  on room_logs for insert with check (true);

-- 再訪問時に自分の visit 行の created_at を更新するため（オーナー判定なし・全公開方針）
create policy "room_logs update"
  on room_logs for update using (true) with check (true);

-- site_visits: サイト全体の訪問者カウント（entrance で「あなたは N 人目」を表示）
create table if not exists site_visits (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now()
);

alter table site_visits enable row level security;

create policy "site_visits read"
  on site_visits for select using (true);

create policy "site_visits insert"
  on site_visits for insert with check (true);
