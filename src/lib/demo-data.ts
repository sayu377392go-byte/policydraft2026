/**
 * デモモード用データ(すべて架空)。
 * Supabase 未設定時の画面表示と、supabase/seed.sql の元データを兼ねる。
 */
import { SITE_IMAGES } from "./site-images";
import type { Author, Notice, Politician, PolicyDraft, Post } from "./types";

type DemoPolitician = Politician;

const p = (x: Partial<DemoPolitician> & Pick<DemoPolitician, "id" | "slug" | "name" | "name_kana" | "party_id" | "prefecture" | "district">): DemoPolitician => ({
  user_id: null,
  photo_url: null,
  hometown: null,
  alma_mater: null,
  childhood_dream: null,
  special_ability: null,
  manifesto: null,
  past_and_future: null,
  policy_actions: null,
  message_to_youth: null,
  ...x,
});

export const demoPoliticians: DemoPolitician[] = [
  p({
    id: "00000000-0000-4000-8000-000000000101",
    slug: "aoyama-mirai",
    name: "青山 未来",
    name_kana: "あおやま みらい",
    party_id: "ldp",
    prefecture: "東京都",
    district: "東京99区",
    hometown: "東京都",
    alma_mater: "架空大学 法学部",
    childhood_dream: "宇宙飛行士。今も星空を見るのが好きです。",
    special_ability: "一度会った人の名前は忘れません。",
    manifesto: "若者の住まい支援と、学び直しの無償化。",
    past_and_future: "IT企業で10年働いたのち政治の道へ。デジタルで行政の手続きをゼロにする国を目指します。",
    policy_actions: "若者向け家賃補助の拡充を議員立法として提出(架空)。",
    message_to_youth: "あなたの一言が、法律の一行になります。遠慮なく声を届けてください。",
  }),
  p({
    id: "00000000-0000-4000-8000-000000000102",
    slug: "kawase-hikari",
    name: "川瀬 ひかり",
    name_kana: "かわせ ひかり",
    party_id: "dpfp",
    prefecture: "大阪府",
    district: "大阪99区",
    hometown: "大阪府",
    alma_mater: "架空大学 経済学部",
    childhood_dream: "パン屋さん",
    special_ability: "早口言葉が得意です。",
    manifesto: "手取りを増やす経済政策と、奨学金返済の負担軽減。",
    past_and_future: "地元の商店街で育ち、中小企業の支援に携わってきました。",
    policy_actions: "奨学金の返済猶予制度の拡充を委員会で提案(架空)。",
    message_to_youth: "将来にお金の不安を持たなくていい社会を一緒につくりましょう。",
  }),
  p({
    id: "00000000-0000-4000-8000-000000000103",
    slug: "morita-daichi",
    name: "森田 大地",
    name_kana: "もりた だいち",
    party_id: "ishin",
    prefecture: "兵庫県",
    district: "兵庫99区",
    hometown: "兵庫県",
    alma_mater: "架空工業大学",
    childhood_dream: "電車の運転士",
    special_ability: "全国の駅名を暗記しています。",
    manifesto: "地方の公共交通の維持と、行政改革。",
    policy_actions: "地域鉄道の維持に関する超党派勉強会を主宰(架空)。",
    message_to_youth: "地方に住み続けられる選択肢を守ります。",
  }),
  p({
    id: "00000000-0000-4000-8000-000000000104",
    slug: "hoshino-sora",
    name: "星野 空",
    name_kana: "ほしの そら",
    party_id: "komeito",
    prefecture: "福岡県",
    district: "福岡99区",
    manifesto: "子育て世帯への切れ目ない支援。",
    message_to_youth: "子育てと仕事を両立できる社会へ。",
  }),
  p({
    id: "00000000-0000-4000-8000-000000000105",
    slug: "tachibana-nagi",
    name: "橘 なぎ",
    name_kana: "たちばな なぎ",
    party_id: "independent",
    prefecture: "北海道",
    district: "北海道99区",
    manifesto: "再生可能エネルギーで地域に仕事をつくる。",
    message_to_youth: "エネルギーと雇用の問題は、みなさんの世代の問題です。",
  }),
  p({
    id: "00000000-0000-4000-8000-000000000106",
    slug: "ichinose-kou",
    name: "一ノ瀬 航",
    name_kana: "いちのせ こう",
    party_id: "reiwa",
    prefecture: "愛知県",
    district: "愛知99区",
    manifesto: "学費の無償化と若者の最低賃金引き上げ。",
  }),
];

