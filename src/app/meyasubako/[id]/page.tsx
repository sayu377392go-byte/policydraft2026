import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { getCurrentUser, getPoliticians, getThread, isSubscriptionActive } from "@/lib/data";
import { isDemoMode } from "@/lib/supabase/config";
import type { CurrentUser, Post } from "@/lib/types";
import { ReplyForm } from "../reply-form";
import { ReportButton } from "../report-button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const thread = await getThread(id);
  return { title: thread ? thread.root.body.slice(0, 30) : "目安箱" };
}

function replyMode(user: CurrentUser | null) {
  if (isDemoMode) return "disabled" as const;
  if (!user) return "guest" as const;
  if (user.role === "student") return "student" as const;
  if (user.role === "politician") return isSubscriptionActive(user.subscription) ? ("official" as const) : ("locked" as const);
  return "disabled" as const;
}

type Node = Post & { children: Node[] };

function buildTree(rootId: string, replies: Post[]): Node[] {
  const byParent = new Map<string, Post[]>();
  replies.forEach((r) => {
    const key = r.parent_id ?? rootId;
    byParent.set(key, [...(byParent.get(key) ?? []), r]);
  });
  const walk = (id: string): Node[] => (byParent.get(id) ?? []).map((r) => ({ ...r, children: walk(r.id) }));
  return walk(rootId);
}

function ReplyTree({ nodes, threadId, mode, depth }: { nodes: Node[]; threadId: string; mode: ReturnType<typeof replyMode>; depth: number }) {
  return (
    <ul className={depth > 0 ? "mt-3 space-y-3 border-l-2 border-sky-100 pl-3 sm:pl-5" : "space-y-3"}>
      {nodes.map((n) => (
        <li key={n.id}>
          <PostCard post={n} link={false} />
          <div className="mt-1 flex items-center gap-4 px-1">
            {mode !== "disabled" && mode !== "guest" && depth < 4 && (
              <details className="group flex-1">
                <summary className="cursor-pointer list-none text-xs text-muted-foreground hover:text-primary">返信する</summary>
                <div className="mt-2">
                  <ReplyForm parentId={n.id} threadId={threadId} mode={mode} />
                </div>
              </details>
            )}
            {!isDemoMode && <ReportButton postId={n.id} />}
          </div>
          {n.children.length > 0 && <ReplyTree nodes={n.children} threadId={threadId} mode={mode} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [thread, user, politicians] = await Promise.all([getThread(id), getCurrentUser(), getPoliticians()]);
  if (!thread || thread.root.is_hidden) notFound();

  const mode = replyMode(user);
  const target = politicians.find((p) => p.id === thread.root.target_politician_id);
  const tree = buildTree(thread.root.id, thread.replies);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/meyasubako" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> 目安箱に戻る
      </Link>

      {target && (
        <p className="mt-4 text-sm">
          宛先:
          <Link href={`/politicians/${target.slug}`} className="ml-1 font-bold text-primary hover:underline">
            {target.name}
          </Link>
        </p>
      )}

      <div className="mt-3">
        <PostCard post={thread.root} link={false} className="shadow-md" />
        {!isDemoMode && (
          <div className="mt-1 flex justify-end px-1">
            <ReportButton postId={thread.root.id} />
          </div>
        )}
      </div>

      <section className="mt-6">
        <ReplyForm parentId={thread.root.id} threadId={thread.root.id} mode={mode} />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-bold">返信 {thread.replies.length}件</h2>
        <ReplyTree nodes={tree} threadId={thread.root.id} mode={mode} depth={0} />
      </section>
    </div>
  );
}
