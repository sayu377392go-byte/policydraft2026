import type { Metadata } from "next";
import Link from "next/link";
import { DraftThumb } from "@/components/draft-thumb";
import { PageHeader } from "@/components/page-header";
import { getDrafts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "政策ドラフト" };

export default async function DraftsPage() {
  const drafts = await getDrafts();
  return (
    <>
      <PageHeader title="政策ドラフト" description="目安箱に集まった声と議論をもとにまとめた政策のたたき台です。" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {drafts.map((d) => (
            <li key={d.id}>
              <Link href={`/drafts/${d.slug}`} className="group block h-full overflow-hidden rounded-lg border border-border bg-white transition hover:shadow-md">
                <DraftThumb imageUrl={d.image_url} tag={d.tag} seed={d.slug} className="aspect-[16/9] rounded-none" />
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {d.published_at && <time>{formatDate(d.published_at)}</time>}
                    {d.tag && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-teal-700">#{d.tag}</span>}
                  </div>
                  <h2 className="mt-2 font-bold leading-snug group-hover:text-primary">{d.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">{d.summary}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {drafts.length === 0 && <p className="text-center text-sm text-muted-foreground">まだ公開された政策ドラフトはありません</p>}
      </div>
    </>
  );
}
