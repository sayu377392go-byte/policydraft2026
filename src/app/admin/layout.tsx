import Link from "next/link";
import { requireAdmin } from "./guard";

const LINKS = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/politicians", label: "政治家プロフィール" },
  { href: "/admin/billing", label: "課金・契約" },
  { href: "/admin/moderation", label: "モデレーション" },
  { href: "/admin/drafts", label: "政策ドラフト" },
  { href: "/admin/notices", label: "お知らせ" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
      <nav className="flex gap-2 overflow-x-auto md:flex-col" aria-label="管理メニュー">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="shrink-0 rounded-md px-3 py-2 text-sm hover:bg-muted">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
