"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./guard";

const str = (fd: FormData, key: string) => {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
};

// ---------------------------------------------------------------------
// 政治家プロフィール(代理登録・編集・写真アップロード)
// ---------------------------------------------------------------------
const politicianSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "URL 用 ID は半角英小文字・数字・ハイフンのみ"),
  name: z.string().min(1, "氏名は必須です"),
  name_kana: z.string().min(1, "ふりがなは必須です"),
  party_id: z.string().min(1),
  prefecture: z.string().min(1, "都道府県は必須です"),
  district: z.string().min(1, "選挙区は必須です"),
});

export async function savePolitician(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const base = politicianSchema.parse({
    slug: str(formData, "slug"),
    name: str(formData, "name"),
    name_kana: str(formData, "name_kana"),
    party_id: str(formData, "party_id"),
    prefecture: str(formData, "prefecture"),
    district: str(formData, "district"),
  });
  const row = {
    ...base,
    hometown: str(formData, "hometown"),
    alma_mater: str(formData, "alma_mater"),
    childhood_dream: str(formData, "childhood_dream"),
    special_ability: str(formData, "special_ability"),
    manifesto: str(formData, "manifesto"),
    past_and_future: str(formData, "past_and_future"),
    policy_actions: str(formData, "policy_actions"),
    message_to_youth: str(formData, "message_to_youth"),
    user_id: str(formData, "user_id"),
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { data, error } = id
    ? await supabase.from("politicians").update(row).eq("id", id).select("id").single()
    : await supabase.from("politicians").insert(row).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "保存に失敗しました");

  // 顔写真
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/")) throw new Error("画像ファイルを選択してください");
    const ext = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${data.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("politician-photos")
      .upload(path, photo, { contentType: photo.type, upsert: true });
    if (upErr) throw new Error(upErr.message);
    const { data: pub } = supabase.storage.from("politician-photos").getPublicUrl(path);
    await supabase.from("politicians").update({ photo_url: pub.publicUrl }).eq("id", data.id);
  }

  // サブスクリプション行を用意しておく
  await supabase.from("subscriptions").upsert({ politician_id: data.id }, { onConflict: "politician_id", ignoreDuplicates: true });

  revalidatePath("/politicians");
  revalidatePath("/admin/politicians");
  redirect("/admin/politicians");
}

// ---------------------------------------------------------------------
// 課金・契約(銀行振込の入金消込・Active 昇格)
// ---------------------------------------------------------------------
export async function activateBankTransfer(formData: FormData) {
  await requireAdmin();
  const politicianId = String(formData.get("politician_id"));
  const plan = formData.get("plan") === "yearly" ? "yearly" : "monthly";
  const supabase = await createClient();

  const { data: current } = await supabase.from("subscriptions").select("period_end").eq("politician_id", politicianId).maybeSingle();
  // 期限内の延長なら現在の期限から加算する
  const start = current?.period_end && new Date(current.period_end) > new Date() ? new Date(current.period_end) : new Date();
  const end = new Date(start);
  if (plan === "yearly") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);

  await supabase
    .from("subscriptions")
    .update({
      status: "active",
      plan_type: plan,
      payment_method: "bank_transfer",
      period_end: end.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("politician_id", politicianId);
  revalidatePath("/admin/billing");
}

export async function setSubscriptionStatus(formData: FormData) {
  await requireAdmin();
  const status = z.enum(["active", "pending", "unpaid", "inactive"]).parse(formData.get("status"));
  const supabase = await createClient();
  await supabase
    .from("subscriptions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("politician_id", String(formData.get("politician_id")));
  revalidatePath("/admin/billing");
}

// ---------------------------------------------------------------------
// モデレーション
// ---------------------------------------------------------------------
export async function setPostHidden(formData: FormData) {
  await requireAdmin();
  const hidden = formData.get("hidden") === "true";
  const supabase = await createClient();
  await supabase
    .from("posts")
    .update({ is_hidden: hidden, hidden_reason: hidden ? str(formData, "reason") : null })
    .eq("id", String(formData.get("post_id")));
  if (hidden) {
    await supabase.from("reports").update({ status: "resolved" }).eq("post_id", String(formData.get("post_id"))).eq("status", "open");
  }
  revalidatePath("/admin/moderation");
  revalidatePath("/meyasubako");
}

export async function dismissReport(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("reports").update({ status: "dismissed" }).eq("id", String(formData.get("report_id")));
  revalidatePath("/admin/moderation");
}

// ---------------------------------------------------------------------
// 政策ドラフト・お知らせ
// ---------------------------------------------------------------------
export async function saveDraft(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const tagName = str(formData, "tag");
  let tag_id: number | null = null;
  if (tagName) {
    const { data } = await supabase.from("tags").select("id").eq("name", tagName).maybeSingle();
    tag_id = data?.id ?? null;
  }
  const row = {
    slug: z.string().regex(/^[a-z0-9-]+$/).parse(str(formData, "slug")),
    title: z.string().min(1).parse(str(formData, "title")),
    summary: z.string().min(1).parse(str(formData, "summary")),
    body: z.string().min(1).parse(str(formData, "body")),
    image_url: str(formData, "image_url"),
    tag_id,
    published_at: formData.get("publish") === "on" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const { data: draft, error } = await supabase.from("policy_drafts").insert(row).select("id").single();
  if (error || !draft) throw new Error(error?.message ?? "保存に失敗しました");

  const postIds = String(formData.get("post_ids") ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => z.string().uuid().safeParse(s).success);
  if (postIds.length) {
    await supabase.from("policy_draft_posts").insert(postIds.map((post_id) => ({ draft_id: draft.id, post_id })));
  }
  revalidatePath("/drafts");
  revalidatePath("/admin/drafts");
  revalidatePath("/");
}

export async function toggleDraftPublished(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const publish = formData.get("publish") === "true";
  await supabase
    .from("policy_drafts")
    .update({ published_at: publish ? new Date().toISOString() : null })
    .eq("id", String(formData.get("id")));
  revalidatePath("/drafts");
  revalidatePath("/admin/drafts");
  revalidatePath("/");
}

export async function saveNotice(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("notices").insert({
    title: z.string().min(1).parse(str(formData, "title")),
    body: z.string().min(1).parse(str(formData, "body")),
    published_at: formData.get("publish") === "on" ? new Date().toISOString() : null,
  });
  revalidatePath("/news");
  revalidatePath("/admin/notices");
  revalidatePath("/");
}

export async function toggleNoticePublished(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const publish = formData.get("publish") === "true";
  await supabase
    .from("notices")
    .update({ published_at: publish ? new Date().toISOString() : null })
    .eq("id", String(formData.get("id")));
  revalidatePath("/news");
  revalidatePath("/admin/notices");
}
