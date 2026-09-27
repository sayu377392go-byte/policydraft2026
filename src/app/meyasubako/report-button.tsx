"use client";

import { useActionState, useRef } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportPost } from "./actions";

const REASONS = ["誹謗中傷・差別的な内容", "公職選挙法に抵触するおそれ", "個人情報の掲載", "スパム・宣伝", "その他"];

/** 通報ボタン(要件 5-2) */
export function ReportButton({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(reportPost, undefined);
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600"
      >
        <Flag className="size-3.5" /> 通報
      </button>
      <dialog ref={ref} className="m-auto w-[min(92vw,420px)] rounded-2xl p-6 backdrop:bg-slate-900/40">
        {state?.ok ? (
          <div>
            <p className="text-sm">通報を受け付けました。運営が確認します。</p>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => ref.current?.close()}>
                閉じる
              </Button>
            </div>
          </div>
        ) : (
          <form action={action} className="space-y-3">
            <h2 className="font-bold">この投稿を通報する</h2>
            <input type="hidden" name="post_id" value={postId} />
            {REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm">
                <input type="radio" name="reason" value={r} required /> {r}
              </label>
            ))}
            {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => ref.current?.close()}>
                キャンセル
              </Button>
              <Button type="submit" variant="destructive" disabled={pending}>
                通報する
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
