import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./config";

/** Server Component / Server Action / Route Handler 用(ログインユーザー権限、RLS 適用) */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component から呼ばれた場合は書き込めない。proxy.ts がセッションを更新する。
        }
      },
    },
  });
}

/** service role(RLS をバイパス)。Stripe Webhook など、サーバー内部処理だけで使う */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY が設定されていません");
  return createSupabaseClient(supabaseUrl, key, { auth: { persistSession: false } });
}
