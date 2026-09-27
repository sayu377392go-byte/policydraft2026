import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getCurrentUser, getPoliticians } from "@/lib/data";
import { isDemoMode } from "@/lib/supabase/config";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "声を投稿する" };

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  const user = await getCurrentUser();
  if (!isDemoMode && !user) redirect("/login?next=/meyasubako/new");

  const politicians = await getPoliticians();
  return (
    <>
      <PageHeader title="声を投稿する" />
      <div className="mx-auto max-w-2xl px-4 py-8">
        {user && user.role !== "student" ? (
          <p className="rounded-lg bg-muted p-4 text-sm">新規投稿は学生ユーザーのみ利用できます。</p>
        ) : (
          <PostForm politicians={politicians.map((p) => ({ id: p.id, name: p.name }))} defaultTarget={to} />
        )}
      </div>
    </>
  );
}
