import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="lg-a" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#7fd3b6" />
          <stop offset="1" stopColor="#36b49a" />
        </linearGradient>
        <linearGradient id="lg-b" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3aa9d6" />
          <stop offset="1" stopColor="#1f7fae" />
        </linearGradient>
      </defs>
      <path d="M6 16c0-4 3-7 7-7h12c4 0 7 3 7 7v10c0 4-3 7-7 7h-9l-7 6v-6.4C7.6 32 6 29.5 6 26z" fill="url(#lg-a)" />
      <path d="M20 12c0-4 3-7 7-7h10c4 0 7 3 7 7v11c0 4-3 7-7 7h-2v7l-7-7h-1c-4 0-7-3-7-7z" fill="url(#lg-b)" opacity="0.92" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE_NAME} ホーム`}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-bold tracking-wider text-slate-800 sm:text-2xl">{SITE_NAME}</span>
        <span className="mt-1 hidden text-[10px] tracking-widest text-muted-foreground sm:block">―{SITE_TAGLINE}―</span>
      </span>
    </Link>
  );
}
