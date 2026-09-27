import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, CreditCard, Landmark } from "lucide-react";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { Button } from "@/components/ui/button";
import { BANK_ACCOUNT, PLANS, type PlanType } from "@/lib/constants";
import { getCurrentUser, isSubscriptionActive } from "@/lib/data";
import { isStripeConfigured } from "@/lib/stripe";
import { formatDate } from "@/lib/utils";
import { requestBankTransfer } from "./actions";

export const metadata: Metadata = { title: "公式回答プラン" };

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/politician/plan");
  if (user.role !== "politician") redirect("/mypage");

  const sub = user.subscription;
  const active = isSubscriptionActive(sub);
  const stripeReady = isStripeConfigured();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">公式回答プラン</h1>
      <p className="mt-2 text-sm text-slate-600">プランが有効な間、目安箱への公式回答(認証バッジ・顔写真付き)が可能です。</p>

      {status === "success" && (
        <p className="mt-6 rounded-lg bg-teal-50 p-4 text-sm text-teal-800">お申し込みありがとうございます。決済の反映まで数秒かかることがあります。</p>
      )}

      {!user.politician ? (
        <p className="mt-8 rounded-lg bg-muted p-5 text-sm">
          現在、運営が本人確認とプロフィールの紐付けを行っています。完了後にプランへ加入できるようになります。
        </p>
      ) : (
        <>
          <section className="mt-8 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-white p-5">
            <span className="text-sm text-muted-foreground">現在の状態</span>
            <SubscriptionBadge status={sub?.status} />
            {sub?.plan_type && <span className="text-sm">{PLANS[sub.plan_type].label}</span>}
            {sub?.period_end && <span className="text-sm text-muted-foreground">有効期限 {formatDate(sub.period_end)}</span>}
            {sub?.stripe_customer_id && (
              <form action="/api/stripe/portal" method="post" className="ml-auto">
                <Button variant="outline" size="sm">解約・カード変更・領収書</Button>
              </form>
            )}
          </section>

          {!active && (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {(Object.keys(PLANS) as PlanType[]).map((key) => {
                const plan = PLANS[key];
                return (
                  <section key={key} className="flex flex-col rounded-2xl border border-border bg-white p-6">
                    <h2 className="font-bold">{plan.label}</h2>
                    <p className="mt-3">
                      <span className="text-3xl font-bold">{plan.price.toLocaleString()}</span>
                      <span className="text-sm">円(税込)/ {plan.unit}</span>
                    </p>
                    <p className="mt-1 text-xs text-teal-700">{plan.note}</p>
                    <ul className="mt-4 space-y-1 text-sm text-slate-600">
                      <li className="flex gap-2"><Check className="size-4 text-teal-500" />公式回答・リプライ</li>
                      <li className="flex gap-2"><Check className="size-4 text-teal-500" />認証バッジと顔写真の表示</li>
                    </ul>
                    <div className="mt-6 space-y-2">
                      <form action="/api/stripe/checkout" method="post">
                        <input type="hidden" name="plan" value={key} />
                        <Button className="w-full" disabled={!stripeReady}>
                          <CreditCard /> クレジットカードで申し込む
                        </Button>
                      </form>
                      <form action={requestBankTransfer}>
                        <input type="hidden" name="plan" value={key} />
                        <Button variant="outline" className="w-full">
                          <Landmark /> 銀行振込で申し込む
                        </Button>
                      </form>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {!active && (
            <p className="mt-4 text-xs text-muted-foreground">
              お申し込みにより、<Link href="/terms" className="underline">利用規約</Link>と
              <Link href="/tokushoho" className="underline">特定商取引法に基づく表記</Link>の内容に同意したものとみなします。
            </p>
          )}

          {sub?.payment_method === "bank_transfer" && sub.bank_transfer_code && !active && (
            <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm">
              <h2 className="font-bold">銀行振込のご案内</h2>
              <p className="mt-2">
                下記口座へ {sub.plan_type ? `${PLANS[sub.plan_type].price.toLocaleString()}円` : "プラン料金"} をお振込みください。振込名義の前に
                <strong className="mx-1">振込ID</strong>を必ずご記入ください。入金を確認後、運営が有効化します。
              </p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                <dt className="text-muted-foreground">振込ID</dt>
                <dd className="font-mono text-base font-bold">{sub.bank_transfer_code}</dd>
                <dt className="text-muted-foreground">銀行</dt>
                <dd>{BANK_ACCOUNT.bank} {BANK_ACCOUNT.branch}</dd>
                <dt className="text-muted-foreground">口座</dt>
                <dd>{BANK_ACCOUNT.type} {BANK_ACCOUNT.number}</dd>
                <dt className="text-muted-foreground">名義</dt>
                <dd>{BANK_ACCOUNT.holder}</dd>
              </dl>
            </section>
          )}
        </>
      )}
    </div>
  );
}
