import { createElement } from "react";
import {
  Baby,
  Building2,
  Bus,
  Cpu,
  GraduationCap,
  Hash,
  HeartPulse,
  Megaphone,
  Shield,
  Sprout,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  少子化対策: Baby,
  "教育・子育て": GraduationCap,
  "防衛・安全保障": Shield,
  "経済・賃上げ": TrendingUp,
  "雇用・労働": Building2,
  "環境・エネルギー": Sprout,
  "デジタル・AI": Cpu,
  若者参画: Megaphone,
  "医療・福祉": HeartPulse,
  地方創生: Bus,
};

export function TagIcon({ tag, className }: { tag: string | null | undefined; className?: string }) {
  return createElement((tag && ICONS[tag]) || Hash, { className, "aria-hidden": true });
}
