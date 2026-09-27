import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "コミュニティガイドライン" };

export default function GuidelinesPage() {
  return (
    <>
      <PageHeader title="コミュニティガイドライン" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-[15px] leading-relaxed">
        <p>政策ドラフトは、立場の違う人どうしが建設的に議論する場所です。次のような投稿は、運営の判断で非表示にすることがあります。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>特定の個人・団体への誹謗中傷、差別的な表現</li>
          <li>公職選挙法に抵触するおそれのある投稿(選挙期間中の投票依頼など)</li>
          <li>自分や他人の個人情報を含む投稿</li>
          <li>宣伝・スパム、政策と関係のない投稿</li>
        </ul>
        <p>問題のある投稿を見つけたら、投稿の「通報」ボタンからお知らせください。</p>
        <p className="text-sm text-muted-foreground">※ 本文は仮の内容です。公開前に法務確認のうえ差し替えてください。</p>
      </div>
    </>
  );
}
