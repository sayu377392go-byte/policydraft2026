import { partyOf } from "@/lib/constants";

export function PartyBadge({ partyId }: { partyId: string }) {
  const party = partyOf(partyId);
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
      style={{ backgroundColor: party.color }}
    >
      {party.name}
    </span>
  );
}
