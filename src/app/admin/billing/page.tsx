import { SubscriptionBadge } from "@/components/subscription-badge";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { activateBankTransfer, setSubscriptionStatus } from "../actions";

/** 課金・契約管理(要件 3.4 ④) */
export default async function AdminBilling() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*, politicians(name, district)")
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as (Subscription & { politicians: { name: string; district: string } | null })[];

  return (
    <div>
      <h1 className="text-2xl font-bold">課金・契約</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-3">政治家</th>
              <th className="p-3">状態</th>
              <th className="p-3">プラン / 支払方法</th>
              <th className="p-3">有効期限</th>
              <th className="p-3">Stripe / 振込ID</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((s) => (
              <tr key={s.politician_id} className={s.status === "pending" ? "bg-amber-50/60" : undefined}>
                <td className="p-3 font-bold">{s.politicians?.name}</td>
                <td className="p-3"><SubscriptionBadge status={s.status} /></td>
                <td className="p-3">
                  {s.plan_type ? PLANS[s.plan_type].label : "—"}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {s.payment_method === "stripe" ? "クレジットカード" : s.payment_method === "bank_transfer" ? "銀行振込" : "—"}
                  </span>
                </td>
                <td className="p-3">{s.period_end ? formatDate(s.period_end) : "—"}</td>
                <td className="p-3 font-mono text-xs">
                  {s.stripe_subscription_id ?? ""}
                  {s.bank_transfer_code && <div>{s.bank_transfer_code}</div>}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {s.payment_method !== "stripe" && (
                      <form action={activateBankTransfer}>
                        <input type="hidden" name="politician_id" value={s.politician_id} />
                        <input type="hidden" name="plan" value={s.plan_type ?? "monthly"} />
                        <Button size="sm">入金消込・Active昇格</Button>
                      </form>
                    )}
                    {s.status === "active" && (
                      <form action={setSubscriptionStatus}>
                        <input type="hidden" name="politician_id" value={s.politician_id} />
                        <input type="hidden" name="status" value="inactive" />
                        <Button size="sm" variant="ghost">無効にする</Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">契約はまだありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        クレジットカード契約の状態は Stripe Webhook で自動更新されます。銀行振込は入金確認後に「入金消込・Active昇格」を押すと、プラン期間分だけ有効期限が延長されます。
      </p>
    </div>
  );
}
