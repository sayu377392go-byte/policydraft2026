import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PLANS } from "@/lib/constants";
import { OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "特定商取引法に基づく表記" };

const yen = (n: number) => `${n.toLocaleString()}円(税込)`;

export default function TokushohoPage() {
  const rows: [string, React.ReactNode][] = [
    ["販売事業者", OPERATOR.name],
    ["運営統括責任者", OPERATOR.representative],
    ["所在地", OPERATOR.address],
    ["電話番号", OPERATOR.phone],
    ["メールアドレス", OPERATOR.email],
    ["販売価格", <>政治家向け公式回答プラン<br />{PLANS.monthly.label}: {yen(PLANS.monthly.price)} / 月<br />{PLANS.yearly.label}: {yen(PLANS.yearly.price)} / 年</>],
    ["商品代金以外の必要料金", "銀行振込の場合の振込手数料はお客様のご負担となります。インターネット接続料金・通信料金はお客様のご負担となります。"],
    ["支払方法", "クレジットカード決済(Stripe)、銀行振込"],
    ["支払時期", "クレジットカード: お申込み時に決済され、以降は契約期間ごとに自動で決済されます。銀行振込: お申込み後、案内する期日までにお振込みください。"],
    ["サービス提供時期", "クレジットカード: 決済完了後すぐにご利用いただけます。銀行振込: 入金確認後、運営が有効化した時点からご利用いただけます。"],
    ["解約・返金", "解約はマイページの「解約・カード変更・領収書」からいつでも行えます。解約後も契約期間の末日まではご利用いただけます。サービスの性質上、お支払い済みの料金の返金には応じられません。【要確認】"],
    ["動作環境", "最新版の Google Chrome、Safari、Microsoft Edge、Firefox"],
  ];
  return (
    <LegalPage title="特定商取引法に基づく表記">
      <dl className="divide-y divide-border rounded-lg border border-border bg-white">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 sm:grid-cols-[180px_1fr] sm:gap-4">
            <dt className="text-sm font-bold text-slate-600">{k}</dt>
            <dd className="text-sm">{v}</dd>
          </div>
        ))}
      </dl>
    </LegalPage>
  );
}
