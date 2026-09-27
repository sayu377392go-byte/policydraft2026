/**
 * Stripe の商品・価格・Webhook・カスタマーポータル設定をまとめて作成する。
 * 何度実行しても重複しない(lookup_key と URL で既存のものを再利用する)。
 *
 *   STRIPE_SECRET_KEY=sk_live_... NEXT_PUBLIC_SITE_URL=https://example.com \
 *     npx tsx scripts/setup/stripe.mts --out .env.production.local
 *
 * 出力された STRIPE_* の値を環境変数に設定する。--out を付けるとそのファイルに追記する(コミットしないこと)。
 */
import { appendFileSync } from "node:fs";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
if (!key || !site) {
  console.error("STRIPE_SECRET_KEY と NEXT_PUBLIC_SITE_URL を設定してください");
  process.exit(1);
}
const outIndex = process.argv.indexOf("--out");
const outFile = outIndex > 0 ? process.argv[outIndex + 1] : null;

const stripe = new Stripe(key);
const LOOKUP = { monthly: "policydraft_monthly", yearly: "policydraft_yearly" } as const;
const WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

async function ensurePrices() {
  const existing = await stripe.prices.list({ lookup_keys: Object.values(LOOKUP), active: true, limit: 10 });
  const found = new Map(existing.data.map((p) => [p.lookup_key, p]));
  let productId = existing.data[0] && (typeof existing.data[0].product === "string" ? existing.data[0].product : existing.data[0].product.id);

  if (!productId) {
    const product = await stripe.products.create({
      name: "政策ドラフト 公式回答プラン",
      description: "目安箱への公式回答(認証バッジ・顔写真付き)",
      metadata: { app: "policydraft" },
    });
    productId = product.id;
    console.log(`商品を作成しました: ${product.id}`);
  }

  const spec = {
    monthly: { amount: 4400, interval: "month" as const, nickname: "月額プラン" },
    yearly: { amount: 50000, interval: "year" as const, nickname: "年一括プラン" },
  };
  const ids: Record<keyof typeof LOOKUP, string> = { monthly: "", yearly: "" };
  for (const plan of ["monthly", "yearly"] as const) {
    const current = found.get(LOOKUP[plan]);
    if (current) {
      ids[plan] = current.id;
      console.log(`既存の価格を使います(${spec[plan].nickname}): ${current.id}`);
      continue;
    }
    const price = await stripe.prices.create({
      product: productId,
      currency: "jpy",
      unit_amount: spec[plan].amount,
      recurring: { interval: spec[plan].interval },
      tax_behavior: "inclusive", // 税込価格
      lookup_key: LOOKUP[plan],
      nickname: spec[plan].nickname,
    });
    ids[plan] = price.id;
    console.log(`価格を作成しました(${spec[plan].nickname}): ${price.id}`);
  }
  return ids;
}

async function ensureWebhook() {
  const url = `${site}/api/stripe/webhook`;
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = list.data.find((w) => w.url === url);
  if (existing) {
    await stripe.webhookEndpoints.update(existing.id, { enabled_events: WEBHOOK_EVENTS });
    console.log(`既存の Webhook を更新しました: ${existing.id}`);
    console.log("  ※ 署名シークレットは作成時にしか取得できません。不明な場合はダッシュボードで「署名シークレットを表示」するか、Webhook を削除して再実行してください。");
    return null;
  }
  const created = await stripe.webhookEndpoints.create({
    url,
    enabled_events: WEBHOOK_EVENTS,
    description: "政策ドラフト: サブスクリプション状態の同期",
  });
  console.log(`Webhook を作成しました: ${created.id}`);
  return created.secret ?? null;
}

async function ensurePortal() {
  const list = await stripe.billingPortal.configurations.list({ limit: 100 });
  const existing = list.data.find((c) => c.metadata?.app === "policydraft" && c.active);
  if (existing) {
    console.log(`既存のカスタマーポータル設定を使います: ${existing.id}`);
    return existing.id;
  }
  const config = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "政策ドラフト 公式回答プランの管理",
      privacy_policy_url: `${site}/privacy`,
      terms_of_service_url: `${site}/terms`,
    },
    features: {
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ["email", "name", "address"] },
    },
    default_return_url: `${site}/politician/plan`,
    metadata: { app: "policydraft" },
  });
  console.log(`カスタマーポータル設定を作成しました: ${config.id}`);
  return config.id;
}

const prices = await ensurePrices();
const webhookSecret = await ensureWebhook();
const portal = await ensurePortal();

const lines = [
  `STRIPE_PRICE_MONTHLY=${prices.monthly}`,
  `STRIPE_PRICE_YEARLY=${prices.yearly}`,
  `STRIPE_PORTAL_CONFIGURATION=${portal}`,
  ...(webhookSecret ? [`STRIPE_WEBHOOK_SECRET=${webhookSecret}`] : []),
];
console.log("\n# --- 環境変数に設定する値 ---");
console.log(lines.join("\n"));
if (outFile) {
  appendFileSync(outFile, `\n# Stripe(scripts/setup/stripe.mts が出力)\n${lines.join("\n")}\n`);
  console.log(`\n${outFile} に追記しました`);
}
