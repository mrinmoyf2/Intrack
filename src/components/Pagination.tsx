// src/components/Pagination.tsx
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Pagination({
  total,
  pageSize,
  currentPage,
}: {
  total: number;
  pageSize: number;
  currentPage: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();

  const go = (p: number) => {
    const next = new URLSearchParams(sp.toString());
    next.set("page", String(p));
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => go(1)} disabled={currentPage <= 1}>
        « First
      </button>
      <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => go(currentPage - 1)} disabled={currentPage <= 1}>
        ‹ Prev
      </button>
      <span className="text-sm">Page {currentPage} of {pages}</span>
      <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => go(currentPage + 1)} disabled={currentPage >= pages}>
        Next ›
      </button>
      <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => go(pages)} disabled={currentPage >= pages}>
        Last »
      </button>
    </div>
  );
}