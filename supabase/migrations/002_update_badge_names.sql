-- =====================================================
-- 称号名の変更（2026年5月）
-- Supabase SQL Editor で直接実行済みの内容を記録
-- =====================================================

UPDATE public.badges SET name = '旅立ちの巡礼者' WHERE name = '見習い巡礼者';
UPDATE public.badges SET name = '心清らかな旅人' WHERE name = '巡礼者';
UPDATE public.badges SET name = '名号を辿る者'   WHERE name = '篤信の巡礼者';
UPDATE public.badges SET name = '上人の道を歩む者' WHERE name = '徳本の弟子';
UPDATE public.badges SET name = '全国を巡る行者' WHERE name = '木食行者';
UPDATE public.badges SET name = '紀ノ国を巡りし者' WHERE name = '和歌山の守護者';
UPDATE public.badges SET name = '江戸を巡りし者' WHERE name = '江戸を歩く者';
