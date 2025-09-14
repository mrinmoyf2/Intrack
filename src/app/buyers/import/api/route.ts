// src/app/buyers/import/api/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { csvRowSchema } from "@/lib/schema";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, errors: [{ row: 0, message: "Unauthorized" }] }, { status: 401 });

  const { rows } = await req.json();
  const errors: { row: number; message: string }[] = [];
  const valid: any[] = [];

  rows.forEach((row: any, idx: number) => {
    const parsed = csvRowSchema.safeParse(row);
    if (!parsed.success) {
      const msgs = Object.values(parsed.error.flatten().fieldErrors).flat();
      errors.push({ row: idx + 2, message: msgs.join("; ") }); // +2: header + 1-indexed
    } else {
      valid.push(parsed.data);
    }
  });

  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const cu = await currentUser();
  await prisma.user.upsert({
    where: { id: userId },
    update: { email: cu?.emailAddresses?.[0]?.emailAddress, name: cu?.fullName ?? cu?.username ?? cu?.id },
    create: { id: userId, email: cu?.emailAddresses?.[0]?.emailAddress, name: cu?.fullName ?? cu?.username ?? cu?.id },
  });

  const mapTimeline: any = { "0-3m": "ZERO_THREE_MONTHS", "3-6m": "THREE_SIX_MONTHS", ">6m": "GREATER_SIX_MONTHS", Exploring: "EXPLORING" };
  const mapSource: any = { "Walk-in": "Walk_in", Website: "Website", Referral: "Referral", Call: "Call", Other: "Other" };
  const mapBhk: any = { "1": "ONE", "2": "TWO", "3": "THREE", "4": "FOUR", Studio: "STUDIO" };

  const toInsert = valid.map((v) => ({
    ...v,
    bhk: v.bhk ? mapBhk[v.bhk] : undefined,
    timeline: mapTimeline[v.timeline],
    source: mapSource[v.source],
    ownerId: userId,
    status: v.status ?? "New",
    tags: Array.isArray(v.tags) ? v.tags : [],
  }));

  // Insert transactionally
  const inserted = await prisma.$transaction(async (tx: any) => {
    const created = await tx.buyer.createMany({ data: toInsert });
    return created.count;
  });

  return NextResponse.json({ ok: true, inserted });
}