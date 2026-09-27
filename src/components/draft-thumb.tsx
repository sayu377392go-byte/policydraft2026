import Image from "next/image";
import { TagIcon } from "@/components/tag-icon";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-sky-200 via-sky-100 to-teal-100",
  "from-teal-200 via-emerald-100 to-sky-100",
  "from-indigo-100 via-sky-100 to-cyan-100",
  "from-emerald-200 via-teal-100 to-lime-100",
];

/** 政策ドラフトのサムネイル。画像未設定時は分野アイコン付きのグラデーション */
export function DraftThumb({
  imageUrl,
  tag,
  seed,
  className,
}: {
  imageUrl: string | null;
  tag: string | null;
  seed: string;
  className?: string;
}) {
  const g = GRADIENTS[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length];
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-gradient-to-br", g, className)}>
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill sizes="(max-width: 768px) 40vw, 200px" className="object-cover" />
      ) : (
        <TagIcon tag={tag} className="absolute left-1/2 top-1/2 size-1/3 -translate-x-1/2 -translate-y-1/2 text-sky-700/60" />
      )}
    </div>
  );
}
