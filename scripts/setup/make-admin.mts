/**
 * 登録済みユーザーを管理者にする。
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     npx tsx scripts/setup/make-admin.mts admin@example.com
 *
 * 先にサイトの /signup から通常どおり登録(メール確認まで)しておくこと。
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2]?.toLowerCase();
if (!url || !key || !email) {
  console.error("使い方: NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定し、メールアドレスを引数に指定してください");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let userId: string | null = null;
for (let page = 1; !userId; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
  if (data.users.length < 1000) break;
}
if (!userId) {
  console.error(`${email} のユーザーが見つかりません。先にサイトで登録してください`);
  process.exit(1);
}

const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId);
if (error) throw error;
console.log(`${email} を管理者にしました`);
