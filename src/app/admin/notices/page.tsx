import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { saveNotice, toggleNoticePublished } from "../actions";

export default async function AdminNotices() {
  const supabase = await createClient();
  const { data: notices } = await supabase.from("notices").select("id, title, published_at, created_at").order("created_at", { ascending: false });
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold">お知らせ</h1>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-white">
          {(notices ?? []).map((n) => (
            <li key={n.id} className="flex items-center gap-4 p-3 text-sm">
              <span className="flex-1">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.published_at ? `公開 ${formatDate(n.published_at)}` : "下書き"}</span>
              <form action={toggleNoticePublished}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="publish" value={String(!n.published_at)} />
                <Button size="sm" variant="outline">{n.published_at ? "非公開にする" : "公開する"}</Button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-bold">新規作成</h2>
        <form action={saveNotice} className="mt-4 space-y-4 rounded-lg border border-border bg-white p-6">
          <div><Label htmlFor="title">タイトル</Label><Input id="title" name="title" required /></div>
          <div><Label htmlFor="body">本文</Label><Textarea id="body" name="body" rows={6} required /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="publish" /> すぐに公開する</label>
          <Button type="submit">保存する</Button>
        </form>
      </section>
    </div>
  );
}
