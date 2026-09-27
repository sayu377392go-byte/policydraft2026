-- =====================================================================
-- 政策ドラフト 初期スキーマ
-- 要件定義書 4章(論理ER)と 5章(RLS・モデレーション)に対応
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- ロール
-- ---------------------------------------------------------------------
create type public.user_role as enum ('student', 'politician', 'admin');
create type public.subscription_status as enum ('pending', 'active', 'unpaid', 'inactive');
create type public.plan_type as enum ('monthly', 'yearly');
create type public.payment_method as enum ('stripe', 'bank_transfer');
create type public.report_status as enum ('open', 'resolved', 'dismissed');

-- auth.users と 1:1。ロールのみを持つ(個人情報は置かない)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------
-- 学生プロフィール(3.1)
-- 公開してよい属性と、非公開の個人情報をテーブルごと分ける。
-- student_private は本人と管理者以外 SELECT 不可(要件 5-1)。
-- ---------------------------------------------------------------------
create table public.student_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  nickname text,                          -- 任意。設定時はこちらを表示
  affiliation text not null,              -- 大学名 または「社会人」
  faculty text,
  grade text,                             -- 例: 3年
  age_band text not null,                 -- 例: 20代(生年月日から算出して保存)
  prefecture text not null,
  city text,
  district text,                          -- 衆院小選挙区 例: 大阪1区
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_private (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  full_name text not null,
  birth_date date not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 政党マスター(3.2 ①)
-- ---------------------------------------------------------------------
create table public.parties (
  id text primary key,                    -- 例: ldp
  name text not null,
  color text not null,                    -- バッジ色 (#hex)
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------
-- 政治家(3.2)管理者のみ編集可
-- ---------------------------------------------------------------------
create table public.politicians (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  user_id uuid unique references public.profiles (id) on delete set null,
  name text not null,
  name_kana text not null,
  party_id text not null references public.parties (id),
  prefecture text not null,
  district text not null,                 -- 例: 東京1区 / 比例東京 / 参院東京
  photo_url text,
  hometown text,
  alma_mater text,
  childhood_dream text,                   -- 学生時代の将来の夢
  special_ability text,                   -- 自分の特殊能力
  manifesto text,                         -- 政策公約
  past_and_future text,                   -- 過去 & 未来
  policy_actions text,                    -- 政策への行動
  message_to_youth text,                  -- 若者向けメッセージ
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index politicians_party_idx on public.politicians (party_id);
create index politicians_prefecture_idx on public.politicians (prefecture);

-- ---------------------------------------------------------------------
-- サブスクリプション(3.4)政治家と 1:1
-- ---------------------------------------------------------------------
create table public.subscriptions (
  politician_id uuid primary key references public.politicians (id) on delete cascade,
  plan_type public.plan_type,
  payment_method public.payment_method,
  status public.subscription_status not null default 'inactive',
  period_end timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  bank_transfer_code text unique,         -- 振込ID(注文番号)
  bank_transfer_requested_at timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function public.is_active_politician(p_politician uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.politicians p
    join public.subscriptions s on s.politician_id = p.id
    where p.id = p_politician
      and p.user_id = auth.uid()
      and s.status = 'active'
      and (s.period_end is null or s.period_end > now())
  );
$$;

-- ---------------------------------------------------------------------
-- 目安箱(3.3)投稿とツリー状のリプライ
-- 政治家の公式リプライは official_politician_id を持つ posts 行
-- (ER の comments に相当。同じテーブルでスレッドを組み立てられるようにしている)
-- ---------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.posts (id) on delete cascade,
  root_id uuid references public.posts (id) on delete cascade,
  target_politician_id uuid references public.politicians (id) on delete set null, -- 宛先の政治家(任意)
  official_politician_id uuid references public.politicians (id) on delete set null, -- 公式リプライ時
  body text not null check (char_length(body) between 1 and 1000),
  is_hidden boolean not null default false,   -- 管理者による非表示
  hidden_reason text,
  created_at timestamptz not null default now()
);
create index posts_root_idx on public.posts (root_id, created_at);
create index posts_timeline_idx on public.posts (created_at desc) where parent_id is null;
create index posts_target_idx on public.posts (target_politician_id);
create index posts_official_idx on public.posts (official_politician_id);

-- root_id を自動で埋める
create or replace function public.set_post_root()
returns trigger language plpgsql as $$
begin
  if new.parent_id is null then
    new.root_id := null;
  else
    select coalesce(root_id, id) into new.root_id from public.posts where id = new.parent_id;
  end if;
  return new;
end;
$$;
create trigger posts_set_root before insert on public.posts
  for each row execute function public.set_post_root();

create table public.tags (
  id serial primary key,
  name text not null unique,              -- 「#」なし 例: 少子化対策
  is_preset boolean not null default false,
  sort_order int not null default 100
);

create table public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id int not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- 政治家アカウントの申請(本人確認後、管理者が politicians.user_id を紐付ける)
create table public.politician_applications (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  full_name text not null,
  email text not null,
  note text,                              -- 所属政党・選挙区など自由記述
  created_at timestamptz not null default now()
);

-- 通報(5-2)
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);

-- ---------------------------------------------------------------------
-- 補完: 政策ドラフト・お知らせ(トップイメージのナビに対応)
-- ---------------------------------------------------------------------
create table public.policy_drafts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null,
  image_url text,
  tag_id int references public.tags (id),
  published_at timestamptz,               -- null なら下書き
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.policy_draft_posts (
  draft_id uuid not null references public.policy_drafts (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  primary key (draft_id, post_id)
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 表示名(3.1-2)
-- 氏名・メールを含まない公開用ビュー。ビューの所有者権限で動くため、
-- 元テーブルの RLS に関係なく、ここに列挙した列だけが公開される。
-- ---------------------------------------------------------------------
create view public.public_authors as
select
  pr.id as user_id,
  pr.role,
  case
    when pr.role = 'politician' then pol.name
    when sp.nickname is not null and sp.nickname <> '' then sp.nickname
    else concat_ws(' / ',
      nullif(concat(sp.affiliation, coalesce(sp.grade, '')), ''),
      sp.age_band,
      coalesce(sp.district, sp.prefecture))
  end as display_name,
  pol.id as politician_id,
  pol.slug as politician_slug,
  pol.photo_url
from public.profiles pr
left join public.student_profiles sp on sp.user_id = pr.id
left join public.politicians pol on pol.user_id = pr.id;

-- トレンドハッシュタグ(直近 14 日)
create view public.trending_tags as
select t.id, t.name, count(*)::int as post_count
from public.post_tags pt
join public.tags t on t.id = pt.tag_id
join public.posts p on p.id = pt.post_id
where p.is_hidden = false and p.created_at > now() - interval '14 days'
group by t.id, t.name
order by post_count desc
limit 10;

grant select on public.public_authors, public.trending_tags to anon, authenticated;

-- ---------------------------------------------------------------------
-- 新規ユーザー作成時に profiles を作る
-- 学生の属性は signUp の user_metadata から student_* に展開する
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m jsonb := new.raw_user_meta_data;
begin
  if m->>'account_type' = 'politician' then
    -- 政治家は申請のみ。politicians への紐付けと課金が済むまで公式回答はできない
    insert into public.profiles (id, role) values (new.id, 'politician');
    insert into public.politician_applications (user_id, full_name, email, note)
    values (new.id, coalesce(m->>'full_name', ''), new.email, nullif(m->>'note', ''));
    return new;
  end if;

  insert into public.profiles (id, role) values (new.id, 'student');

  if m ? 'full_name' then
    insert into public.student_private (user_id, full_name, birth_date, email)
    values (new.id, m->>'full_name', (m->>'birth_date')::date, new.email);

    insert into public.student_profiles
      (user_id, nickname, affiliation, faculty, grade, age_band, prefecture, city, district)
    values (
      new.id,
      nullif(m->>'nickname', ''),
      m->>'affiliation',
      nullif(m->>'faculty', ''),
      nullif(m->>'grade', ''),
      (floor(extract(year from age((m->>'birth_date')::date)) / 10) * 10)::int || '代',
      m->>'prefecture',
      nullif(m->>'city', ''),
      nullif(m->>'district', '')
    );
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.student_private enable row level security;
alter table public.parties enable row level security;
alter table public.politicians enable row level security;
alter table public.subscriptions enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.reports enable row level security;
alter table public.politician_applications enable row level security;
alter table public.policy_drafts enable row level security;
alter table public.policy_draft_posts enable row level security;
alter table public.notices enable row level security;

-- profiles: 本人と管理者のみ。ロール変更は管理者のみ
create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles admin write" on public.profiles for update using (public.is_admin());

-- student_profiles: 公開属性は本人と管理者が読める(他者へは public_authors 経由)
create policy "student_profiles read" on public.student_profiles for select using (user_id = auth.uid() or public.is_admin());
create policy "student_profiles update self" on public.student_profiles for update using (user_id = auth.uid());

-- student_private: 本人と管理者のみ(要件 5-1)
create policy "student_private read" on public.student_private for select using (user_id = auth.uid() or public.is_admin());
create policy "student_private update self" on public.student_private for update using (user_id = auth.uid());

-- マスター・政治家: 誰でも閲覧、管理者のみ編集
create policy "parties read" on public.parties for select using (true);
create policy "parties admin" on public.parties for all using (public.is_admin()) with check (public.is_admin());
create policy "politicians read" on public.politicians for select using (true);
create policy "politicians admin" on public.politicians for all using (public.is_admin()) with check (public.is_admin());
create policy "tags read" on public.tags for select using (true);
create policy "tags insert authed" on public.tags for insert to authenticated with check (is_preset = false);
create policy "tags admin" on public.tags for all using (public.is_admin()) with check (public.is_admin());

-- subscriptions: 本人(紐付いた政治家)と管理者のみ閲覧。更新は管理者か service role(Webhook)
create policy "subscriptions read" on public.subscriptions for select using (
  public.is_admin() or exists (select 1 from public.politicians p where p.id = politician_id and p.user_id = auth.uid())
);
create policy "subscriptions admin" on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());

-- posts: 非表示でなければ誰でも閲覧。投稿は学生本人、公式リプライは Active な政治家のみ
create policy "posts read" on public.posts for select using (is_hidden = false or author_id = auth.uid() or public.is_admin());
create policy "posts insert student" on public.posts for insert to authenticated with check (
  author_id = auth.uid()
  and is_hidden = false
  and official_politician_id is null
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'student')
);
create policy "posts insert official" on public.posts for insert to authenticated with check (
  author_id = auth.uid()
  and is_hidden = false
  and parent_id is not null
  and official_politician_id is not null
  and public.is_active_politician(official_politician_id)
);
create policy "posts delete own" on public.posts for delete using (author_id = auth.uid());
create policy "posts admin" on public.posts for update using (public.is_admin());

create policy "post_tags read" on public.post_tags for select using (true);
create policy "post_tags insert own" on public.post_tags for insert to authenticated with check (
  exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
);

create policy "applications read" on public.politician_applications for select using (user_id = auth.uid() or public.is_admin());
create policy "applications admin" on public.politician_applications for all using (public.is_admin()) with check (public.is_admin());

-- reports: ログインユーザーが作成、管理者が閲覧・更新
create policy "reports insert" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "reports admin" on public.reports for all using (public.is_admin()) with check (public.is_admin());

-- 政策ドラフト・お知らせ: 公開済みは誰でも、下書きは管理者のみ
create policy "drafts read" on public.policy_drafts for select using (published_at is not null and published_at <= now() or public.is_admin());
create policy "drafts admin" on public.policy_drafts for all using (public.is_admin()) with check (public.is_admin());
create policy "draft_posts read" on public.policy_draft_posts for select using (true);
create policy "draft_posts admin" on public.policy_draft_posts for all using (public.is_admin()) with check (public.is_admin());
create policy "notices read" on public.notices for select using (published_at is not null and published_at <= now() or public.is_admin());
create policy "notices admin" on public.notices for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage: 政治家の顔写真(公開バケット、書き込みは管理者のみ)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('politician-photos', 'politician-photos', true)
on conflict (id) do nothing;

create policy "politician photos read" on storage.objects for select using (bucket_id = 'politician-photos');
create policy "politician photos admin write" on storage.objects for insert with check (bucket_id = 'politician-photos' and public.is_admin());
create policy "politician photos admin update" on storage.objects for update using (bucket_id = 'politician-photos' and public.is_admin());
create policy "politician photos admin delete" on storage.objects for delete using (bucket_id = 'politician-photos' and public.is_admin());
