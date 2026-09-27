# 本番環境の構築手順

Supabase・Stripe・Vercel を用意し、本番公開するまでの手順です。上から順に実行すれば公開できます。
秘密情報は `.env.production.local` だけに書き出します。このファイルは `.gitignore` 済みなので、**絶対にコミットしないでください**。

## 0. 前提

- Node.js 22 以上、`git`
- Supabase・Stripe・Vercel のアカウント(ログインはブラウザで行う)
- このリポジトリを clone して `npm ci` 済みであること

```bash
git clone https://github.com/sayu377392go-byte/policydraft2026.git
cd policydraft2026
npm ci
```

## 1. Vercel プロジェクトを作り、本番 URL を決める

```bash
npx vercel login
npx vercel link          # 「新しいプロジェクトを作成」→ 名前: policydraft2026
npx vercel git connect   # GitHub リポジトリと接続(main への push で自動デプロイ)
```

本番 URL を決めます。独自ドメインがなければ `https://policydraft2026.vercel.app` のような Vercel の URL を使えます。ドメインはあとから Vercel の Settings → Domains で追加できますが、その場合は手順 2 と 3 を新しい URL で再実行してください。

```bash
export NEXT_PUBLIC_SITE_URL=https://policydraft2026.vercel.app   # 実際の URL に置き換え
```

## 2. Supabase

1. ダッシュボードで New project を作成します(Region: **Northeast Asia (Tokyo)**)。DB パスワードは控えておいてください。
   CLI で作る場合は次のとおりです。
   ```bash
   npx supabase@2 login
   npx supabase@2 orgs list
   npx supabase@2 projects create policydraft2026 --org-id <ORG_ID> --region ap-northeast-1 --db-password '<強いパスワード>'
   ```
2. スキーマ・seed・認証設定を反映し、API キーを書き出します。
   ```bash
   export SUPABASE_PROJECT_REF=<プロジェクトの Reference ID>
   export SUPABASE_DB_PASSWORD='<DB パスワード>'
   ./scripts/setup/supabase.sh .env.production.local
   ```
   次の処理が実行されます。
   - `supabase/migrations/` の適用(テーブル、RLS、Storage バケット)
   - `supabase/seed.sql` の投入(政党・政策分野タグ。架空の政治家・ドラフト・お知らせも入るので、不要なら公開前に管理画面や SQL で削除します)
   - `supabase/config.toml` の認証設定の反映(サイト URL、`/auth/callback` へのリダイレクト、メール確認の有効化)
   - API キーの `.env.production.local` への追記
3. (推奨)Authentication → Emails → SMTP Settings で独自の SMTP(Resend や SendGrid など)を設定します。Supabase 標準のメール送信は送信数の制限が厳しいため、本番運用には向きません。

## 3. Stripe

1. ダッシュボードの「開発者 → API キー」でシークレットキーを取得します。まずテストモードの `sk_test_...` で動作確認し、公開時に本番の `sk_live_...` で同じ手順を再実行します。
2. 商品・価格(月額 4,400円 / 年額 50,000円・税込)・Webhook・カスタマーポータル設定を作成します。
   ```bash
   export STRIPE_SECRET_KEY=sk_test_...
   echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" >> .env.production.local
   npx tsx scripts/setup/stripe.mts --out .env.production.local
   ```
   何度実行しても重複して作成されることはありません。Webhook が既にある場合、署名シークレットは作成時にしか取得できないため、ダッシュボードから `STRIPE_WEBHOOK_SECRET` を手動で追記してください。

## 4. 銀行振込先

政治家のプラン画面に表示する口座情報を `.env.production.local` に追記します。

```
BANK_NAME=〇〇銀行
BANK_BRANCH=〇〇支店
BANK_ACCOUNT_TYPE=普通
BANK_ACCOUNT_NUMBER=1234567
BANK_ACCOUNT_HOLDER=カ)セイサクドラフト
```

## 5. サイト掲載用の画像を生成する(OpenAI)

ヒーロー背景・政策ドラフトのサムネイル・OGP 画像を OpenAI の画像生成 API で作り、リポジトリにコミットします。

```bash
export OPENAI_API_KEY=sk-...
npm run images:generate      # public/images/*.webp と src/lib/site-images.ts を更新
git add public/images src/lib/site-images.ts && git commit -m "サイト画像を生成" && git push
```

プロンプトは `scripts/generate-images.mts` の中にあります。作り直す場合は `-- --force`、1 枚だけ作り直す場合は `-- hero` のように名前を指定します。

## 6. Vercel に環境変数を登録してデプロイ

```bash
./scripts/setup/vercel-env.sh .env.production.local
npx vercel deploy --prod
```

## 7. 管理者アカウントを作る

1. 本番サイトの `/signup` から管理者にする人が登録し、確認メールのリンクを開きます。
2. 次のコマンドで管理者にします。
   ```bash
   set -a; source .env.production.local; set +a
   npx tsx scripts/setup/make-admin.mts admin@example.com
   ```
3. ログインするとヘッダーに「管理画面」が表示されます。

## 8. 公開前チェック

- [ ] トップのデモバナー(「デモモードで表示しています」)が消えている(= Supabase に接続できている)
- [ ] 学生登録 → 確認メール → ログイン → 目安箱に投稿できる
- [ ] 管理画面で政治家を登録し、政治家アカウント(`/signup/politician` から申請)を紐付けられる
- [ ] 政治家アカウントで `/politician/plan` からテスト決済(カード番号 `4242 4242 4242 4242`)すると状態が Active になり、公式回答できる
- [ ] 銀行振込で申し込み、管理画面の「入金消込・Active昇格」で Active になる
- [ ] 通報 → 管理画面で非表示にできる
- [ ] `src/lib/legal.ts` の【要記入】(事業者名・住所・電話など)を埋め、利用規約・プライバシーポリシーの本文を確定した
- [ ] seed の架空データ(政治家・政策ドラフト・お知らせ)を削除、または実データに差し替えた
- [ ] Stripe を本番モードのキーに切り替えて手順 3・5 を再実行した
