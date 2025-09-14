// tests/csv-validate.test.ts
import { describe, it, expect } from "vitest";
import { csvRowSchema } from "../src/lib/schema";

describe("csv row schema", () => {
  it("accepts valid row", () => {
    const row = {
      fullName: "John Doe",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "2",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
      budgetMin: 5000000,
      budgetMax: 7000000,
      email: "john@example.com",
      notes: "",
      tags: "hot|nr",
      status: "New",
    };
    const res = csvRowSchema.safeParse(row);
    expect(res.success).toBe(true);
  });

  it("rejects invalid phone and budget", () => {
    const row = {
      fullName: "A",
      phone: "12x",
      city: "Chandigarh",
      propertyType: "Villa",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
      budgetMin: 100,
      budgetMax: 50,
    };
    const res = csvRowSchema.safeParse(row);
    expect(res.success).toBe(false);
  });
});