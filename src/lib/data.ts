import "server-only";
import { cache } from "react";
import { demoDraftPostIds, demoDrafts, demoNotices, demoPoliticians, demoPosts } from "./demo-data";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import type { Author, CurrentUser, Notice, Politician, PolicyDraft, Post, Subscription, TrendingTag } from "./types";

// ---------------------------------------------------------------------
// 目安箱
// ---------------------------------------------------------------------

type PostRow = Omit<Post, "author" | "tags" | "reply_count"> & {
  author_id: string;
  post_tags?: { tags: { name: string } | null }[];
};

const POST_COLUMNS =
  "id, body, parent_id, root_id, target_politician_id, official_politician_id, is_hidden, created_at, author_id, post_tags(tags(name))";

async function hydratePosts(rows: PostRow[]): Promise<Post[]> {
  if (rows.length === 0) return [];
  const supabase = await createClient();
  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  const rootIds = rows.filter((r) => !r.parent_id).map((r) => r.id);

  const [{ data: authors }, { data: replies }] = await Promise.all([
    supabase.from("public_authors").select("*").in("user_id", authorIds),
    rootIds.length
      ? supabase.from("posts").select("root_id").in("root_id", rootIds).eq("is_hidden", false)
      : Promise.resolve({ data: [] as { root_id: string }[] }),
  ]);

  const authorMap = new Map((authors ?? []).map((a: Author) => [a.user_id, a]));
  const replyCount = new Map<string, number>();
  (replies ?? []).forEach((r: { root_id: string | null }) => {
    if (r.root_id) replyCount.set(r.root_id, (replyCount.get(r.root_id) ?? 0) + 1);
  });

  return rows.map(({ author_id, post_tags, ...r }) => ({
    ...r,
    author: authorMap.get(author_id) ?? {
      user_id: author_id,
      role: "student",
      display_name: "退会したユーザー",
      politician_id: null,
      politician_slug: null,
      photo_url: null,
    },
    tags: (post_tags ?? []).map((pt) => pt.tags?.name).filter((n): n is string => !!n),
    reply_count: replyCount.get(r.id) ?? 0,
  }));
}

export async function getTimeline(opts: { tag?: string; limit?: number } = {}): Promise<Post[]> {
  const limit = opts.limit ?? 50;
  if (isDemoMode) {
    return demoPosts
      .filter((p) => !p.parent_id && (!opts.tag || p.tags.includes(opts.tag)))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(POST_COLUMNS)
    .is("parent_id", null)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts.tag) {
    const { data: tag } = await supabase.from("tags").select("id").eq("name", opts.tag).maybeSingle();
    if (!tag) return [];
    const { data: links } = await supabase.from("post_tags").select("post_id").eq("tag_id", tag.id);
    const ids = (links ?? []).map((l) => l.post_id);
    if (ids.length === 0) return [];
    query = query.in("id", ids);
  }
  const { data } = await query;
  return hydratePosts((data ?? []) as unknown as PostRow[]);
}

/** スレッド(ルート投稿と、その配下のリプライ全件) */
export async function getThread(id: string): Promise<{ root: Post; replies: Post[] } | null> {
  if (isDemoMode) {
    const target = demoPosts.find((p) => p.id === id);
    if (!target) return null;
    const rootId = target.root_id ?? target.id;
    const root = demoPosts.find((p) => p.id === rootId)!;
    const replies = demoPosts
      .filter((p) => p.root_id === rootId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    return { root, replies };
  }
  const supabase = await createClient();
  const { data: target } = await supabase.from("posts").select("id, root_id").eq("id", id).maybeSingle();
  if (!target) return null;
  const rootId = target.root_id ?? target.id;
  const [{ data: root }, { data: replies }] = await Promise.all([
    supabase.from("posts").select(POST_COLUMNS).eq("id", rootId).maybeSingle(),
    supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("root_id", rootId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true }),
  ]);
  if (!root) return null;
  const [hydratedRoot, ...hydratedReplies] = await hydratePosts([root, ...(replies ?? [])] as unknown as PostRow[]);
  return { root: hydratedRoot, replies: hydratedReplies };
}

