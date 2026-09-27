"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-9 md:flex" aria-label="メインメニュー">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "relative py-2 text-sm font-medium tracking-wide text-slate-700 transition-colors hover:text-primary",
            isActive(pathname, item.href) &&
              "text-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** スマホ用のボトムナビ(片手操作を優先: 要件定義書 5-3) */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="メインメニュー"
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex h-14 items-center justify-center text-[11px] font-medium text-slate-600",
            isActive(pathname, item.href) && "text-primary",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
