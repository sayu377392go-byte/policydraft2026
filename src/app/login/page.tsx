import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "ログイン" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <div className="hero-sky min-h-[70vh] px-4 py-12">
      <div className="glass mx-auto max-w-md rounded-2xl p-8">
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-4 text-center text-xl font-bold">ログイン</h1>
        {error && <p className="mt-4 text-center text-sm text-red-600">認証に失敗しました。もう一度お試しください。</p>}
        <div className="mt-6">
          <LoginForm next={next ?? "/mypage"} />
        </div>
        <div className="mt-6 space-y-2 text-center text-sm">
          <p>
            はじめての方は
            <Link href="/signup" className="ml-1 font-bold text-primary hover:underline">
              無料登録(学生・若者)
            </Link>
          </p>
          <p>
            <Link href="/signup/politician" className="text-muted-foreground hover:text-primary hover:underline">
              政治家の方の登録はこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
