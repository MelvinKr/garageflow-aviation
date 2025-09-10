"use client";
import Link from "next/link";
import { useMockState } from "@/store/mockState";

export default function PartLinks({ partId }: { partId: string }) {
  const { quotes, workorders } = useMockState();
  const qHits = quotes.filter((q) => q.items.some((i: any) => i.partId === partId));
  const woHits = workorders.filter((w) => w.tasks.some((t: any) => t.partId === partId));
  return (
    <div className="text-sm mt-4 space-y-1">
      <div className="text-gray-500">Liens</div>
      <div>
        Devis: {qHits.length === 0 ? "—" : qHits.map((q) => (
          <Link key={q.id} href="/quotes" className="underline mr-2">{q.id}</Link>
        ))}
      </div>
      <div>
        Work Orders: {woHits.length === 0 ? "—" : woHits.map((w) => (
          <Link key={w.id} href={`/workorders/${w.id}`} className="underline mr-2">{w.id}</Link>
        ))}
      </div>
    </div>
  );
}

