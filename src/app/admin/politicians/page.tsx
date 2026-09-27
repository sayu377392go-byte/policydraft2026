import Link from "next/link";
import { Plus } from "lucide-react";
import { PartyBadge } from "@/components/party-badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminPoliticians() {
  const supabase = await createClient();
  const [{ data: politicians }, { data: applications }] = await Promise.all([
    supabase.from("politicians").select("id, name, name_kana, party_id, district, user_id").order("name_kana"),
    supabase.from("politician_applications").select("*").order("created_at", { ascending: false }),
  ]);
  const linked = new Set((politicians ?? []).map((p) => p.user_id).filter(Boolean));
  const waiting = (applications ?? []).filter((a) => !linked.has(a.user_id));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">政治家プロフィール</h1>
        <Button asChild size="sm">
          <Link href="/admin/politicians/new">
            <Plus /> 新規登録
          </Link>
        </Button>
      </div>

      {waiting.length > 0 && (
        <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-bold">紐付け待ちのアカウント申請</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {waiting.map((a) => (
              <li key={a.user_id}>
                {a.full_name}({a.email})— {formatDate(a.created_at)}
                {a.note && <span className="ml-2 text-muted-foreground">{a.note}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">本人確認後、プロフィール編集画面の「ログインアカウント」で紐付けてください。</p>
        </section>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-3">氏名</th>
              <th className="p-3">政党</th>
              <th className="p-3">選挙区</th>
              <th className="p-3">アカウント</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(politicians ?? []).map((p) => (
              <tr key={p.id}>
                <td className="p-3">
                  <Link href={`/admin/politicians/${p.id}`} className="font-bold text-primary hover:underline">
                    {p.name}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">{p.name_kana}</span>
                </td>
                <td className="p-3"><PartyBadge partyId={p.party_id} /></td>
                <td className="p-3">{p.district}</td>
                <td className="p-3 text-xs">{p.user_id ? "紐付け済み" : "未紐付け"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
