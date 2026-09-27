import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { dismissReport, setPostHidden } from "../actions";

type Row = {
  id: string;
  reason: string;
  created_at: string;
  posts: { id: string; body: string; is_hidden: boolean; root_id: string | null } | null;
};

/** 通報対応と非表示フラグ(要件 5-2) */
export default async function AdminModeration() {
  const supabase = await createClient();
  const [{ data: reports }, { data: hidden }] = await Promise.all([
    supabase
      .from("reports")
      .select("id, reason, created_at, posts(id, body, is_hidden, root_id)")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabase.from("posts").select("id, body, hidden_reason, created_at").eq("is_hidden", true).order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold">未対応の通報</h1>
        <ul className="mt-4 space-y-3">
          {((reports ?? []) as unknown as Row[]).map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-white p-4">
              <p className="text-xs text-muted-foreground">{formatDateTime(r.created_at)} ・ 理由: <strong className="text-red-600">{r.reason}</strong></p>
              {r.posts && (
                <>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{r.posts.body}</p>
                  <Link href={`/meyasubako/${r.posts.root_id ?? r.posts.id}`} className="mt-1 inline-block text-xs text-primary hover:underline">スレッドを開く</Link>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <form action={setPostHidden} className="flex gap-2">
                      <input type="hidden" name="post_id" value={r.posts.id} />
                      <input type="hidden" name="hidden" value="true" />
                      <Input name="reason" defaultValue={r.reason} className="h-8 w-56 text-sm" aria-label="非表示理由" />
                      <Button size="sm" variant="destructive">非表示にする</Button>
                    </form>
                    <form action={dismissReport}>
                      <input type="hidden" name="report_id" value={r.id} />
                      <Button size="sm" variant="ghost">問題なし</Button>
                    </form>
                  </div>
                </>
              )}
            </li>
          ))}
          {(reports ?? []).length === 0 && <li className="text-sm text-muted-foreground">未対応の通報はありません</li>}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold">非表示中の投稿</h2>
        <ul className="mt-4 space-y-3">
          {(hidden ?? []).map((p) => (
            <li key={p.id} className="flex items-start gap-4 rounded-lg border border-border bg-white p-4 text-sm">
              <div className="flex-1">
                <p className="whitespace-pre-wrap">{p.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">理由: {p.hidden_reason ?? "—"}</p>
              </div>
              <form action={setPostHidden}>
                <input type="hidden" name="post_id" value={p.id} />
                <input type="hidden" name="hidden" value="false" />
                <Button size="sm" variant="outline">再表示</Button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
