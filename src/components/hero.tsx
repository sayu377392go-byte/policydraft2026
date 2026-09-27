import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TagIcon } from "@/components/tag-icon";
import { SITE_IMAGES } from "@/lib/site-images";
import { cn } from "@/lib/utils";

/** ヒーロー背景。OpenAI で生成した画像(npm run images:generate)があればそれを使い、なければ仮のイラスト */
const HERO_BACKGROUND = SITE_IMAGES.hero ?? "/hero-city.svg";

type Voice = { category: string; iconTag: string; body: string; who: string; tag: string };

/** トップイメージのヒーローに浮かぶ「市民の声」カード(イメージ用の例文) */
const VOICES: (Voice & { pos: string; tilt: string; delay: string })[] = [
  { category: "環境・エネルギー", iconTag: "環境・エネルギー", body: "再生可能エネルギーの普及をもっと加速してほしいです。", who: "20代・学生", tag: "環境", pos: "left-[3%] top-[8%]", tilt: "4deg", delay: "0s" },
  { category: "交通・インフラ", iconTag: "地方創生", body: "地方の公共交通を維持するための支援をお願いします。", who: "30代・会社員", tag: "交通", pos: "left-[1%] top-[48%]", tilt: "3deg", delay: "1.2s" },
  { category: "教育・子育て", iconTag: "教育・子育て", body: "大学の学費負担を軽減し、若者が挑戦できる環境を整えてほしいです。", who: "10代・高校生", tag: "教育", pos: "left-[29%] top-[64%]", tilt: "2deg", delay: "2.1s" },
  { category: "医療・福祉", iconTag: "医療・福祉", body: "高齢者が安心して暮らせる医療・福祉の充実をお願いします。", who: "40代・主婦", tag: "福祉", pos: "right-[4%] top-[10%]", tilt: "-5deg", delay: "0.6s" },
  { category: "経済・雇用", iconTag: "雇用・労働", body: "地方でも働ける魅力的な仕事を増やしてほしいです。", who: "20代・フリーランス", tag: "雇用", pos: "right-[1%] top-[42%]", tilt: "-4deg", delay: "1.6s" },
  { category: "社会・その他", iconTag: "環境・エネルギー", body: "地域の文化や伝統を守るための取り組みを支援してほしいです。", who: "50代・自営業", tag: "文化", pos: "right-[14%] top-[70%]", tilt: "4deg", delay: "2.6s" },
];

function VoiceCard({ v, className, style }: { v: Voice; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("glass w-64 rounded-2xl p-4 text-left", className)} style={style}>
      <div className="flex items-center gap-2 text-xs font-medium text-teal-700">
        <TagIcon tag={v.iconTag} className="size-6 text-teal-500" />
        {v.category}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{v.body}</p>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>{v.who}</span>
        <span className="rounded-full bg-teal-50 px-2 py-0.5 font-medium text-teal-700">#{v.tag}</span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero-sky relative overflow-hidden">
      {/* 背景: ぼかした街並み(仮のイラスト)。写真に差し替える場合は HERO_BACKGROUND を変更する */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_BACKGROUND}
          alt=""
          className="absolute inset-x-0 bottom-0 h-[85%] w-full scale-105 object-cover object-bottom opacity-70 blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/20 to-white/40" />
        <div className="absolute left-1/2 top-[55%] h-72 w-72 -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 640" preserveAspectRatio="none" fill="none">
          <path d="M600 420 C 450 360, 380 250, 250 220" stroke="url(#flow)" strokeWidth="2" />
          <path d="M600 420 C 470 430, 380 420, 290 380" stroke="url(#flow)" strokeWidth="2" />
          <path d="M600 420 C 720 330, 820 260, 960 230" stroke="url(#flow)" strokeWidth="2" />
          <path d="M600 420 C 760 420, 860 400, 980 370" stroke="url(#flow)" strokeWidth="2" />
          <path d="M600 420 C 700 480, 820 520, 900 540" stroke="url(#flow)" strokeWidth="2" />
          <defs>
            <linearGradient id="flow" x1="0" x2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#9ad8f0" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* PC: 浮遊するカード */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        {VOICES.map((v) => (
          <div key={v.category} className={cn("absolute", v.pos)}>
            <VoiceCard
              v={v}
              className="animate-float"
              style={{ ["--tilt" as string]: v.tilt, animationDelay: v.delay } as React.CSSProperties}
            />
          </div>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-14 pt-14 text-center md:pb-24 md:pt-20 lg:min-h-[600px]">
        <h1 className="font-display text-[30px] font-bold leading-tight tracking-wider text-gradient min-[400px]:text-4xl sm:text-5xl md:text-6xl">
          あなたの声が、
          <br />
          日本の未来を動かす。
        </h1>
        <p className="mt-6 text-sm leading-7 tracking-wide text-slate-600 md:text-base">
          市民の声を政策に。若い世代と政治をつなぐ
          <br />
          新しいプラットフォームです。
        </p>
        <Link
          href="/meyasubako"
          className="bg-brand-gradient mt-8 inline-flex h-14 items-center gap-6 rounded-full px-10 text-base font-bold tracking-widest text-white shadow-lg shadow-sky-700/25 transition hover:brightness-105"
        >
          目安箱を見る
          <ArrowRight className="size-5" />
        </Link>

        {/* スマホ・タブレット: 横スクロールのカード */}
        <div className="-mx-4 mt-10 flex w-[calc(100%+2rem)] snap-x gap-3 overflow-x-auto px-4 pb-2 lg:hidden">
          {VOICES.map((v) => (
            <VoiceCard key={v.category} v={v} className="shrink-0 snap-center" />
          ))}
        </div>
      </div>
    </section>
  );
}
