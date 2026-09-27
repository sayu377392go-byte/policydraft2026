"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PartyBadge } from "@/components/party-badge";
import { PoliticianAvatar } from "@/components/politician-avatar";
import { Input, Select } from "@/components/ui/input";
import { PARTIES, PREFECTURES } from "@/lib/constants";
import type { Politician } from "@/lib/types";

type Card = Pick<Politician, "id" | "slug" | "name" | "name_kana" | "party_id" | "prefecture" | "district" | "photo_url">;

/** 政治家一覧: 検索・フィルターバー + シンプルカード(要件 3.2 ①②) */
export function PoliticianBrowser({ politicians }: { politicians: Card[] }) {
  const [q, setQ] = useState("");
  const [party, setParty] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [district, setDistrict] = useState("");

  const districts = useMemo(
    () =>
      [...new Set(politicians.filter((p) => !prefecture || p.prefecture === prefecture).map((p) => p.district))].sort(),
    [politicians, prefecture],
  );

  const filtered = useMemo(() => {
    const keyword = q.trim().replace(/\s+/g, "");
    return politicians.filter(
      (p) =>
        (!keyword || p.name.replace(/\s+/g, "").includes(keyword) || p.name_kana.replace(/\s+/g, "").includes(keyword)) &&
        (!party || p.party_id === party) &&
        (!prefecture || p.prefecture === prefecture) &&
        (!district || p.district === district),
    );
  }, [politicians, q, party, prefecture, district]);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:top-20">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="政治家名・ふりがなで検索" className="pl-9" aria-label="フリーワード検索" />
          </label>
          <Select value={party} onChange={(e) => setParty(e.target.value)} aria-label="政党">
            <option value="">すべての政党</option>
            {PARTIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select
            value={prefecture}
            onChange={(e) => {
              setPrefecture(e.target.value);
              setDistrict("");
            }}
            aria-label="都道府県"
          >
            <option value="">すべての都道府県</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Select value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="選挙区">
            <option value="">すべての選挙区</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{filtered.length}名</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <li key={p.id}>
            <Link
              href={`/politicians/${p.slug}`}
              className="flex h-full flex-col items-center rounded-lg border border-border bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <PoliticianAvatar name={p.name} photoUrl={p.photo_url} className="size-24" />
              <p className="mt-3 font-bold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.name_kana}</p>
              <div className="mt-2">
                <PartyBadge partyId={p.party_id} />
              </div>
              <p className="mt-2 text-xs text-slate-600">{p.district}</p>
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          条件に合う政治家が見つかりません
        </p>
      )}
    </>
  );
}
