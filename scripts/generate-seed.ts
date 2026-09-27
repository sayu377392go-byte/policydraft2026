/**
 * supabase/seed.sql を生成する: npm run db:seed-sql
 * 政党・プリセットタグ(マスター)と、デモ用の架空データ(政治家・政策ドラフト・お知らせ)を入れる。
 * 目安箱の投稿は実在ユーザーが必要なため seed には含めない。
 */
import { writeFileSync } from "node:fs";
import { PARTIES, PRESET_TAGS } from "../src/lib/constants";
import { demoDrafts, demoNotices, demoPoliticians } from "../src/lib/demo-data";

const q = (v: string | number | null | undefined) =>
  v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;

const lines: string[] = ["-- 自動生成: npm run db:seed-sql(直接編集しない)", ""];

lines.push("insert into public.parties (id, name, color, sort_order) values");
lines.push(PARTIES.map((p, i) => `  (${q(p.id)}, ${q(p.name)}, ${q(p.color)}, ${i})`).join(",\n") + "\non conflict (id) do update set name = excluded.name, color = excluded.color, sort_order = excluded.sort_order;\n");

lines.push("insert into public.tags (name, is_preset, sort_order) values");
lines.push(PRESET_TAGS.map((t, i) => `  (${q(t)}, true, ${i})`).join(",\n") + "\non conflict (name) do update set is_preset = true, sort_order = excluded.sort_order;\n");

lines.push("-- ↓ デモ用の架空データ。本番では不要なら削除してください");
const cols = ["id", "slug", "name", "name_kana", "party_id", "prefecture", "district", "hometown", "alma_mater", "childhood_dream", "special_ability", "manifesto", "past_and_future", "policy_actions", "message_to_youth"] as const;
lines.push(`insert into public.politicians (${cols.join(", ")}) values`);
lines.push(demoPoliticians.map((p) => `  (${cols.map((c) => q(p[c])).join(", ")})`).join(",\n") + "\non conflict (id) do nothing;\n");
lines.push("insert into public.subscriptions (politician_id) select id from public.politicians on conflict do nothing;\n");

for (const d of demoDrafts) {
  lines.push(
    `insert into public.policy_drafts (id, slug, title, summary, body, image_url, tag_id, published_at) values (${q(d.id)}, ${q(d.slug)}, ${q(d.title)}, ${q(d.summary)}, ${q(d.body)}, ${q(d.image_url)}, (select id from public.tags where name = ${q(d.tag)}), ${q(d.published_at)}) on conflict (id) do nothing;`,
  );
}
lines.push("");
for (const n of demoNotices) {
  lines.push(`insert into public.notices (id, title, body, published_at) values (${q(n.id)}, ${q(n.title)}, ${q(n.body)}, ${q(n.published_at)}) on conflict (id) do nothing;`);
}

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), lines.join("\n") + "\n");
console.log("supabase/seed.sql を生成しました");
