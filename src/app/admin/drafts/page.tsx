import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PRESET_TAGS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { saveDraft, toggleDraftPublished } from "../actions";

export default async function AdminDrafts() {
  const supabase = await createClient();
  const { data: drafts } = await supabase
    .from("policy_drafts")
    .select("id, slug, title, published_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold">政策ドラフト</h1>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-white">
          {(drafts ?? []).map((d) => (
            <li key={d.id} className="flex items-center gap-4 p-3 text-sm">
              <Link href={`/drafts/${d.slug}`} className="flex-1 hover:text-primary">{d.title}</Link>
              <span className="text-xs text-muted-foreground">{d.published_at ? `公開 ${formatDate(d.published_at)}` : "下書き"}</span>
              <form action={toggleDraftPublished}>
                <input type="hidden" name="id" value={d.id} />
                <input type="hidden" name="publish" value={String(!d.published_at)} />
                <Button size="sm" variant="outline">{d.published_at ? "非公開にする" : "公開する"}</Button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold">新規作成</h2>
        <form action={saveDraft} className="mt-4 space-y-4 rounded-lg border border-border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="title">タイトル</Label><Input id="title" name="title" required /></div>
            <div><Label htmlFor="slug">URL 用 ID(半角英小文字)</Label><Input id="slug" name="slug" pattern="[a-z0-9\-]+" required /></div>
            <div>
              <Label htmlFor="tag">政策分野</Label>
              <Select id="tag" name="tag" defaultValue="">
                <option value="">なし</option>
                {PRESET_TAGS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </div>
            <div><Label htmlFor="image_url">画像 URL(任意)</Label><Input id="image_url" name="image_url" type="url" /></div>
          </div>
          <div><Label htmlFor="summary">概要</Label><Textarea id="summary" name="summary" rows={2} required /></div>
          <div>
            <Label htmlFor="body">本文(「## 見出し」「- 箇条書き」が使えます)</Label>
            <Textarea id="body" name="body" rows={10} required />
          </div>
          <div>
            <Label htmlFor="post_ids">もとになった目安箱の投稿 ID(改行・カンマ区切り)</Label>
            <Textarea id="post_ids" name="post_ids" rows={2} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="publish" /> すぐに公開する</label>
          <Button type="submit">保存する</Button>
        </form>
      </section>
    </div>
  );
}
