import type { Metadata, Viewport } from "next";
import { Caveat, Noto_Sans_JP, Zen_Old_Mincho } from "next/font/google";
import { BottomNav } from "@/components/layout/nav-links";
import { DemoBanner } from "@/components/layout/demo-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE_CONCEPT, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import "./globals.css";

const notoSans = Noto_Sans_JP({ variable: "--font-noto-sans-jp", subsets: ["latin"], weight: ["400", "500", "700"] });
const zenMincho = Zen_Old_Mincho({ variable: "--font-zen-old-mincho", subsets: ["latin"], weight: ["500", "700"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${SITE_NAME} ―${SITE_TAGLINE}―`, template: `%s | ${SITE_NAME}` },
  description: `${SITE_CONCEPT}若者・学生の社会課題意識や政策提言を可視化し、政治家へダイレクトに届けるプラットフォーム。`,
};

export const viewport: Viewport = {
  themeColor: "#1a8fb0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${notoSans.variable} ${zenMincho.variable} ${caveat.variable} flex min-h-dvh flex-col`}>
        <DemoBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
