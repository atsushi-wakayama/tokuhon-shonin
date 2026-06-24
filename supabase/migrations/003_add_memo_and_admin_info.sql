-- =====================================================
-- 申請画面リニューアル：ひとことメモ／管理者へのスポット情報
-- =====================================================

-- スタンプに「ひとことメモ」を追加（チェックイン時・自動チェックイン時に記録）
ALTER TABLE public.stamps ADD COLUMN IF NOT EXISTS memo TEXT;

-- スポットに「管理者へのスポット情報」を追加（申請者と管理者のみが見るための情報）
ALTER TABLE public.monuments ADD COLUMN IF NOT EXISTS admin_info TEXT;
ALTER TABLE public.monuments ADD COLUMN IF NOT EXISTS admin_info_provided_by TEXT;
ALTER TABLE public.monuments ADD COLUMN IF NOT EXISTS admin_info_provided_at TIMESTAMPTZ;
