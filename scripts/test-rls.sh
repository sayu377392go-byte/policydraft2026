#!/usr/bin/env bash
# ローカルの PostgreSQL に一時 DB を作り、マイグレーション + seed + RLS テストを流す。
# 使い方: PGHOST=localhost PGUSER=postgres ./scripts/test-rls.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB=policydraft_rls_test
psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists $DB" -c "create database $DB"
psql -v ON_ERROR_STOP=1 -q -d $DB -f supabase/tests/supabase_stub.sql
for f in supabase/migrations/*.sql; do psql -v ON_ERROR_STOP=1 -q -d $DB -f "$f"; done
psql -v ON_ERROR_STOP=1 -q -d $DB -f supabase/seed.sql
psql -d $DB -f supabase/tests/rls_test.sql
psql -q -d postgres -c "drop database $DB"
