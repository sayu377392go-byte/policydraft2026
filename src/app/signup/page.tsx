import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { StudentSignupForm } from "./student-form";

export const metadata: Metadata = { title: "無料登録" };

export default function SignupPage() {
  return (
    <div className="hero-sky px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold">無料登録(学生・若者)</h1>
        <p className="mt-3 flex gap-2 rounded-lg bg-muted p-3 text-xs leading-relaxed text-slate-600">
          <ShieldCheck className="size-4 shrink-0 text-teal-600" />
          氏名・メールアドレスはシステム内部でのみ保持し、画面や API に出力されることはありません。
        </p>
        <div className="mt-6">
          <StudentSignupForm />
        </div>
      </div>
    </div>
  );
}
