export const SITE_NAME = "政策ドラフト";
export const SITE_TAGLINE = "みんなの声で、未来をつくる";
export const SITE_CONCEPT = "投票以上、出馬未満。";

export const NAV_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/meyasubako", label: "目安箱" },
  { href: "/politicians", label: "政治家ナビ" },
  { href: "/drafts", label: "政策ドラフト" },
  { href: "/news", label: "お知らせ" },
] as const;

/** 政党マスター(要件定義書 3.2 ①)。色は政党カラーバッジ用の仮置き */
export const PARTIES = [
  { id: "ldp", name: "自由民主党", color: "#d7263d" },
  { id: "ishin", name: "日本維新の会", color: "#6ab04c" },
  { id: "dpfp", name: "国民民主党", color: "#f7b500" },
  { id: "komeito", name: "公明党", color: "#e84393" },
  { id: "reiwa", name: "れいわ新選組", color: "#e056a0" },
  { id: "sanseito", name: "参政党", color: "#f08c00" },
  { id: "jcp", name: "日本共産党", color: "#c0392b" },
  { id: "hoshu", name: "日本保守党", color: "#1e3799" },
  { id: "sdp", name: "社会民主党", color: "#0984e3" },
  { id: "regional", name: "地域政党・その他", color: "#7f8c8d" },
  { id: "independent", name: "無所属", color: "#95a5a6" },
] as const;

export type PartyId = (typeof PARTIES)[number]["id"];

export function partyOf(id: string) {
  return PARTIES.find((p) => p.id === id) ?? PARTIES[PARTIES.length - 1];
}

/** 政策分野のプリセットハッシュタグ(要件定義書 3.3 ②) */
export const PRESET_TAGS = [
  "少子化対策",
  "教育・子育て",
  "防衛・安全保障",
  "経済・賃上げ",
  "雇用・労働",
  "環境・エネルギー",
  "デジタル・AI",
  "若者参画",
  "医療・福祉",
  "地方創生",
] as const;

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

/** 政治家向け料金(要件定義書 3.4 ①) */
export const PLANS = {
  monthly: { label: "月額プラン", price: 4400, unit: "月", note: "自動継続課金" },
  yearly: { label: "年一括プラン", price: 50000, unit: "年", note: "月額より約2,800円お得" },
} as const;

export type PlanType = keyof typeof PLANS;

/** 銀行振込先(本番値は環境変数で上書き) */
export const BANK_ACCOUNT = {
  bank: process.env.BANK_NAME ?? "〇〇銀行",
  branch: process.env.BANK_BRANCH ?? "〇〇支店",
  type: process.env.BANK_ACCOUNT_TYPE ?? "普通",
  number: process.env.BANK_ACCOUNT_NUMBER ?? "0000000",
  holder: process.env.BANK_ACCOUNT_HOLDER ?? "セイサクドラフト(カ",
};
