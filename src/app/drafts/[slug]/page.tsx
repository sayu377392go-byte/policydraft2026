import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DraftThumb } from "@/components/draft-thumb";
import { PostCard } from "@/components/post-card";
import { SimpleMarkdown } from "@/components/simple-markdown";
import { getDraft } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getDraft(slug);
  return { title: result?.draft.title ?? "政策ドラフト", description: result?.draft.summary };
}

export default async function DraftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getDraft(slug);
  if (!result) notFound();
  const { draft, posts } = result;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/drafts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> 政策ドラフト一覧
      </Link>
      <DraftThumb imageUrl={draft.image_url} tag={draft.tag} seed={draft.slug} className="mt-4 aspect-[21/9]" />
      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        {draft.published_at && <time>{formatDate(draft.published_at)}</time>}
        {draft.tag && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-teal-700">#{draft.tag}</span>}
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold leading-snug md:text-3xl">{draft.title}</h1>
      <p className="mt-4 rounded-lg bg-muted p-4 text-sm leading-relaxed">{draft.summary}</p>
      <div className="mt-6">
        <SimpleMarkdown source={draft.body} />
      </div>

      {posts.length > 0 && (
        <section className="mt-12">
          <h2 className="font-bold">このドラフトのもとになった声</h2>
          <div className="mt-4 space-y-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
