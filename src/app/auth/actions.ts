"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "/");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  if (isDemoMode) return { error: "デモモードではログインできません" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: "メールアドレスまたはパスワードが正しくありません" };
  redirect(safeNext(formData.get("next")));
}

const studentSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
  full_name: z.string().trim().min(1, "氏名を入力してください").max(100),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "生年月日を入力してください"),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  city: z.string().trim().max(50).optional(),
  district: z.string().trim().max(30).optional(),
  affiliation: z.string().trim().min(1, "所属を入力してください").max(60),
  faculty: z.string().trim().max(60).optional(),
  grade: z.string().trim().max(20).optional(),
  nickname: z.string().trim().max(30).optional(),
  agree: z.literal("on", { message: "利用規約とプライバシーポリシーへの同意が必要です" }),
});

export async function signUpStudent(_: AuthState, formData: FormData): Promise<AuthState> {
  if (isDemoMode) return { error: "デモモードでは登録できません" };
  const raw = Object.fromEntries(formData);
  if (raw.is_worker === "on") raw.affiliation = "社会人";
  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, agree, ...meta } = parsed.data;
  void agree;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // DB トリガーで student_profiles / student_private に展開される
    options: { data: meta, emailRedirectTo: `${siteUrl()}/auth/callback?next=/mypage` },
  });
  if (error) return { error: error.message.includes("registered") ? "このメールアドレスは登録済みです" : "登録に失敗しました" };
  return { message: "確認メールを送信しました。メール内のリンクから登録を完了してください。" };
}

const politicianSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
  full_name: z.string().trim().min(1, "氏名を入力してください").max(100),
  note: z.string().trim().max(500).optional(),
});

export async function signUpPolitician(_: AuthState, formData: FormData): Promise<AuthState> {
  if (isDemoMode) return { error: "デモモードでは登録できません" };
  const parsed = politicianSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, ...meta } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { ...meta, account_type: "politician" },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/mypage`,
    },
  });
  if (error) return { error: "登録に失敗しました" };
  return { message: "確認メールを送信しました。本人確認後、運営がプロフィールを紐付けてご連絡します。" };
}

export async function signOut() {
  if (!isDemoMode) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
