import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/data";
import { NavLinks } from "./nav-links";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-20">
        <Logo />
        <NavLinks />
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/politicians"
            className="rounded-full p-2 text-slate-600 hover:bg-muted"
            aria-label="政治家を検索"
          >
            <Search className="size-5" />
          </Link>
          <span className="hidden h-6 w-px bg-border md:block" />
          {user ? (
            <Button asChild variant="outline" size="sm">
              <Link href={user.role === "admin" ? "/admin" : "/mypage"}>
                <UserRound />
                {user.role === "admin" ? "管理画面" : "マイページ"}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="px-6">
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
