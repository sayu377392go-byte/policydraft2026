import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { NAV_ITEMS, SITE_CONCEPT, SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-white pb-20 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <span className="font-display text-lg font-bold">{SITE_NAME}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{SITE_CONCEPT}若い世代の声を、政治へダイレクトに届けるプラットフォーム。</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
          {NAV_ITEMS.map((i) => (
            <Link key={i.href} href={i.href} className="text-slate-600 hover:text-primary">
              {i.label}
            </Link>
          ))}
          <Link href="/for-politicians" className="text-slate-600 hover:text-primary">
            政治家の方へ
          </Link>
          <Link href="/guidelines" className="text-slate-600 hover:text-primary">
            ガイドライン
          </Link>
          <Link href="/privacy" className="text-slate-600 hover:text-primary">
            プライバシーポリシー
          </Link>
        </nav>
      </div>
      <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME}
      </p>
    </footer>
  );
}
