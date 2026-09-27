import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode, supabaseAnonKey, supabaseUrl } from "./config";

/** リクエストごとに Supabase のセッション Cookie を更新する */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (isDemoMode) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() を呼ぶことでトークンが検証・更新される
  await supabase.auth.getUser();
  return response;
}
