import type { Metadata } from "next";
import { PoliticianSignupForm } from "./politician-form";

export const metadata: Metadata = { title: "政治家アカウントの申請" };

export default function PoliticianSignupPage() {
  return (
    <div className="hero-sky px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold">政治家アカウントの申請</h1>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>このフォームからアカウントを作成</li>
          <li>運営が本人確認のうえ、プロフィールを代理で作成・紐付け</li>
          <li>プラン(月額 4,400円 / 年額 50,000円・税込)に加入すると公式回答が可能に</li>
        </ol>
        <div className="mt-6">
          <PoliticianSignupForm />
        </div>
      </div>
    </div>
  );
}
