"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PRESET_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { createPost } from "./actions";

export function PostForm({
  politicians,
  defaultTarget,
}: {
  politicians: { id: string; name: string }[];
  defaultTarget?: string;
}) {
  const [state, action, pending] = useActionState(createPost, undefined);
  const [selected, setSelected] = useState<string[]>([]);
  const [length, setLength] = useState(0);

  const toggle = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : s.length < 5 ? [...s, t] : s));

  return (
    <form action={action} className="space-y-6">
      <div>
        <Label htmlFor="body">あなたの声</Label>
        <Textarea
          id="body"
          name="body"
          required
          maxLength={1000}
          rows={6}
          placeholder="例: 地方の公共交通を維持するための支援をお願いします。"
          onChange={(e) => setLength(e.target.value.length)}
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{length} / 1000</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">政策分野(ワンタップで選択・最大5つ)</legend>
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((t) => {
            const on = selected.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => toggle(t)}
                aria-pressed={on}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  on ? "border-teal-500 bg-teal-500 text-white" : "border-border bg-white text-slate-700 hover:border-teal-400",
                )}
              >
                #{t}
              </button>
            );
          })}
        </div>
        {selected.map((t) => (
          <input key={t} type="hidden" name="tags" value={t} />
        ))}
        <Input name="free_tags" className="mt-3" placeholder="自由入力タグ(スペース区切り) 例: 奨学金 家賃" />
      </fieldset>

      <div>
        <Label htmlFor="target">宛先の政治家(任意)</Label>
        <Select id="target" name="target_politician_id" defaultValue={defaultTarget ?? ""}>
          <option value="">指定しない(全体に公開)</option>
          {politicians.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <p className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
        投稿には氏名・メールアドレスは表示されず、ニックネーム、または「所属 / 年代 / エリア」が表示されます。誹謗中傷や公職選挙法に抵触するおそれのある投稿は非表示になることがあります。
      </p>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "投稿中…" : "投稿する"}
      </Button>
    </form>
  );
}
