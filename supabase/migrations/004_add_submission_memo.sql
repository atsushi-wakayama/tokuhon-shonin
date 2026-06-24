-- =====================================================
-- 申請時の「ひとことメモ」を承認時まで一時保存する欄
-- =====================================================
ALTER TABLE public.monuments ADD COLUMN IF NOT EXISTS submission_memo TEXT;
