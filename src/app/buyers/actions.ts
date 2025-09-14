// src/app/buyers/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { buyerCreateSchema, buyerUpdateSchema } from "@/lib/schema";
import { rateLimit } from "@/lib/ratelimit";

// Map UI enums to Prisma enums
function toPrismaEnums(input: any) {
  const bhkMap: Record<string, any> = {
    "1": "ONE",
    "2": "TWO",
    "3": "THREE",
    "4": "FOUR",
    Studio: "STUDIO",
  };
  const timelineMap: Record<string, any> = {
    "0-3m": "ZERO_THREE_MONTHS",
    "3-6m": "THREE_SIX_MONTHS",
    ">6m": "GREATER_SIX_MONTHS",
    Exploring: "EXPLORING",
  };
  const sourceMap: Record<string, any> = {
    "Walk-in": "Walk_in",
    Website: "Website",
    Referral: "Referral",
    Call: "Call",
    Other: "Other",
  };
  return {
    ...input,
    bhk: input.bhk ? bhkMap[input.bhk] : null,
    timeline: timelineMap[input.timeline],
    source: sourceMap[input.source],
  };
}

function fromPrismaEnums(row: any) {
  const invBhk: Record<string, any> = {
    ONE: "1",
    TWO: "2",
    THREE: "3",
    FOUR: "4",
    STUDIO: "Studio",
  };
  const invTimeline: Record<string, any> = {
    ZERO_THREE_MONTHS: "0-3m",
    THREE_SIX_MONTHS: "3-6m",
    GREATER_SIX_MONTHS: ">6m",
    EXPLORING: "Exploring",
  };
  const invSource: Record<string, any> = {
    Walk_in: "Walk-in",
    Website: "Website",
    Referral: "Referral",
    Call: "Call",
    Other: "Other",
  };
  return {
    ...row,
    bhk: row.bhk ? invBhk[row.bhk] : null,
    timeline: invTimeline[row.timeline],
    source: invSource[row.source],
  };
}

function definedOnly<T extends Record<string, any>>(obj: T) {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

export async function createBuyer(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const rl = rateLimit(`create:${userId}`, 20, 60_000);
  if (!rl.ok) return { ok: false, message: "Rate limit exceeded. Try again soon." };

  const raw = Object.fromEntries(formData);
  const parsed = buyerCreateSchema.safeParse({
    ...raw,
    tags: raw.tags
      ? String(raw.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  // Ensure User row exists for Clerk user
  const cu = await currentUser();
  await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: cu?.emailAddresses?.[0]?.emailAddress,
      name: cu?.fullName ?? cu?.username ?? cu?.id,
    },
    create: {
      id: userId,
      email: cu?.emailAddresses?.[0]?.emailAddress,
      name: cu?.fullName ?? cu?.username ?? cu?.id,
    },
  });

  const data = toPrismaEnums(parsed.data);

  const created = await prisma.$transaction(async (tx) => {
    const buyer = await tx.buyer.create({
      data: {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
        ownerId: userId,
        status: data.status ?? "New",
      },
    });
    await tx.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: userId,
        diff: { created: buyer },
      },
    });
    return buyer;
  });

  return { ok: true, id: created.id };
}

export async function updateBuyer(id: string, formData: FormData) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const isAdmin = (sessionClaims?.metadata as any)?.role === "ADMIN";

  const current = await prisma.buyer.findUnique({ where: { id } });
  if (!current) return { ok: false, message: "Not found" };
  if (!isAdmin && current.ownerId !== userId) return { ok: false, message: "Forbidden" };

  const raw = Object.fromEntries(formData);
  const parsed = buyerUpdateSchema.safeParse({
    ...raw,
    tags: raw.tags
      ? String(raw.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  // Concurrency check using epoch ms
  const clientMs = Number(parsed.data.updatedAt);
  const serverMs = new Date(current.updatedAt).getTime();
  if (!Number.isFinite(clientMs) || clientMs !== serverMs) {
    return { ok: false, stale: true, message: "Record changed, please refresh." };
  }

  // Prepare update data, but DO NOT include updatedAt
  const { updatedAt: _omit, ...rest } = parsed.data as any;
  const mapped = toPrismaEnums(rest);
  const cleanData = definedOnly(mapped);

  const updated = await prisma.$transaction(async (tx) => {
    const buyer = await tx.buyer.update({
      where: { id },
      data: {
        ...cleanData,
        tags: Array.isArray(cleanData.tags) ? cleanData.tags : [],
        // Do not set updatedAt; Prisma will auto-update it (@updatedAt)
      },
    });

    // diff for history
    const diff: Record<string, { from: any; to: any }> = {};
    for (const k of Object.keys(cleanData)) {
      const fromVal = (current as any)[k];
      const toVal = (buyer as any)[k];
      if (JSON.stringify(fromVal) !== JSON.stringify(toVal)) {
        diff[k] = { from: fromVal, to: toVal };
      }
    }
    if (Object.keys(diff).length) {
      await tx.buyerHistory.create({
        data: { buyerId: id, changedBy: userId, diff },
      });
    }
    return buyer;
  });

  return { ok: true, id: updated.id };
}

export async function deleteBuyer(id: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const isAdmin = (sessionClaims?.metadata as any)?.role === "ADMIN";
  const buyer = await prisma.buyer.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!buyer) return { ok: false, message: "Not found" };
  if (!isAdmin && buyer.ownerId !== userId) return { ok: false, message: "Forbidden" };
  await prisma.buyer.delete({ where: { id } });
  return { ok: true };
}

export async function listBuyers(params: {
  page: number;
  pageSize: number;
  q?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  sort?: string;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const isAdmin = (sessionClaims?.metadata as any)?.role === "ADMIN";

  const { page, pageSize, q, city, propertyType, status, timeline, sort = "updatedAt:desc" } =
    params;

  const where: any = {};
  // Non-admin users can only see their own buyers
  if (!isAdmin) {
    where.ownerId = userId;
  }
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) {
    const map: any = {
      "0-3m": "ZERO_THREE_MONTHS",
      "3-6m": "THREE_SIX_MONTHS",
      ">6m": "GREATER_SIX_MONTHS",
      Exploring: "EXPLORING",
    };
    where.timeline = map[timeline] ?? timeline;
  }
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const [field, dir] = sort.split(":");
  const orderBy: any = { [field]: dir === "asc" ? "asc" : "desc" };

  const [total, items] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        propertyType: true,
        bhk: true,
        purpose: true,
        budgetMin: true,
        budgetMax: true,
        timeline: true,
        source: true,
        status: true,
        notes: true,
        tags: true,
        updatedAt: true,
      },
    }),
  ]);

  const mapped = items.map(fromPrismaEnums);
  return { total, items: mapped };
}

export async function getBuyer(id: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const isAdmin = (sessionClaims?.metadata as any)?.role === "ADMIN";

  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: {
      history: { orderBy: { changedAt: "desc" }, take: 5 },
    },
  });
  if (!buyer) return null;
  
  // Non-admin users can only view their own buyers
  if (!isAdmin && buyer.ownerId !== userId) {
    throw new Error("Forbidden");
  }
  
  return fromPrismaEnums(buyer);
}