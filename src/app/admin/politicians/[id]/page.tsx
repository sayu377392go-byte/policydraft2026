import Link from "next/link";
import { notFound } from "next/navigation";
import { PoliticianAvatar } from "@/components/politician-avatar";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PARTIES, PREFECTURES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Politician } from "@/lib/types";
import { savePolitician } from "../../actions";

const LONG_FIELDS: { key: keyof Politician; label: string }[] = [
  { key: "childhood_dream", label: "学生時代の将来の夢" },
  { key: "special_ability", label: "自分の特殊能力(強み・特技・意外な一面)" },
  { key: "manifesto", label: "政策公約(メインマニフェスト)" },
  { key: "past_and_future", label: "過去 & 未来" },
  { key: "policy_actions", label: "政策への行動(法案・実績・活動記録)" },
  { key: "message_to_youth", label: "若者へのメッセージ" },
];

/** 政治家プロフィールの代理登録・編集(/admin/politicians/new も兼ねる) */
export default async function EditPolitician({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const isNew = id === "new";
  let p: Politician | null = null;
  if (!isNew) {
    const { data } = await supabase.from("politicians").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    p = data;
  }
  const { data: applications } = await supabase.from("politician_applications").select("user_id, full_name, email");

  return (
    <div>
      <Link href="/admin/politicians" className="text-sm text-muted-foreground hover:text-primary">← 一覧へ</Link>
      <h1 className="mt-2 text-2xl font-bold">{isNew ? "政治家の新規登録" : `${p!.name} の編集`}</h1>

      <form action={savePolitician} className="mt-6 space-y-6 rounded-lg border border-border bg-white p-6">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="flex items-center gap-4">
          <PoliticianAvatar name={p?.name ?? "?"} photoUrl={p?.photo_url ?? null} className="size-24" />
          <div>
            <Label htmlFor="photo">顔写真</Label>
            <input id="photo" name="photo" type="file" accept="image/*" className="text-sm" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="name">氏名 *</Label><Input id="name" name="name" defaultValue={p?.name} required /></div>
          <div><Label htmlFor="name_kana">ふりがな *</Label><Input id="name_kana" name="name_kana" defaultValue={p?.name_kana} required /></div>
          <div>
            <Label htmlFor="party_id">所属政党 *</Label>
            <Select id="party_id" name="party_id" defaultValue={p?.party_id ?? "independent"}>
              {PARTIES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </Select>
          </div>
          <div><Label htmlFor="slug">URL 用 ID *(半角英小文字)</Label><Input id="slug" name="slug" defaultValue={p?.slug} pattern="[a-z0-9\-]+" required /></div>
          <div>
            <Label htmlFor="prefecture">都道府県 *</Label>
            <Select id="prefecture" name="prefecture" defaultValue={p?.prefecture ?? "東京都"}>
              {PREFECTURES.map((x) => <option key={x}>{x}</option>)}
            </Select>
          </div>
          <div><Label htmlFor="district">選挙区 *</Label><Input id="district" name="district" defaultValue={p?.district} placeholder="例: 東京1区" required /></div>
          <div><Label htmlFor="hometown">出身地</Label><Input id="hometown" name="hometown" defaultValue={p?.hometown ?? ""} /></div>
          <div><Label htmlFor="alma_mater">出身大学</Label><Input id="alma_mater" name="alma_mater" defaultValue={p?.alma_mater ?? ""} /></div>
        </div>

        {LONG_FIELDS.map((f) => (
          <div key={f.key}>
            <Label htmlFor={f.key}>{f.label}</Label>
            <Textarea id={f.key} name={f.key} rows={3} defaultValue={(p?.[f.key] as string | null) ?? ""} />
          </div>
        ))}

        <div>
          <Label htmlFor="user_id">ログインアカウント(公式回答用)</Label>
          <Select id="user_id" name="user_id" defaultValue={p?.user_id ?? ""}>
            <option value="">紐付けない</option>
            {(applications ?? []).map((a) => (
              <option key={a.user_id} value={a.user_id}>{a.full_name}({a.email})</option>
            ))}
          </Select>
        </div>

        <Button type="submit" size="lg">保存する</Button>
      </form>
    </div>
  );
}
