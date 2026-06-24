-- =====================================================
-- マイページ：スタンプのひとことメモを本人が編集できるようにする
-- =====================================================
CREATE POLICY "stamps_update" ON public.stamps
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
