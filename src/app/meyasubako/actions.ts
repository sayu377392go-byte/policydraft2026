"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, isSubscriptionActive } from "@/lib/data";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; ok?: boolean } | undefined;

const bodySchema = z.string().trim().min(1, "本文を入力してください").max(1000, "本文は1000文字以内で入力してください");

function parseTags(formData: FormData) {
  const preset = formData.getAll("tags").map(String);
  const free = String(formData.get("free_tags") ?? "")
    .split(/[\s,、#＃]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return [...new Set([...preset, ...free])].slice(0, 5).map((t) => t.slice(0, 30));
}

async function attachTags(postId: string, names: string[]) {
  if (names.length === 0) return;
  const supabase = await createClient();
  const { data: existing } = await supabase.from("tags").select("id, name").in("name", names);
  const known = new Map((existing ?? []).map((t) => [t.name, t.id]));
  const missing = names.filter((n) => !known.has(n));
  if (missing.length) {
    const { data: created } = await supabase
      .from("tags")
      .insert(missing.map((name) => ({ name, is_preset: false })))
      .select("id, name");
    (created ?? []).forEach((t) => known.set(t.name, t.id));
  }
  const rows = names.filter((n) => known.has(n)).map((n) => ({ post_id: postId, tag_id: known.get(n)! }));
  if (rows.length) await supabase.from("post_tags").insert(rows);
}

export async function createPost(_: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemoMode) return { error: "デモモードでは投稿できません" };
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/meyasubako/new");
  if (user.role !== "student") return { error: "新規投稿は学生ユーザーのみ可能です" };

  const body = bodySchema.safeParse(formData.get("body"));
  if (!body.success) return { error: body.error.issues[0].message };
  const target = String(formData.get("target_politician_id") ?? "") || null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, body: body.data, target_politician_id: target })
    .select("id")
    .single();
  if (error || !data) return { error: "投稿に失敗しました。時間をおいて再度お試しください" };

  await attachTags(data.id, parseTags(formData));
  revalidatePath("/meyasubako");
  redirect(`/meyasubako/${data.id}`);
}

export async function createReply(_: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemoMode) return { error: "デモモードでは返信できません" };
  const user = await getCurrentUser();
  if (!user) return { error: "返信するにはログインしてください" };

  const body = bodySchema.safeParse(formData.get("body"));
  if (!body.success) return { error: body.error.issues[0].message };
  const parentId = z.string().uuid().safeParse(formData.get("parent_id"));
  if (!parentId.success) return { error: "返信先が見つかりません" };

  let official_politician_id: string | null = null;
  if (user.role === "politician") {
    // 要件 3.4 ③: Active でなければ回答不可(RLS でも同じ条件で拒否される)
    if (!user.politician || !isSubscriptionActive(user.subscription)) {
      return { error: "公式回答にはプランへの加入(Active)が必要です" };
    }
    official_politician_id = user.politician.id;
  } else if (user.role !== "student") {
    return { error: "このアカウントでは返信できません" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("posts").insert({
    author_id: user.id,
    parent_id: parentId.data,
    body: body.data,
    official_politician_id,
  });
  if (error) return { error: "返信に失敗しました" };

  revalidatePath(`/meyasubako/${formData.get("thread_id")}`);
  return { ok: true };
}

export async function reportPost(_: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemoMode) return { error: "デモモードでは通報できません" };
  const user = await getCurrentUser();
  if (!user) return { error: "通報するにはログインしてください" };
  const postId = String(formData.get("post_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (!reason) return { error: "理由を選択してください" };

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({ post_id: postId, reporter_id: user.id, reason });
  if (error?.code === "23505") return { ok: true }; // 通報済み
  if (error) return { error: "通報に失敗しました" };
  return { ok: true };
}

export async function deleteOwnPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", String(formData.get("post_id"))).eq("author_id", user.id);
  revalidatePath("/mypage");
  revalidatePath("/meyasubako");
}
