// src/lib/schema.ts
import { z } from "zod"

/**
 * Enums as shown to users (UI-level). These map to Prisma enums in actions.ts
 * via toPrismaEnums/fromPrismaEnums.
 */
export const City = z.enum([
  "Chandigarh",
  "Mohali",
  "Zirakpur",
  "Panchkula",
  "Other",
])

export const PropertyType = z.enum([
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Retail",
])

// UI BHK values as strings "1" | "2" | "3" | "4" | "Studio"
export const BHK = z.enum(["1", "2", "3", "4", "Studio"])

export const Purpose = z.enum(["Buy", "Rent"])

export const Timeline = z.enum(["0-3m", "3-6m", ">6m", "Exploring"])

export const Source = z.enum(["Website", "Referral", "Walk-in", "Call", "Other"])

export const Status = z.enum([
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
])

/**
 * Base fields for buyer, used by both create and update.
 * Numbers can arrive as strings from FormData, so we coerce budget*.
 * Email is optional; empty string becomes undefined.
 */
export const buyerBaseSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be less than 80 characters"),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.trim() !== "" ? v : undefined))
    .pipe(z.string().email("Please enter a valid email address").optional()),
  // FIX: allow 10–15 digits
  phone: z
    .string()
    .regex(/^\d{10,15}$/, "Phone must be 10 to 15 digits"),
  city: City,
  propertyType: PropertyType,
  bhk: BHK.optional(),
  purpose: Purpose,
  budgetMin: z
    .union([z.number().int().nonnegative().optional(), z.string().optional()])
    .transform((v) =>
      typeof v === "string" ? (v ? parseInt(v, 10) : undefined) : v
    )
    .optional(),
  budgetMax: z
    .union([z.number().int().nonnegative().optional(), z.string().optional()])
    .transform((v) =>
      typeof v === "string" ? (v ? parseInt(v, 10) : undefined) : v
    )
    .optional(),
  timeline: Timeline,
  source: Source,
  notes: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.trim() !== "" ? v : undefined))
    .pipe(z.string().max(1000, "Notes must be less than 1000 characters").optional()),
  // Keep array shape; do not force at least one tag here to allow empty.
  // If you need at least one tag, uncomment .min(1, "At least one tag is required")
  tags: z.array(z.string()).optional(),
  status: Status.optional(), // default to "New" on create if not provided
})

/**
 * Create schema adds cross-field rules:
 * - BHK required for Apartment/Villa
 * - budgetMax >= budgetMin when both present
 */
export const buyerCreateSchema = buyerBaseSchema.superRefine((data, ctx) => {
  const needsBhk =
    data.propertyType === "Apartment" || data.propertyType === "Villa"
  if (needsBhk && !data.bhk) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["bhk"],
      message: "BHK is required for Apartment or Villa",
    })
  }
  if (
    data.budgetMin !== undefined &&
    data.budgetMax !== undefined &&
    data.budgetMax < data.budgetMin
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["budgetMax"],
      message: "budgetMax must be ≥ budgetMin",
    })
  }
})

/**
 * Update schema = create rules + concurrency field.
 * Important: object schemas with refinements must use safeExtend.
 * We accept updatedAt as epoch ms (string or number), and transform to number.
 */
export const buyerUpdateSchema = buyerCreateSchema.safeExtend({
  updatedAt: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v), { message: "Invalid timestamp" }),
})

/**
 * CSV row schema:
 * - Same validations as create
 * - status allowed in CSV
 * - tags can be a comma-separated string or an array: "hot, nr" -> ["hot","nr"]
 * - phone: 10–15 digits
 */
export const csvRowSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must be less than 80 characters"),
    email: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),
    // FIX: allow 10–15 digits
    phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10 to 15 digits"),
    city: City,
    propertyType: PropertyType,
    bhk: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v && v.trim() !== "" ? v : undefined))
      .pipe(BHK.optional()),
    purpose: Purpose,
    budgetMin: z
      .union([z.number().int().nonnegative().optional(), z.string().optional()])
      .transform((v) =>
        typeof v === "string" ? (v ? parseInt(v, 10) : undefined) : v
      ),
    budgetMax: z
      .union([z.number().int().nonnegative().optional(), z.string().optional()])
      .transform((v) =>
        typeof v === "string" ? (v ? parseInt(v, 10) : undefined) : v
      ),
    timeline: Timeline,
    source: Source,
    notes: z.string().optional().or(z.literal("")).transform((v) => v || ""),
    status: Status.optional(),
    // Accept "tags" either as a comma-separated string or array, normalize to array
    tags: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((v) =>
        Array.isArray(v)
          ? v
          : v
          ? v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : []
      ),
  })
  .superRefine((data, ctx) => {
    // Same cross-field rules as create
    const needsBhk =
      data.propertyType === "Apartment" || data.propertyType === "Villa"
    if (needsBhk && !data.bhk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bhk"],
        message: "BHK is required for Apartment or Villa",
      })
    }
    if (
      data.budgetMin != null &&
      data.budgetMax != null &&
      data.budgetMax < data.budgetMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["budgetMax"],
        message: "budgetMax must be ≥ budgetMin",
      })
    }
  })

export type BuyerCreateInput = z.infer<typeof buyerCreateSchema>
export type BuyerUpdateInput = z.infer<typeof buyerUpdateSchema>