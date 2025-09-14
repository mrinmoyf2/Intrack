// src/app/buyers/page.tsx
import Link from "next/link";
import { listBuyers } from "./actions";
import Filters from "@/components/Filters";
import Pagination from "@/components/Pagination";
import ImportSheet from "@/components/ImportSheet";
import BuyersTable from "@/components/BuyersTable";

export const dynamic = "force-dynamic";

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const q = typeof params.q === "string" ? params.q : undefined;
  const city =
    typeof params.city === "string" ? params.city : undefined;
  const propertyType =
    typeof params.propertyType === "string"
      ? params.propertyType
      : undefined;
  const status =
    typeof params.status === "string" ? params.status : undefined;
  const timeline =
    typeof params.timeline === "string" ? params.timeline : undefined;
  const sort =
    typeof params.sort === "string"
      ? params.sort
      : "updatedAt:desc";

  const { items, total } = await listBuyers({
    page,
    pageSize: 10,
    q,
    city,
    propertyType,
    status,
    timeline,
    sort,
  });

  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v ?? "")])
    )
  );

  return (
    <div className="space-y-4 mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Buyer Leads</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/buyers/new"
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded"
          >
            + New
          </Link>
          <ImportSheet>
            <button className="px-3 py-2 text-sm border rounded hover:bg-gray-50 cursor-pointer">
              Import CSV
            </button>
          </ImportSheet>
          <a
            href={`/buyers/export?${qs.toString()}`}
            className="px-3 py-2 text-sm border rounded"
          >
            Export CSV
          </a>
        </div>
      </div>

      <Filters />

      {items.length === 0 ? (
        <div className="rounded border bg-white p-6 text-gray-600">
          No buyers found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <BuyersTable items={items as any} />
        </div>
      )}

      <Pagination total={total} pageSize={10} currentPage={page} />
    </div>
  );
}