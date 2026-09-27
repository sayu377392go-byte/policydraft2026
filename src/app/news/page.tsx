import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getNotices } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "お知らせ" };

export default async function NewsPage() {
  const notices = await getNotices();
  return (
    <>
      <PageHeader title="お知らせ" />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ul className="divide-y divide-border rounded-lg border border-border bg-white">
          {notices.map((n) => (
            <li key={n.id}>
              <Link href={`/news/${n.id}`} className="flex flex-col gap-1 p-4 hover:bg-muted sm:flex-row sm:gap-6">
                {n.published_at && <time className="shrink-0 text-sm text-muted-foreground">{formatDate(n.published_at)}</time>}
                <span>{n.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
