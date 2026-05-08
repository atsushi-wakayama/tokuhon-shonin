-- =====================================================
-- 徳本上人 名号碑めぐり — 初期スキーマ
-- =====================================================

-- PostGIS 拡張 (Supabase では有効化済みの場合が多い)
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- エリア（地域区分）
-- =====================================================
CREATE TABLE public.areas (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL,           -- 例: '和歌山県', '関東・東京', '中部・近畿'
  slug TEXT NOT NULL UNIQUE,    -- URL用: 'wakayama', 'kanto'
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- =====================================================
-- 名号碑（Monuments）
-- =====================================================
CREATE TABLE public.monuments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,                           -- 碑の名称
  location    GEOGRAPHY(POINT, 4326) NOT NULL,         -- PostGIS地理座標
  prefecture  TEXT NOT NULL,                           -- 都道府県
  address     TEXT,                                    -- 住所
  area_id     INTEGER REFERENCES public.areas(id) ON DELETE SET NULL,
  description TEXT,                                    -- 解説テキスト
  access_info TEXT,                                    -- アクセス情報
  image_urls  TEXT[] DEFAULT '{}',                     -- 碑の写真URL一覧
  is_verified BOOLEAN DEFAULT false,                   -- 現地確認済みフラグ
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 地理空間インデックス（半径検索を高速化）
CREATE INDEX monuments_location_idx ON public.monuments USING GIST(location);
CREATE INDEX monuments_area_id_idx  ON public.monuments(area_id);

-- =====================================================
-- バッジ定義
-- =====================================================
CREATE TABLE public.badges (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,        -- 例: '見習い巡礼者', '徳本の弟子'
  description      TEXT NOT NULL,
  icon_url         TEXT,
  condition_type   TEXT NOT NULL,        -- 'stamp_count' | 'area_complete' | 'prefecture_complete'
  condition_value  JSONB NOT NULL,       -- {"count": 10} or {"area_id": 1}
  sort_order       INTEGER DEFAULT 0
);

-- バッジ初期データ
INSERT INTO public.badges (name, description, icon_url, condition_type, condition_value, sort_order) VALUES
  ('見習い巡礼者',     '最初の名号碑を参拝した',               '/icons/badges/beginner.svg',    'stamp_count',        '{"count": 1}',   1),
  ('巡礼者',           '10基の名号碑を制覇した',               '/icons/badges/pilgrim.svg',     'stamp_count',        '{"count": 10}',  2),
  ('篤信の巡礼者',     '50基の名号碑を制覇した',               '/icons/badges/devout.svg',      'stamp_count',        '{"count": 50}',  3),
  ('徳本の弟子',       '100基の名号碑を制覇した',              '/icons/badges/disciple.svg',    'stamp_count',        '{"count": 100}', 4),
  ('木食行者',         '200基の名号碑を制覇した',              '/icons/badges/ascetic.svg',     'stamp_count',        '{"count": 200}', 5),
  ('和歌山の守護者',   '和歌山県内の全名号碑を制覇した',       '/icons/badges/wakayama.svg',    'area_complete',      '{"area_id": 1}', 10),
  ('江戸を歩く者',     '関東・東京エリアの全名号碑を制覇した', '/icons/badges/edo.svg',         'area_complete',      '{"area_id": 2}', 11);

-- =====================================================
-- ユーザープロフィール（Supabase Auth と連携）
-- =====================================================
CREATE TABLE public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname      TEXT NOT NULL,
  avatar_url    TEXT,
  total_stamps  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ユーザー獲得バッジ
-- =====================================================
CREATE TABLE public.user_badges (
  user_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id  INTEGER REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- =====================================================
-- スタンプ（チェックイン記録）
-- =====================================================
CREATE TABLE public.stamps (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  monument_id   UUID REFERENCES public.monuments(id) ON DELETE CASCADE NOT NULL,
  photo_url     TEXT NOT NULL,              -- ユーザー撮影写真のStorage URL
  latitude      DOUBLE PRECISION,           -- チェックイン時の実測緯度
  longitude     DOUBLE PRECISION,           -- チェックイン時の実測経度
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, monument_id)              -- 1ユーザー1碑につき1スタンプ
);

CREATE INDEX stamps_user_id_idx     ON public.stamps(user_id);
CREATE INDEX stamps_monument_id_idx ON public.stamps(monument_id);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamps      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- profiles: 本人のみ書き込み可、全員読み取り可
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- stamps: 本人のみ書き込み可、全員読み取り可
CREATE POLICY "stamps_select" ON public.stamps FOR SELECT USING (true);
CREATE POLICY "stamps_insert" ON public.stamps FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_badges: 本人のみ読み取り可（サーバー側で付与）
CREATE POLICY "user_badges_select" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 便利ビュー: 碑ごとのスタンプ数
-- =====================================================
CREATE VIEW public.monument_stamp_counts AS
  SELECT monument_id, COUNT(*) AS stamp_count
  FROM public.stamps
  GROUP BY monument_id;

-- =====================================================
-- 関数: ユーザーが碑からX m以内にいるか確認
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_within_checkin_range(
  monument_id UUID,
  user_lat    DOUBLE PRECISION,
  user_lng    DOUBLE PRECISION,
  radius_m    INTEGER DEFAULT 50
)
RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT ST_DWithin(
    location::geography,
    ST_MakePoint(user_lng, user_lat)::geography,
    radius_m
  )
  FROM public.monuments
  WHERE id = monument_id;
$$;
