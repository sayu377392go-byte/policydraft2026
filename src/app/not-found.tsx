import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="hero-sky flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-5xl font-bold text-gradient">404</p>
      <p className="mt-4 text-slate-600">ページが見つかりませんでした</p>
      <Button asChild className="mt-6"><Link href="/">ホームへ戻る</Link></Button>
    </div>
  );
}
