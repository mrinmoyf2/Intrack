// src/lib/ownership.ts
import { prisma } from "./db";

export async function canEditBuyer(userId: string, buyerId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  const buyer = await prisma.buyer.findUnique({ where: { id: buyerId }, select: { ownerId: true } });
  return buyer?.ownerId === userId;
}