# 政策ドラフト ―みんなの声で、未来をつくる―

> 投票以上、出馬未満。

若者・学生の社会課題意識や政策提言をオープンに可視化し、政治家へダイレクトに届けるプラットフォームです。
LP(トップページ)と、目安箱・政治家ナビ・政策ドラフト・お知らせ・会員登録・政治家向け課金・管理画面を含みます。

## 技術スタック

| 用途 | 採用 |
| --- | --- |
| フロント / バックエンド | Next.js 16(App Router)+ TypeScript |
| スタイル / UI | Tailwind CSS v4、shadcn/ui 形式のコンポーネント(`src/components/ui`)、Lucide React |
| DB / 認証 / ストレージ | Supabase(PostgreSQL、Supabase Auth、Storage、Row Level Security) |
| 決済 | Stripe(Checkout、Customer Portal、Webhook) |

要件定義書の推奨スタックに準拠しています。

## まず画面を見る(デモモード)

Supabase の設定なしで起動すると、架空のデモデータで全画面を閲覧できます(投稿・ログインは無効)。

```bash
npm install
npm run dev
# http://localhost:3000
```

## 本番構成のセットアップ

### 1. Supabase

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editor で次の順に実行(または Supabase CLI で `supabase db push`)
   1. `supabase/migrations/20260927000000_init.sql`(テーブル・RLS・Storage バケット)
   2. `supabase/seed.sql`(政党・政策分野タグのマスター。末尾の架空データは不要なら削除)
3. Authentication → URL Configuration で Site URL と Redirect URL(`https://<ドメイン>/auth/callback`)を設定
4. 最初の管理者を作る: サイトで通常登録したあと、SQL Editor で
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'admin@example.com');
   ```

### 2. Stripe

1. 商品「公式回答プラン」を作り、Price を 2 つ作成
   - 月額 4,400円(税込)/ 毎月
   - 年額 50,000円(税込)/ 毎年
2. Customer Portal を有効化(解約・カード変更・請求書の閲覧を許可)
3. Webhook エンドポイント `https://<ドメイン>/api/stripe/webhook` を追加し、次のイベントを選択
   - `checkout.session.completed`
   - `customer.subscription.created` / `updated` / `deleted`
4. ローカルでは `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 3. 環境変数

`.env.example` を `.env.local` にコピーして値を入れます。Vercel などにデプロイする場合も同じ変数を設定してください。

## 画面一覧

| パス | 内容 | 権限 |
| --- | --- | --- |
| `/` | LP(トップイメージ準拠) | だれでも |
| `/meyasubako` | 目安箱タイムライン、ハッシュタグ絞り込み、トレンドタグ | だれでも |
| `/meyasubako/[id]` | スレッド(ツリー状リプライ、政治家の公式回答、通報) | 閲覧: だれでも / 返信: 学生・Active な政治家 |
| `/meyasubako/new` | 新規投稿(プリセットタグ・自由タグ・宛先政治家) | 学生 |
| `/politicians` | 政治家一覧(名前・ふりがな検索、政党・都道府県・選挙区フィルター) | だれでも |
| `/politicians/[slug]` | 政治家詳細(人柄・政策・メッセージ、寄せられた声 / 公式回答タブ) | だれでも |
| `/drafts`, `/drafts/[slug]` | 政策ドラフト | だれでも |
| `/news`, `/news/[id]` | お知らせ | だれでも |
| `/signup` | 学生登録 | — |
| `/signup/politician` | 政治家アカウント申請 | — |
| `/login`, `/mypage` | ログイン、マイページ(自分の投稿の管理) | ログイン |
| `/politician/plan` | プラン加入(Stripe / 銀行振込)・契約状態 | 政治家 |
| `/admin/*` | 政治家プロフィール代理登録・写真、課金・入金消込、モデレーション、政策ドラフト・お知らせ | 管理者 |

## 個人情報の扱い(要件 5-1)

- 学生の **氏名・生年月日・メールアドレス・市区町村** は `student_private` テーブルに分けて保存し、RLS で本人と管理者以外の SELECT を遮断しています。
- 画面に出す表示名は `public_authors` ビューだけが作ります。ニックネーム、または「所属+学年 / 年代 / 選挙区」(例: `〇〇大学3年 / 20代 / 大阪1区`)のみを返します。
- 年代は登録時に生年月日から算出して `student_profiles.age_band` に保存します。

## RLS のテスト

ローカルの PostgreSQL があれば、Supabase のスタブを使って RLS を検証できます。

```bash
PGHOST=localhost PGUSER=postgres ./scripts/test-rls.sh
```

他人の個人情報が読めないこと、なりすまし投稿・未契約の政治家の公式回答・学生による非表示操作が拒否されること、などを確認します。

## 開発コマンド

```bash
npm run dev          # 開発サーバー
npm run build        # 本番ビルド
npm run lint         # ESLint
npm run typecheck    # 型チェック
npm run db:seed-sql  # src/lib/demo-data.ts と定数から supabase/seed.sql を再生成
```

## 要件定義書から補った点

要件定義書に明記がなく、こちらで判断して補った内容です。変更が必要なら指示してください。

1. **政策ドラフト・お知らせ機能**: トップイメージのナビにあるため、管理者が作成・公開する機能を追加。政策ドラフトには「もとになった目安箱の投稿」をひも付けられます。
2. **政治家アカウントの作り方**: 政治家本人が `/signup/politician` から申請し、管理者が本人確認後にプロフィールへ紐付ける流れにしました(プロフィール編集は要件どおり管理者のみ)。
3. **公式回答の条件**: 「紐付け済み」かつ「契約が Active で有効期限内」の場合のみ。アプリと RLS の両方で判定します。
4. **銀行振込**: 申請時に `PD-XXXXXXXX` 形式の振込IDを発行し、管理者が「入金消込・Active昇格」を押すとプラン期間分(1か月 / 1年)有効期限を延長します。
5. **年一括プラン**: Stripe では「毎年自動更新」の Price として扱います。自動更新なしにしたい場合は Checkout の mode を `payment` に変える必要があります。
6. **通報理由**: 誹謗中傷 / 公職選挙法 / 個人情報 / スパム / その他 の 5 種類。管理者が非表示にすると同じ投稿の通報はまとめて対応済みになります。
7. **スマホ対応**: スマホでは画面下部に固定ナビを表示し、片手で主要画面に移動できるようにしました。
8. **デモモード**: クライアント確認用に、Supabase 未設定でも架空データで全画面を表示できるようにしました。

## 今後の対応が必要なもの

- ガイドライン・プライバシーポリシー・利用規約の本文(現在は仮の文面)と、特定商取引法に基づく表記(有料プランがあるため必要)
- 政党カラーの最終決定(`src/lib/constants.ts`)
- メール通知(政治家から回答が来たときなど)。現状は Supabase Auth の確認メールのみ
- LP ヒーローの背景写真(トップイメージの街並み写真に相当する素材)
- 選挙区マスター(現在は自由入力)
