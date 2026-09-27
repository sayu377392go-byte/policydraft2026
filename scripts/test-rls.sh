#!/usr/bin/env bash
# ローカル(または CI)の PostgreSQL に一時 DB を作り、マイグレーション + seed + RLS テストを流して
# supabase/tests/rls_test.expected と出力を突き合わせる。
# 使い方: PGHOST=localhost PGUSER=postgres ./scripts/test-rls.sh
#        期待値を更新する場合: UPDATE_EXPECTED=1 ./scripts/test-rls.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB=policydraft_rls_test
psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists $DB" -c "create database $DB"
trap 'psql -q -d postgres -c "drop database if exists $DB" >/dev/null' EXIT
psql -v ON_ERROR_STOP=1 -q -d $DB -f supabase/tests/supabase_stub.sql
for f in supabase/migrations/*.sql; do psql -v ON_ERROR_STOP=1 -q -d $DB -f "$f"; done
psql -v ON_ERROR_STOP=1 -q -d $DB -f supabase/seed.sql
out=$(psql -X -d $DB -f supabase/tests/rls_test.sql 2>&1)
if [[ "${UPDATE_EXPECTED:-}" == "1" ]]; then
  printf '%s\n' "$out" > supabase/tests/rls_test.expected
  echo "rls_test.expected を更新しました"
elif diff -u supabase/tests/rls_test.expected <(printf '%s\n' "$out"); then
  echo "RLS テスト: OK"
else
  echo "RLS テスト: 期待値と異なります" >&2
  exit 1
fi
