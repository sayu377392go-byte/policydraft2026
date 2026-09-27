import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MessagesSquare, UserRoundPen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/constants";

export const metadata: Metadata = { title: "政治家の方へ" };

export default function ForPoliticiansPage() {
  return (
    <>
      <PageHeader title="政治家の方へ" description="若者・学生の生の声に、公式アカウントで直接応えませんか。" />
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: UserRoundPen, title: "プロフィールは運営が代理作成", body: "写真・公約・人柄が伝わる項目を、運営がヒアリングして掲載します。" },
            { icon: BadgeCheck, title: "認証バッジ付きで公式回答", body: "顔写真と認証バッジ付きの返信で、本人の言葉であることが一目でわかります。" },
            { icon: MessagesSquare, title: "選挙区の声を把握", body: "あなた宛ての投稿や、分野別のトレンドから若い世代の関心がわかります。" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-white p-6">
              <f.icon className="size-7 text-teal-500" />
              <h2 className="mt-3 font-bold">{f.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
        <section>
          <h2 className="text-xl font-bold">料金</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Object.values(PLANS).map((p) => (
              <div key={p.label} className="rounded-2xl border border-border bg-white p-6">
                <p className="font-bold">{p.label}</p>
                <p className="mt-2"><span className="text-3xl font-bold">{p.price.toLocaleString()}</span>円(税込)/ {p.unit}</p>
                <p className="mt-1 text-xs text-teal-700">{p.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">お支払いはクレジットカード(Stripe)または銀行振込に対応しています。</p>
        </section>
        <div className="text-center">
          <Button asChild size="lg"><Link href="/signup/politician">アカウントを申請する</Link></Button>
        </div>
      </div>
    </>
  );
}
