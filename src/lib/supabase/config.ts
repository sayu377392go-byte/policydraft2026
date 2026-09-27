export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Supabase の接続情報が無いときはデモモード(閲覧専用・デモデータ表示)で動く。
 * クライアント確認用にセットアップ無しで画面を見られるようにするため。
 */
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;
