import "server-only";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import { isDemoMode } from "@/lib/supabase/config";

export async function requireAdmin() {
  if (isDemoMode) notFound();
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") notFound();
  return user;
}
