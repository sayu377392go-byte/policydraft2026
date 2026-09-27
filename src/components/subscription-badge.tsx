import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "@/lib/types";

const LABELS: Record<SubscriptionStatus, { label: string; variant: "success" | "warning" | "danger" | "outline" }> = {
  active: { label: "Active(有効)", variant: "success" },
  pending: { label: "入金確認待ち", variant: "warning" },
  unpaid: { label: "Unpaid(未払い)", variant: "danger" },
  inactive: { label: "Inactive(未契約・解約済み)", variant: "outline" },
};

export function SubscriptionBadge({ status }: { status: SubscriptionStatus | undefined }) {
  const s = LABELS[status ?? "inactive"];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
