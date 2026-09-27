"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/data";
import { createServiceClient } from "@/lib/supabase/server";

/** 銀行振込を申請し、固有の振込ID(注文番号)を発行する(要件 3.4 ②-2) */
export async function requestBankTransfer(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.politician) return;
  const plan = formData.get("plan") === "yearly" ? "yearly" : "monthly";
  const code = user.subscription?.bank_transfer_code ?? `PD-${randomBytes(4).toString("hex").toUpperCase()}`;

  // subscriptions の更新は RLS で管理者のみ。本人確認済みのためサーバー側で代行する
  await createServiceClient()
    .from("subscriptions")
    .upsert({
      politician_id: user.politician.id,
      plan_type: plan,
      payment_method: "bank_transfer",
      status: user.subscription?.status === "active" ? "active" : "pending",
      bank_transfer_code: code,
      bank_transfer_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  revalidatePath("/politician/plan");
}
