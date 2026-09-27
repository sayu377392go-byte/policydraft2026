import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SimpleMarkdown } from "@/components/simple-markdown";
import { getNotice } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const n = await getNotice(id);
  return { title: n?.title ?? "お知らせ" };
}

export default async function NoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = await getNotice(id);
  if (!n) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> お知らせ一覧
      </Link>
      {n.published_at && <p className="mt-6 text-sm text-muted-foreground">{formatDate(n.published_at)}</p>}
      <h1 className="mt-1 text-2xl font-bold">{n.title}</h1>
      <div className="mt-6">
        <SimpleMarkdown source={n.body} />
      </div>
    </article>
  );
}
