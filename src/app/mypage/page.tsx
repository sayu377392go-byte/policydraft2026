import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, PenLine } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getPostsByUser } from "@/lib/data";
import { signOut } from "../auth/actions";
import { deleteOwnPost } from "../meyasubako/actions";

export const metadata: Metadata = { title: "マイページ" };

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage");
  if (user.role === "admin") redirect("/admin");
  const posts = await getPostsByUser(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">表示名</p>
          <h1 className="text-2xl font-bold">{user.displayName}</h1>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm">
            <LogOut /> ログアウト
          </Button>
        </form>
      </div>

      {user.role === "politician" && (
        <section className="mt-6 rounded-lg border border-border bg-white p-5 text-sm">
          <h2 className="font-bold">政治家アカウント</h2>
          {user.politician ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link href={`/politicians/${user.politician.slug}`} className="text-primary hover:underline">
                公開プロフィールを見る
              </Link>
              <SubscriptionBadge status={user.subscription?.status} />
              <Button asChild size="sm" variant="outline" className="ml-auto">
                <Link href="/politician/plan">プランを管理</Link>
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-slate-600">
              <Badge variant="warning" className="mr-2">確認中</Badge>
              運営が本人確認とプロフィールの紐付けを行っています。
            </p>
          )}
        </section>
      )}

      {user.role === "student" && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">自分の投稿</h2>
            <Button asChild size="sm">
              <Link href="/meyasubako/new">
                <PenLine /> 投稿する
              </Link>
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {posts.map((p) => (
              <div key={p.id}>
                <PostCard post={p} />
                <div className="mt-1 flex items-center justify-end gap-3 px-1 text-xs">
                  {p.is_hidden && <Badge variant="danger">運営により非表示</Badge>}
                  <form action={deleteOwnPost}>
                    <input type="hidden" name="post_id" value={p.id} />
                    <button className="text-muted-foreground hover:text-red-600">削除</button>
                  </form>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">まだ投稿がありません</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
