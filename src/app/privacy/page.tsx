import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "プライバシーポリシー" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="プライバシーポリシー" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-[15px] leading-relaxed">
        <h2 className="text-lg font-bold">取得する情報と表示範囲</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>氏名・メールアドレス・市区町村: システム内部でのみ保持し、画面や API には出力しません。</li>
          <li>生年月日: 年代(例: 20代)の表示にのみ利用します。</li>
          <li>所属・学年・都道府県・選挙区・ニックネーム: 投稿時の表示名に利用します。</li>
        </ul>
        <h2 className="text-lg font-bold">利用目的</h2>
        <p>本人確認、サービス運営上の連絡、統計的な分析(個人を特定しない形)に利用します。</p>
        <p className="text-sm text-muted-foreground">※ 本文は仮の内容です。公開前に運営者情報・問い合わせ先などを追記し、法務確認のうえ差し替えてください。</p>
      </div>
    </>
  );
}
