import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, TrendingUp, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { PRESET_TAGS } from "@/lib/constants";
import { getTimeline, getTrendingTags } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "目安箱" };

export default async function MeyasubakoPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  const [posts, trending] = await Promise.all([getTimeline({ tag }), getTrendingTags()]);

  return (
    <>
      <PageHeader title="目安箱" description="社会課題への意識や政策提言を、だれでも閲覧できるオープンなタイムラインで共有しましょう。">
        <Button asChild size="lg" className="mt-6">
          <Link href="/meyasubako/new">
            <PenLine /> 声を投稿する
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          {/* 政策分野フィルター */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
            <Link
              href="/meyasubako"
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm",
                !tag ? "border-primary bg-primary text-white" : "border-border bg-white",
              )}
            >
              すべて
            </Link>
            {PRESET_TAGS.map((t) => (
              <Link
                key={t}
                href={`/meyasubako?tag=${encodeURIComponent(t)}`}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm",
                  tag === t ? "border-teal-500 bg-teal-500 text-white" : "border-border bg-white hover:border-teal-400",
                )}
              >
                #{t}
              </Link>
            ))}
          </div>

          {tag && (
            <p className="mt-4 flex items-center gap-2 text-sm">
              <span className="font-bold">#{tag}</span> の投稿
              <Link href="/meyasubako" className="inline-flex items-center text-muted-foreground hover:text-primary">
                <X className="size-4" /> 解除
              </Link>
            </p>
          )}

          <div className="mt-4 space-y-4">
            {posts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                まだ投稿がありません
              </p>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>
        </div>

        {/* サイドバー: トレンドハッシュタグ(要件 3.3 ②) */}
        <aside className="order-first lg:order-none">
          <div className="rounded-lg border border-border bg-white p-5 lg:sticky lg:top-28">
            <h2 className="flex items-center gap-2 font-bold">
              <TrendingUp className="size-5 text-teal-500" />
              注目されている政策分野
            </h2>
            <ol className="mt-4 space-y-2">
              {trending.map((t, i) => (
                <li key={t.name}>
                  <Link
                    href={`/meyasubako?tag=${encodeURIComponent(t.name)}`}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <span className="w-4 text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <span className="flex-1">#{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.post_count}件</span>
                  </Link>
                </li>
              ))}
              {trending.length === 0 && <li className="text-sm text-muted-foreground">集計中です</li>}
            </ol>
          </div>
        </aside>
      </div>
    </>
  );
}
