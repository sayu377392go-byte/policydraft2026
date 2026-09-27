#!/usr/bin/env bash
# Supabase プロジェクトにスキーマ・seed・認証設定を反映し、API キーを出力する。
#
# 必要な環境変数:
#   SUPABASE_ACCESS_TOKEN   Supabase のアクセストークン(または事前に `npx supabase login`)
#   SUPABASE_PROJECT_REF    プロジェクトの Reference ID(ダッシュボード URL の英数字)
#   SUPABASE_DB_PASSWORD    プロジェクト作成時に決めた DB パスワード
#   NEXT_PUBLIC_SITE_URL    本番サイトの URL(例: https://policydraft.vercel.app)
# 使い方:
#   ./scripts/setup/supabase.sh [出力先ファイル(既定: .env.production.local)]
set -euo pipefail
cd "$(dirname "$0")/../.."

: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF を設定してください}"
: "${SUPABASE_DB_PASSWORD:?SUPABASE_DB_PASSWORD を設定してください}"
: "${NEXT_PUBLIC_SITE_URL:?NEXT_PUBLIC_SITE_URL を設定してください}"
OUT="${1:-.env.production.local}"
SITE="${NEXT_PUBLIC_SITE_URL%/}"
SB="npx -y supabase@2"

echo "==> プロジェクトにリンク"
$SB link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"

echo "==> マイグレーションと seed を適用"
$SB db push --include-seed --password "$SUPABASE_DB_PASSWORD" --yes

echo "==> 認証設定(サイト URL・リダイレクト URL・メール確認)を反映"
NEXT_PUBLIC_SITE_URL="$SITE" SUPABASE_AUTH_REDIRECT_URL="$SITE/auth/callback" \
  $SB config push --project-ref "$SUPABASE_PROJECT_REF" --yes

echo "==> API キーを $OUT に書き出し"
keys=$($SB projects api-keys --project-ref "$SUPABASE_PROJECT_REF" --reveal -o json)
# 新形式(publishable / secret)を優先し、なければ旧形式(anon / service_role)を使う
pick() {
  printf '%s' "$keys" | node -e '
    const keys = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const want = process.argv[1].split(",");
    for (const w of want) {
      const k = keys.find((k) => k.type === w || k.name === w);
      if (k?.api_key) { process.stdout.write(k.api_key); break; }
    }' "$1"
}
anon=$(pick "publishable,anon")
service=$(pick "secret,service_role")
if [[ -z "$anon" || -z "$service" ]]; then
  echo "API キーを取得できませんでした。ダッシュボードの Project Settings → API から手動で設定してください" >&2
  exit 1
fi
{
  echo ""
  echo "# Supabase(scripts/setup/supabase.sh が出力)"
  echo "NEXT_PUBLIC_SITE_URL=$SITE"
  echo "NEXT_PUBLIC_SUPABASE_URL=https://$SUPABASE_PROJECT_REF.supabase.co"
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon"
  echo "SUPABASE_SERVICE_ROLE_KEY=$service"
} >> "$OUT"
echo "完了しました($OUT は Git にコミットしないこと)"
