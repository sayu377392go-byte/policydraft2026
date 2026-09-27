import Link from "next/link";
import { BadgeCheck, MessageCircle } from "lucide-react";
import { PoliticianAvatar } from "@/components/politician-avatar";
import { TagIcon } from "@/components/tag-icon";
import type { Post } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

export function TagLink({ tag }: { tag: string }) {
  return (
    <Link
      href={`/meyasubako?tag=${encodeURIComponent(tag)}`}
      className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-teal-700 hover:bg-accent/20"
    >
      #{tag}
    </Link>
  );
}

/** 目安箱の投稿 1 件。政治家の公式リプライは顔写真と認証バッジを目立たせる(要件 3.3 ①) */
export function PostCard({ post, link = true, className }: { post: Post; link?: boolean; className?: string }) {
  const official = !!post.official_politician_id;
  const threadId = post.root_id ?? post.id;
  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-4 sm:p-5",
        official ? "border-sky-300 bg-gradient-to-br from-sky-50 to-white ring-1 ring-sky-200" : "border-border",
        className,
      )}
    >
      <header className="flex items-center gap-3">
        {official ? (
          <Link href={`/politicians/${post.author.politician_slug}`} className="shrink-0">
            <PoliticianAvatar name={post.author.display_name} photoUrl={post.author.photo_url} className="size-11" />
          </Link>
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <TagIcon tag={post.tags[0]} className="size-4 text-teal-600" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <span className="truncate">{post.author.display_name}</span>
            {official && (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white">
                <BadgeCheck className="size-3" />
                公式
              </span>
            )}
          </p>
          <time className="text-xs text-muted-foreground" dateTime={post.created_at}>
            {formatDateTime(post.created_at)}
          </time>
        </div>
      </header>
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{post.body}</p>
      {(post.tags.length > 0 || link) && (
        <footer className="mt-3 flex flex-wrap items-center gap-2">
          {post.tags.map((t) => (
            <TagLink key={t} tag={t} />
          ))}
          {link && (
            <Link
              href={`/meyasubako/${threadId}`}
              className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="size-4" />
              {post.parent_id ? "スレッドを見る" : `返信 ${post.reply_count}`}
            </Link>
          )}
        </footer>
      )}
    </article>
  );
}
