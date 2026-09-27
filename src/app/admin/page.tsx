import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [reports, pending, applications, posts] = await Promise.all([
    count(supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "open")),
    count(supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "pending")),
    count(supabase.from("politician_applications").select("*", { count: "exact", head: true })),
    count(supabase.from("posts").select("*", { count: "exact", head: true })),
  ]);
  const cards = [
    { label: "未対応の通報", value: reports, href: "/admin/moderation" },
    { label: "振込確認待ち", value: pending, href: "/admin/billing" },
    { label: "政治家アカウント申請", value: applications, href: "/admin/politicians" },
    { label: "投稿数(累計)", value: posts, href: "/meyasubako" },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold">管理画面</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-lg border border-border bg-white p-5 hover:shadow-sm">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
