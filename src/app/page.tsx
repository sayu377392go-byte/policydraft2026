import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageSquareText, NotebookPen, Users } from "lucide-react";
import { DraftThumb } from "@/components/draft-thumb";
import { Hero } from "@/components/hero";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { SITE_CONCEPT } from "@/lib/constants";
import { getDrafts, getNotices, getTimeline } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [drafts, posts, notices] = await Promise.all([getDrafts(4), getTimeline({ limit: 3 }), getNotices(3)]);

  return (
    <>
      <Hero />

      {/* 新着の政策ドラフト(トップイメージ下段) */}
      <section className="relative border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-wide">
              <NotebookPen className="size-5 text-teal-500" />
              新着の政策ドラフト
            </h2>
            <Link href="/drafts" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-primary">
              一覧を見る <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
            {drafts.map((d) => (
              <li key={d.id} className="lg:pl-4 lg:first:pl-0">
                <Link href={`/drafts/${d.slug}`} className="group flex gap-3">
                  <DraftThumb imageUrl={d.image_url} tag={d.tag} seed={d.slug} className="h-16 w-24 shrink-0" />
                  <div className="min-w-0">
                    {d.published_at && <p className="text-xs text-muted-foreground">{formatDate(d.published_at)}</p>}
                    <p className="mt-0.5 line-clamp-2 text-sm leading-snug group-hover:text-primary">{d.title}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="pointer-events-none absolute -top-10 right-6 hidden -rotate-12 font-script text-2xl leading-tight text-sky-600/80 xl:block">
          Your Voice
          <br />
          Creates
          <br />
          The Future
        </p>
      </section>

      {/* 使い方 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-center text-sm font-bold tracking-widest text-teal-600">{SITE_CONCEPT}</p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold md:text-3xl">声が政策になるまで</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: MessageSquareText, title: "目安箱に投稿", body: "政策分野のハッシュタグをワンタップで選んで、あなたの課題意識を投稿。氏名は一切表示されません。" },
            { icon: BadgeCheck, title: "政治家が公式に回答", body: "認証バッジ付きの政治家が、あなたの投稿に直接返信。双方向の議論が生まれます。" },
            { icon: NotebookPen, title: "政策ドラフトへ", body: "集まった声と議論を、政策ドラフトとしてまとめて公開。公約化・政策化を後押しします。" },
          ].map((s, i) => (
            <li key={s.title} className="glass rounded-2xl p-6">
              <span className="text-xs font-bold text-sky-600">STEP {i + 1}</span>
              <s.icon className="mt-3 size-8 text-teal-500" />
              <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 最新の声 */}
      <section className="bg-muted/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">目安箱の最新の声</h2>
            <Link href="/meyasubako" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-primary">
              もっと見る <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </section>

      {/* お知らせ + CTA */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">お知らせ</h2>
          <ul className="mt-4 divide-y divide-border">
            {notices.map((n) => (
              <li key={n.id}>
                <Link href={`/news/${n.id}`} className="flex gap-4 py-3 text-sm hover:text-primary">
                  {n.published_at && <time className="shrink-0 text-muted-foreground">{formatDate(n.published_at)}</time>}
                  <span>{n.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-brand-gradient rounded-2xl p-8 text-white">
          <Users className="size-8" />
          <h2 className="mt-3 text-xl font-bold">学生・若者のみなさんへ</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/90">
            登録は無料。所属・年代・エリアだけが表示されるので、安心して声を届けられます。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-white text-primary shadow-none hover:bg-white/90">
              <Link href="/signup">無料で登録する</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/70 bg-transparent text-white hover:bg-white/10">
              <Link href="/for-politicians">政治家の方へ</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
