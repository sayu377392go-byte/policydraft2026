import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PenLine } from "lucide-react";
import { PartyBadge } from "@/components/party-badge";
import { PoliticianAvatar } from "@/components/politician-avatar";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { getPolitician, getPostsForPolitician } from "@/lib/data";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPolitician(slug);
  return { title: p ? `${p.name}(${p.name_kana})` : "政治家ナビ" };
}

function Section({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <div>
      <h3 className="text-sm font-bold text-teal-700">{title}</h3>
      <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed">{body}</p>
    </div>
  );
}

export default async function PoliticianPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ slug }, { tab }] = await Promise.all([params, searchParams]);
  const p = await getPolitician(slug);
  if (!p) notFound();
  const { received, answered } = await getPostsForPolitician(p.id);
  const activeTab = tab === "answers" ? "answers" : "voices";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/politicians" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> 政治家ナビに戻る
      </Link>

      {/* 基本情報 */}
      <section className="mt-4 flex flex-col items-center gap-6 rounded-2xl border border-border bg-white p-6 sm:flex-row sm:items-start">
        <PoliticianAvatar name={p.name} photoUrl={p.photo_url} className="size-36 shrink-0" sizes="144px" />
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground">{p.name_kana}</p>
          <h1 className="font-display text-3xl font-bold">{p.name}</h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <PartyBadge partyId={p.party_id} />
            <span className="text-sm text-slate-600">{p.district}</span>
          </div>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {p.hometown && (
              <>
                <dt className="text-muted-foreground">出身地</dt>
                <dd>{p.hometown}</dd>
              </>
            )}
            {p.alma_mater && (
              <>
                <dt className="text-muted-foreground">出身大学</dt>
                <dd>{p.alma_mater}</dd>
              </>
            )}
          </dl>
          <Button asChild className="mt-5">
            <Link href={`/meyasubako/new?to=${p.id}`}>
              <PenLine /> この政治家に声を届ける
            </Link>
          </Button>
        </div>
      </section>

      {p.message_to_youth && (
        <section className="bg-brand-gradient mt-6 rounded-2xl p-6 text-white">
          <h2 className="text-sm font-bold opacity-90">若者へのメッセージ</h2>
          <p className="mt-2 font-display text-xl leading-relaxed">{p.message_to_youth}</p>
        </section>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="space-y-5 rounded-2xl border border-border bg-white p-6">
          <h2 className="font-bold">パーソナリティ・人柄</h2>
          <Section title="学生時代の将来の夢" body={p.childhood_dream} />
          <Section title="自分の特殊能力" body={p.special_ability} />
        </section>
        <section className="space-y-5 rounded-2xl border border-border bg-white p-6">
          <h2 className="font-bold">政策・ビジョン</h2>
          <Section title="政策公約" body={p.manifesto} />
          <Section title="過去 & 未来" body={p.past_and_future} />
          <Section title="政策への行動" body={p.policy_actions} />
        </section>
      </div>

      {/* 連動タブ */}
      <section className="mt-10">
        <div className="flex border-b border-border" role="tablist">
          {[
            { key: "voices", label: `寄せられた声(${received.length})`, href: `/politicians/${p.slug}` },
            { key: "answers", label: `公式回答(${answered.length})`, href: `/politicians/${p.slug}?tab=answers` },
          ].map((t) => (
            <Link
              key={t.key}
              href={t.href}
              scroll={false}
              role="tab"
              aria-selected={activeTab === t.key}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 text-sm font-medium",
                activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 space-y-4">
          {(activeTab === "voices" ? received : answered).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {(activeTab === "voices" ? received : answered).length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">まだありません</p>
          )}
        </div>
      </section>
    </div>
  );
}
