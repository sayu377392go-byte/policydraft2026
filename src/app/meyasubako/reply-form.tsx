"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { BadgeCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { createReply } from "./actions";

type Mode = "guest" | "student" | "official" | "locked" | "disabled";

export function ReplyForm({ parentId, threadId, mode }: { parentId: string; threadId: string; mode: Mode }) {
  const [state, action, pending] = useActionState(createReply, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  if (mode === "disabled") return null;

  if (mode === "guest") {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-4 text-center text-sm">
        返信するには
        <Link href={`/login?next=/meyasubako/${threadId}`} className="mx-1 font-bold text-primary underline">
          ログイン
        </Link>
        してください
      </div>
    );
  }

  // 要件 3.4 ③: 未払い・解約済みの政治家は回答フォーム無効 + 加入を促すモーダル
  if (mode === "locked") {
    return (
      <>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted p-4 text-left text-sm text-muted-foreground"
        >
          <Lock className="size-4" /> 公式回答はプラン加入後に利用できます
        </button>
        <dialog ref={dialogRef} className="m-auto w-[min(92vw,420px)] rounded-2xl p-6 backdrop:bg-slate-900/40">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <BadgeCheck className="size-5 text-sky-600" />
            公式回答プランのご案内
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            目安箱への公式回答(認証バッジ・顔写真付き)は、プランが有効(Active)な政治家アカウントのみご利用いただけます。
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => dialogRef.current?.close()}>
              閉じる
            </Button>
            <Button asChild>
              <Link href="/politician/plan">プランを確認する</Link>
            </Button>
          </div>
        </dialog>
      </>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="parent_id" value={parentId} />
      <input type="hidden" name="thread_id" value={threadId} />
      <Textarea
        name="body"
        required
        maxLength={1000}
        rows={3}
        placeholder={mode === "official" ? "公式回答を入力(認証バッジ付きで表示されます)" : "返信を入力"}
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {mode === "official" && <BadgeCheck />}
          {pending ? "送信中…" : mode === "official" ? "公式回答する" : "返信する"}
        </Button>
      </div>
    </form>
  );
}
