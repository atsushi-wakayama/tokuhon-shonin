# 徳本上人 名号碑めぐり

江戸時代の念仏行者・徳本上人が全国に残した「名号碑」を巡るデジタルスタンプラリーPWAアプリ。

---

## 技術スタック

- **フロントエンド:** Next.js 16 (App Router) / TypeScript / Tailwind CSS
- **バックエンド/DB:** Supabase (PostgreSQL + PostGIS + Auth + Storage)
- **地図:** Google Maps JavaScript API
- **デプロイ:** Vercel

---

## 機能

- 地図上に名号碑のピンを表示
- エリア別フィルター・キーワード検索
- GPS連動チェックイン（写真撮影・アップロード）
- デジタルスタンプ帳
- 称号（バッジ）自動付与
- 徳本上人についての読み物コンテンツ

---

## ローカル開発環境のセットアップ

### 1. 必要なもの

- Node.js 18以上
- npm

### 2. リポジトリのクローン

```bash
git clone <リポジトリURL>
cd tokuhon-stamp-rally
```

### 3. パッケージのインストール

```bash
npm install
```

### 4. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成します。

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて以下の3つの値をご自身のアカウントで取得した値に設定してください：

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

### 5. Supabaseのセットアップ

> **注意:** ご自身の [Supabase](https://supabase.com) アカウントとプロジェクトを作成してください。

1. Supabase でプロジェクトを作成（リージョン: Northeast Asia (Tokyo) 推奨）
2. Settings → API から `Project URL` と `anon public` キーを取得して `.env.local` に設定
3. SQL Editorで `supabase/migrations/001_initial_schema.sql` を実行
4. SQL Editorで `supabase/seed.sql` を実行（サンプルデータ）
5. Storageで `user-photos` バケットを作成（Public: ON）
6. 以下のRLSポリシーをSQL Editorで実行

```sql
-- Storageポリシー
CREATE POLICY "認証ユーザーはアップロード可" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'user-photos');
CREATE POLICY "全員が閲覧可" ON storage.objects FOR SELECT TO public USING (bucket_id = 'user-photos');

-- テーブルポリシー
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_select_all" ON public.badges FOR SELECT USING (true);

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "areas_select_all" ON public.areas FOR SELECT USING (true);

ALTER TABLE public.monuments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monuments_select_all" ON public.monuments FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_badges_select" ON public.user_badges;
CREATE POLICY "user_badges_select" ON public.user_badges FOR SELECT USING (true);
```

7. バッジ自動付与トリガーをSQL Editorで実行

```sql
CREATE OR REPLACE FUNCTION public.award_badges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_stamp_count INTEGER;
  badge RECORD;
BEGIN
  SELECT COUNT(*) INTO v_stamp_count FROM public.stamps WHERE user_id = NEW.user_id;
  UPDATE public.profiles SET total_stamps = v_stamp_count, updated_at = now() WHERE id = NEW.user_id;
  FOR badge IN SELECT id, condition_value FROM public.badges WHERE condition_type = 'stamp_count' LOOP
    IF v_stamp_count >= (badge.condition_value->>'count')::INTEGER THEN
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, badge.id) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_stamp_created
  AFTER INSERT ON public.stamps
  FOR EACH ROW EXECUTE FUNCTION public.award_badges();
```

8. Supabase Auth の設定
   - Authentication → Providers → Email → **「Confirm email」をオフ**

### 6. Google Maps APIキーの取得

> **注意:** ご自身の [Google Cloud](https://console.cloud.google.com) アカウントでAPIキーを取得してください。

1. Google Cloud Console でプロジェクトを作成
2. **Maps JavaScript API** を有効化
3. 「認証情報」→「APIキー」を作成して `.env.local` に設定

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く。

---

## デモ環境へのデプロイ（Vercel）

> **注意:** ご自身の [Vercel](https://vercel.com) アカウントでデプロイしてください。

```bash
# Vercel CLIをインストール
npm install -g vercel

# Vercelにログインしてプロジェクトを初期化
vercel

# 環境変数を設定（ご自身のキーを入力）
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production

# デプロイ
vercel --prod
```

---

## 開発上の注意点

- GPS距離チェック（半径50m）は `lib/hooks/useCheckIn.ts` でコメントアウト中。本番リリース前に有効化すること。
- Google Maps は `DEMO_MAP_ID` を使用中。本番前に正式なMap IDの作成を推奨。
- 名号碑データは現在5件のサンプルデータのみ。実際の碑データは各自で追加すること。

---

## ディレクトリ構成

```
tokuhon-stamp-rally/
├── app/
│   ├── (auth)/          # ログイン・新規登録
│   └── (main)/          # メイン画面（地図・スポット・マイページ等）
├── components/          # UIコンポーネント
├── lib/
│   ├── hooks/           # カスタムフック
│   ├── mock/            # モックデータ
│   ├── supabase/        # Supabaseクライアント
│   ├── types/           # 型定義
│   └── utils/           # ユーティリティ
├── public/              # 静的ファイル
└── supabase/
    ├── migrations/      # DBスキーマ
    └── seed.sql         # 初期データ
```
