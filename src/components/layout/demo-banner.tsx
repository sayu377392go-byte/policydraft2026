import { isDemoMode } from "@/lib/supabase/config";

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      デモモードで表示しています(掲載内容はすべて架空です。投稿・ログインは Supabase 設定後に使えます)
    </div>
  );
}
