export type Role = "student" | "politician" | "admin";
export type SubscriptionStatus = "pending" | "active" | "unpaid" | "inactive";

export type Author = {
  user_id: string;
  role: Role;
  display_name: string;
  politician_id: string | null;
  politician_slug: string | null;
  photo_url: string | null;
};

export type Post = {
  id: string;
  body: string;
  parent_id: string | null;
  root_id: string | null;
  target_politician_id: string | null;
  official_politician_id: string | null;
  is_hidden: boolean;
  created_at: string;
  author: Author;
  tags: string[];
  reply_count: number;
};

export type Politician = {
  id: string;
  slug: string;
  user_id: string | null;
  name: string;
  name_kana: string;
  party_id: string;
  prefecture: string;
  district: string;
  photo_url: string | null;
  hometown: string | null;
  alma_mater: string | null;
  childhood_dream: string | null;
  special_ability: string | null;
  manifesto: string | null;
  past_and_future: string | null;
  policy_actions: string | null;
  message_to_youth: string | null;
};

export type PolicyDraft = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  image_url: string | null;
  tag: string | null;
  published_at: string | null;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  published_at: string | null;
};

export type TrendingTag = { name: string; post_count: number };

export type Subscription = {
  politician_id: string;
  plan_type: "monthly" | "yearly" | null;
  payment_method: "stripe" | "bank_transfer" | null;
  status: SubscriptionStatus;
  period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  bank_transfer_code: string | null;
  bank_transfer_requested_at: string | null;
};

export type CurrentUser = {
  id: string;
  email: string | null;
  role: Role;
  displayName: string;
  politician: Politician | null;
  subscription: Subscription | null;
};
