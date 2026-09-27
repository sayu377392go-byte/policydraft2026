import Image from "next/image";
import { cn } from "@/lib/utils";

/** 顔写真。未登録時は氏名の頭文字を表示 */
export function PoliticianAvatar({
  name,
  photoUrl,
  className,
  sizes = "96px",
}: {
  name: string;
  photoUrl: string | null;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-full bg-gradient-to-br from-sky-100 to-teal-100", className)}>
      {photoUrl ? (
        <Image src={photoUrl} alt={`${name}の顔写真`} fill sizes={sizes} className="object-cover" />
      ) : (
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fontSize="44" fontWeight="700" className="fill-sky-700 font-display">
            {name.slice(0, 1)}
          </text>
        </svg>
      )}
    </div>
  );
}