export async function getPostsForPolitician(politicianId: string) {
  if (isDemoMode) {
    const received = demoPosts.filter((p) => p.target_politician_id === politicianId && !p.parent_id);
    const answered = demoPosts.filter((p) => p.official_politician_id === politicianId);
    return { received, answered };
  }
  const supabase = await createClient();
  const [{ data: received }, { data: answered }] = await Promise.all([
    supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("target_politician_id", politicianId)
      .is("parent_id", null)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("official_politician_id", politicianId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  return {
    received: await hydratePosts((received ?? []) as unknown as PostRow[]),
    answered: await hydratePosts((answered ?? []) as unknown as PostRow[]),
  };
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  if (isDemoMode) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return hydratePosts((data ?? []) as unknown as PostRow[]);
}

export async function getTrendingTags(): Promise<TrendingTag[]> {
  if (isDemoMode) {
    const counts = new Map<string, number>();
    demoPosts.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()]
      .map(([name, post_count]) => ({ name, post_count }))
      .sort((a, b) => b.post_count - a.post_count)
      .slice(0, 10);
  }
  const supabase = await createClient();
  const { data } = await supabase.from("trending_tags").select("name, post_count");
  return data ?? [];
}

// ---------------------------------------------------------------------
// 政治家
// ---------------------------------------------------------------------

export async function getPoliticians(): Promise<Politician[]> {
  if (isDemoMode) return demoPoliticians;
  const supabase = await createClient();
  const { data } = await supabase.from("politicians").select("*").order("name_kana");
  return data ?? [];
}

export async function getPolitician(slug: string): Promise<Politician | null> {
  if (isDemoMode) return demoPoliticians.find((p) => p.slug === slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("politicians").select("*").eq("slug", slug).maybeSingle();
  return data;
}

// ---------------------------------------------------------------------
// 政策ドラフト・お知らせ
// ---------------------------------------------------------------------

export async function getDrafts(limit = 50): Promise<PolicyDraft[]> {
  if (isDemoMode) return demoDrafts.slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("policy_drafts")
    .select("id, slug, title, summary, body, image_url, published_at, tags(name)")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(toDraft);
}

export async function getDraft(slug: string): Promise<{ draft: PolicyDraft; posts: Post[] } | null> {
  if (isDemoMode) {
    const draft = demoDrafts.find((d) => d.slug === slug);
    if (!draft) return null;
    const ids = demoDraftPostIds[slug] ?? [];
    return { draft, posts: demoPosts.filter((p) => ids.includes(p.id)) };
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("policy_drafts")
    .select("id, slug, title, summary, body, image_url, published_at, tags(name)")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  const { data: links } = await supabase.from("policy_draft_posts").select("post_id").eq("draft_id", data.id);
  const ids = (links ?? []).map((l) => l.post_id);
  const { data: posts } = ids.length
    ? await supabase.from("posts").select(POST_COLUMNS).in("id", ids).eq("is_hidden", false)
    : { data: [] };
  return { draft: toDraft(data), posts: await hydratePosts((posts ?? []) as unknown as PostRow[]) };
}

type DraftRow = Omit<PolicyDraft, "tag"> & { tags: { name: string } | { name: string }[] | null };
function toDraft({ tags, ...row }: DraftRow): PolicyDraft {
  const tag = Array.isArray(tags) ? tags[0] : tags;
  return { ...row, tag: tag?.name ?? null };
}

export async function getNotices(limit = 50): Promise<Notice[]> {
  if (isDemoMode) {
    return [...demoNotices].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "")).slice(0, limit);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("notices")
    .select("id, title, body, published_at")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getNotice(id: string): Promise<Notice | null> {
  if (isDemoMode) return demoNotices.find((n) => n.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("notices").select("id, title, body, published_at").eq("id", id).maybeSingle();
  return data;
}

// ---------------------------------------------------------------------
// ログインユーザー
// ---------------------------------------------------------------------

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (isDemoMode) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: author }, { data: politician }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("public_authors").select("display_name").eq("user_id", user.id).maybeSingle(),
    supabase.from("politicians").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  let subscription: Subscription | null = null;
  if (politician) {
    const { data } = await supabase.from("subscriptions").select("*").eq("politician_id", politician.id).maybeSingle();
    subscription = data;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile?.role ?? "student",
    displayName: author?.display_name ?? user.email ?? "ユーザー",
    politician: politician ?? null,
    subscription,
  };
});

export function isSubscriptionActive(sub: Subscription | null) {
  if (!sub || sub.status !== "active") return false;
  return !sub.period_end || new Date(sub.period_end) > new Date();
}
