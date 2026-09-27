"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { signUpPolitician } from "../../auth/actions";

export function PoliticianSignupForm() {
  const [state, action, pending] = useActionState(signUpPolitician, undefined);
  if (state?.message) {
    return <p className="rounded-lg bg-teal-50 p-4 text-sm leading-relaxed text-teal-800">{state.message}</p>;
  }
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="full_name">氏名</Label>
        <Input id="full_name" name="full_name" required />
      </div>
      <div>
        <Label htmlFor="email">メールアドレス(事務所など)</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">パスワード(8文字以上)</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      <div>
        <Label htmlFor="note">所属政党・選挙区・連絡事項</Label>
        <Textarea id="note" name="note" rows={3} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "送信中…" : "申請する"}
      </Button>
    </form>
  );
}
