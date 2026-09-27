#!/usr/bin/env bash
# env ファイルの値を Vercel プロジェクトの環境変数(Production)に登録する。
# 事前に `npx vercel login` と `npx vercel link` を済ませておくこと。
# 使い方: ./scripts/setup/vercel-env.sh [env ファイル(既定: .env.production.local)]
set -euo pipefail
cd "$(dirname "$0")/../.."
FILE="${1:-.env.production.local}"
[[ -f "$FILE" ]] || { echo "$FILE がありません" >&2; exit 1; }

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# || -z "${line// }" ]] && continue
  name="${line%%=*}"
  value="${line#*=}"
  value="${value%\"}"; value="${value#\"}"
  [[ -z "$value" ]] && continue
  echo "==> $name"
  npx -y vercel@latest env rm "$name" production --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | npx -y vercel@latest env add "$name" production >/dev/null
done < "$FILE"
echo "Vercel の環境変数を登録しました。反映には再デプロイが必要です: npx vercel deploy --prod"
