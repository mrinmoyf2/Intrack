// src/app/buyers/export/route.ts
import { listBuyers } from "../actions";
import { NextResponse } from "next/server";
import { toCSV } from "@/lib/csv";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const page = 1;
  const pageSize = 10000;
  const res = await listBuyers({
    page,
    pageSize,
    q: sp.get("q") ?? undefined,
    city: sp.get("city") ?? undefined,
    propertyType: sp.get("propertyType") ?? undefined,
    status: sp.get("status") ?? undefined,
    timeline: sp.get("timeline") ?? undefined,
    sort: sp.get("sort") ?? "updatedAt:desc",
  });

  const rows = res.items.map((b : any) => ({
    fullName: b.fullName,
    email: b.email ?? "",
    phone: b.phone,
    city: b.city,
    propertyType: b.propertyType,
    bhk: b.bhk ?? "",
    purpose: b.purpose ?? "",
    budgetMin: b.budgetMin ?? "",
    budgetMax: b.budgetMax ?? "",
    timeline: b.timeline,
    source: b.source,
    notes: b.notes ?? "",
    tags: Array.isArray(b.tags) ? b.tags.join(",") : "",
    status: b.status,
  }));

  const csv = toCSV(rows, true);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=buyers.csv",
    },
  });
}