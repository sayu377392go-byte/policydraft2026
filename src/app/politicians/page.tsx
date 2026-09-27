import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getPoliticians } from "@/lib/data";
import { PoliticianBrowser } from "./politician-browser";

export const metadata: Metadata = { title: "政治家ナビ" };

export default async function PoliticiansPage() {
  const politicians = await getPoliticians();
  return (
    <>
      <PageHeader title="政治家ナビ" description="あなたの選挙区の政治家を探して、人柄やビジョンを知り、目安箱から直接声を届けましょう。" />
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <PoliticianBrowser
          politicians={politicians.map(({ id, slug, name, name_kana, party_id, prefecture, district, photo_url }) => ({
            id, slug, name, name_kana, party_id, prefecture, district, photo_url,
          }))}
        />
      </div>
    </>
  );
}
