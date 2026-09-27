"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PREFECTURES } from "@/lib/constants";
import { signUpStudent } from "../auth/actions";

function Private() {
  return <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">非公開</span>;
}
function Public() {
  return <span className="ml-2 rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">表示あり</span>;
}

/** 学生ユーザー登録フォーム(要件定義書 3.1) */
export function StudentSignupForm() {
  const [state, action, pending] = useActionState(signUpStudent, undefined);
  const [worker, setWorker] = useState(false);

  if (state?.message) {
    return <p className="rounded-lg bg-teal-50 p-4 text-sm leading-relaxed text-teal-800">{state.message}</p>;
  }

  return (
    <form action={action} className="space-y-5">
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-bold text-muted-foreground">アカウント</legend>
        <div>
          <Label htmlFor="email">メールアドレス<Private /></Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">パスワード(8文字以上)</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-bold text-muted-foreground">プロフィール</legend>
        <div>
          <Label htmlFor="full_name">氏名<Private /></Label>
          <Input id="full_name" name="full_name" autoComplete="name" required />
        </div>
        <div>
          <Label htmlFor="birth_date">生年月日<span className="ml-2 text-[10px] text-muted-foreground">(年代のみ表示)</span></Label>
          <Input id="birth_date" name="birth_date" type="date" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="prefecture">都道府県<Public /></Label>
            <Select id="prefecture" name="prefecture" required defaultValue="">
              <option value="" disabled>選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="city">市区町村<Private /></Label>
            <Input id="city" name="city" />
          </div>
        </div>
        <div>
          <Label htmlFor="district">衆院小選挙区<Public /></Label>
          <Input id="district" name="district" placeholder="例: 大阪1区" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_worker" checked={worker} onChange={(e) => setWorker(e.target.checked)} />
          社会人です
        </label>
        {!worker && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <Label htmlFor="affiliation">大学・学校名<Public /></Label>
              <Input id="affiliation" name="affiliation" required={!worker} placeholder="例: 〇〇大学" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="faculty">学部</Label>
              <Input id="faculty" name="faculty" />
            </div>
            <div>
              <Label htmlFor="grade">学年<Public /></Label>
              <Input id="grade" name="grade" placeholder="例: 3年" />
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="nickname">ニックネーム(任意)<Public /></Label>
          <Input id="nickname" name="nickname" maxLength={30} />
          <p className="mt-1 text-xs text-muted-foreground">
            未設定の場合は「〇〇大学3年 / 20代 / 大阪1区」の形式で表示されます。
          </p>
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="agree" required className="mt-1" />
        <span>
          <Link href="/terms" className="text-primary underline">利用規約</Link>・
          <Link href="/guidelines" className="text-primary underline">ガイドライン</Link>・
          <Link href="/privacy" className="text-primary underline">プライバシーポリシー</Link>に同意します
        </span>
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "送信中…" : "無料で登録する"}
      </Button>
    </form>
  );
}