const author = (id: string, display_name: string, extra: Partial<Author> = {}): Author => ({
  user_id: id,
  role: "student",
  display_name,
  politician_id: null,
  politician_slug: null,
  photo_url: null,
  ...extra,
});

const politicianAuthor = (pol: DemoPolitician): Author =>
  author(`user-${pol.id}`, pol.name, {
    role: "politician",
    politician_id: pol.id,
    politician_slug: pol.slug,
    photo_url: pol.photo_url,
  });

const daysAgo = (d: number, h = 10) => {
  const t = new Date("2026-09-27T00:00:00+09:00");
  t.setDate(t.getDate() - d);
  t.setHours(h);
  return t.toISOString();
};

const post = (x: Omit<Post, "parent_id" | "root_id" | "target_politician_id" | "official_politician_id" | "is_hidden" | "reply_count"> & Partial<Post>): Post => ({
  parent_id: null,
  root_id: null,
  target_politician_id: null,
  official_politician_id: null,
  is_hidden: false,
  reply_count: 0,
  ...x,
});

const [aoyama, kawase, morita] = demoPoliticians;

const rawPosts: Post[] = [
  post({
    id: "00000000-0000-4000-8000-000000000201",
    body: "再生可能エネルギーの普及をもっと加速してほしいです。地元に風力発電の仕事ができれば、若い人も残れると思います。",
    created_at: daysAgo(1, 9),
    author: author("s1", "架空大学2年 / 20代 / 北海道99区"),
    tags: ["環境・エネルギー", "地方創生"],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000202",
    body: "地方の公共交通を維持するための支援をお願いします。バスが減って通学に片道2時間かかっています。",
    created_at: daysAgo(1, 12),
    author: author("s2", "会社員 / 30代 / 兵庫99区"),
    target_politician_id: morita.id,
    tags: ["地方創生"],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000203",
    parent_id: "00000000-0000-4000-8000-000000000202",
    root_id: "00000000-0000-4000-8000-000000000202",
    body: "ご意見ありがとうございます。地域鉄道とバスを一体で支える仕組みを勉強会で議論しています。通学の実態をもっと教えてください。",
    created_at: daysAgo(0, 8),
    author: politicianAuthor(morita),
    official_politician_id: morita.id,
    tags: [],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000204",
    body: "大学の学費負担を軽減し、若者が挑戦できる環境を整えてほしいです。",
    created_at: daysAgo(2, 18),
    author: author("s3", "高校3年 / 10代 / 愛知99区"),
    tags: ["教育・子育て", "若者参画"],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000205",
    body: "高齢の祖父母が安心して暮らせるよう、医療・福祉の充実をお願いします。介護する家族の負担も大きいです。",
    created_at: daysAgo(3, 20),
    author: author("s4", "ひだまり"),
    tags: ["医療・福祉"],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000206",
    body: "地方でも働ける魅力的な仕事を増やしてほしいです。リモートワークの補助があれば地元に戻りたい。",
    created_at: daysAgo(4, 11),
    author: author("s5", "フリーランス / 20代 / 福岡99区"),
    tags: ["雇用・労働", "地方創生"],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000207",
    body: "奨学金の返済が毎月重いです。返済額を所得に合わせて変えられる制度をもっと広げてほしい。",
    created_at: daysAgo(5, 21),
    author: author("s6", "社会人 / 20代 / 大阪99区"),
    target_politician_id: kawase.id,
    tags: ["経済・賃上げ", "教育・子育て"],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000208",
    parent_id: "00000000-0000-4000-8000-000000000207",
    root_id: "00000000-0000-4000-8000-000000000207",
    body: "所得連動型返還の対象拡大は、私も委員会で取り上げています。具体的な金額感を教えてもらえると議論に使えます。",
    created_at: daysAgo(4, 9),
    author: politicianAuthor(kawase),
    official_politician_id: kawase.id,
    tags: [],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000209",
    parent_id: "00000000-0000-4000-8000-000000000207",
    root_id: "00000000-0000-4000-8000-000000000207",
    body: "同じく月2万円の返済です。手取りが少ない最初の数年だけでも軽くなると助かります。",
    created_at: daysAgo(4, 13),
    author: author("s7", "架空大学4年 / 20代 / 大阪99区"),
    tags: [],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000210",
    body: "若者の住まい支援を。家賃が高くて一人暮らしを始められません。",
    created_at: daysAgo(6, 19),
    author: author("s8", "架空大学1年 / 10代 / 東京99区"),
    target_politician_id: aoyama.id,
    tags: ["少子化対策", "若者参画"],
  }),
  post({
    id: "00000000-0000-4000-8000-000000000211",
    body: "行政手続きのオンライン化をもっと進めてほしい。引っ越しのたびに役所に行くのは大変です。",
    created_at: daysAgo(7, 15),
    author: author("s9", "社会人 / 20代 / 東京99区"),
    tags: ["デジタル・AI"],
  }),
];

export const demoPosts: Post[] = rawPosts.map((x) => ({
  ...x,
  reply_count: rawPosts.filter((r) => r.root_id === x.id).length,
}));

export const demoDrafts: PolicyDraft[] = [
  {
    id: "00000000-0000-4000-8000-000000000301",
    slug: "youth-housing",
    title: "若者の住まい支援に関する政策ドラフト",
    summary: "家賃負担が重い10〜20代の一人暮らしを後押しするため、家賃補助と公的住宅の活用を提案します。",
    body: "## 背景\n目安箱には「家賃が高くて一人暮らしを始められない」という声が多く寄せられています。\n\n## 提案\n- 29歳以下の単身者への家賃補助\n- 空き公営住宅の若者向け開放\n- 敷金・礼金の立替制度\n\n## 期待される効果\n若者の自立と、地域への定着を促します。",
    image_url: SITE_IMAGES["draft-youth-housing"] ?? null,
    tag: "若者参画",
    published_at: daysAgo(36),
  },
  {
    id: "00000000-0000-4000-8000-000000000302",
    slug: "local-transport",
    title: "地方の交通インフラ強化に関する政策ドラフト",
    summary: "通学・通院に欠かせない地方のバス・鉄道を守るため、国と自治体の支援の仕組みを整えます。",
    body: "## 背景\n地方ではバスの減便が進み、通学に片道2時間かかる例もあります。\n\n## 提案\n- 地域交通の運行費への国の支援拡充\n- デマンド交通の導入支援\n- 学生定期の割引拡大",
    image_url: SITE_IMAGES["draft-local-transport"] ?? null,
    tag: "地方創生",
    published_at: daysAgo(38),
  },
  {
    id: "00000000-0000-4000-8000-000000000303",
    slug: "education-equality",
    title: "教育の機会均等に関する政策ドラフト",
    summary: "家庭の経済状況に関わらず学び続けられるよう、学費と奨学金制度を見直します。",
    body: "## 提案\n- 大学授業料の段階的な負担軽減\n- 所得連動型奨学金返還の対象拡大\n- 学び直し(リカレント教育)の無償化",
    image_url: SITE_IMAGES["draft-education-equality"] ?? null,
    tag: "教育・子育て",
    published_at: daysAgo(40),
  },
  {
    id: "00000000-0000-4000-8000-000000000304",
    slug: "renewable-energy",
    title: "再生可能エネルギーの普及に関する政策ドラフト",
    summary: "地域に仕事を生む再生可能エネルギーの導入を、若い世代の雇用とセットで進めます。",
    body: "## 提案\n- 地域主導の再エネ事業への出資支援\n- 再エネ関連の職業訓練の無償化\n- 送電網の整備前倒し",
    image_url: SITE_IMAGES["draft-renewable-energy"] ?? null,
    tag: "環境・エネルギー",
    published_at: daysAgo(43),
  },
];

export const demoDraftPostIds: Record<string, string[]> = {
  "youth-housing": ["00000000-0000-4000-8000-000000000210"],
  "local-transport": ["00000000-0000-4000-8000-000000000202"],
  "education-equality": ["00000000-0000-4000-8000-000000000204", "00000000-0000-4000-8000-000000000207"],
  "renewable-energy": ["00000000-0000-4000-8000-000000000201"],
};

export const demoNotices: Notice[] = [
  {
    id: "00000000-0000-4000-8000-000000000401",
    title: "「政策ドラフト」ベータ版を公開しました",
    body: "市民の声を政策につなぐプラットフォーム「政策ドラフト」のベータ版を公開しました。ご意見は目安箱からお寄せください。",
    published_at: daysAgo(10),
  },
  {
    id: "00000000-0000-4000-8000-000000000402",
    title: "政治家ユーザーの受付を開始しました",
    body: "政治家の方の公式アカウント登録の受付を開始しました。プロフィールの掲載は運営が代理で行います。",
    published_at: daysAgo(5),
  },
  {
    id: "00000000-0000-4000-8000-000000000403",
    title: "コミュニティガイドラインを公開しました",
    body: "誹謗中傷や公職選挙法に抵触するおそれのある投稿は、運営の判断で非表示にすることがあります。",
    published_at: daysAgo(3),
  },
];
