// src/components/BuyerForm.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { buyerCreateSchema } from "@/lib/schema";
import { createBuyer, updateBuyer } from "@/app/buyers/actions";

// shadcn/ui components
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";

type Buyer = any;
type Props = { mode: "create" } | { mode: "edit"; buyer: Buyer };

const CITY = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"] as const;
const PROPERTY = ["Apartment", "Villa", "Plot", "Office", "Retail"] as const;
const BHK = ["1", "2", "3", "4", "Studio"] as const;
const PURPOSE = ["Buy", "Rent"] as const;
const TIMELINE = ["0-3m", "3-6m", ">6m", "Exploring"] as const;
const SOURCE = ["Website", "Referral", "Walk-in", "Call", "Other"] as const;

export default function BuyerForm(props: Props) {
  const router = useRouter();
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Local UI state for selects so the shadcn Select displays correctly
  const [city, setCity] = React.useState<string>(
    "buyer" in props ? props.buyer.city : "Chandigarh"
  );
  const [propertyType, setPropertyType] = React.useState<string>(
    "buyer" in props ? props.buyer.propertyType : "Apartment"
  );
  const [bhk, setBhk] = React.useState<string>(
    "buyer" in props && props.buyer.bhk ? props.buyer.bhk : ""
  );
  const [purpose, setPurpose] = React.useState<string>(
    "buyer" in props ? props.buyer.purpose : "Buy"
  );
  const [timeline, setTimeline] = React.useState<string>(
    "buyer" in props ? props.buyer.timeline : "0-3m"
  );
  const [source, setSource] = React.useState<string>(
    "buyer" in props ? props.buyer.source : "Website"
  );

  const needsBhk = propertyType === "Apartment" || propertyType === "Villa";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // FormData -> object
    const raw = Object.fromEntries(fd.entries());

    // Normalize empty strings for fields that can be absent
    // Important: bhk must be undefined if empty so Zod can enforce via superRefine
    const normalized = {
      ...raw,
      bhk:
        typeof raw.bhk === "string" && raw.bhk.trim() === ""
          ? undefined
          : raw.bhk,
      email:
        typeof raw.email === "string" && raw.email.trim() === ""
          ? undefined
          : raw.email,
      budgetMin:
        typeof raw.budgetMin === "string" && raw.budgetMin.trim() === ""
          ? undefined
          : raw.budgetMin,
      budgetMax:
        typeof raw.budgetMax === "string" && raw.budgetMax.trim() === ""
          ? undefined
          : raw.budgetMax,
      notes:
        typeof raw.notes === "string" && raw.notes.trim() === ""
          ? undefined
          : raw.notes,
    };

    // Normalize tags to array for Zod
    const tags =
      (raw.tags as string | undefined)
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) ?? [];

    // Client-side validate with shared Zod schema
    const parsed = buyerCreateSchema.safeParse({ ...normalized, tags });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors(flat);
      // Focus first error field
      const first = Object.keys(flat)[0];
      if (first) {
        const el = formRef.current?.querySelector(
          `[name="${first}"]`
        ) as HTMLElement | null;
        el?.focus();
      }
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (props.mode === "create") {
        res = await createBuyer(fd);
      } else {
        res = await updateBuyer((props as any).buyer.id, fd);
      }
      if (!res.ok) {
        if ((res as any).stale) {
          const msg =
            (res as any).message || "Record changed, please refresh the page.";
          alert(msg);
          router.refresh();
        } else {
          setErrors((res as any).errors ?? { form: ["Failed to save"] });
        }
      } else {
        router.push("/buyers");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-lg border bg-white p-6 shadow-sm grid gap-4"
      aria-live="polite"
    >
      {"buyer" in props ? (
        <input
          type="hidden"
          name="updatedAt"
          defaultValue={String(new Date(props.buyer.updatedAt).getTime())}
        />
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Full Name */}
        <div className="grid gap-1">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="fullName"
            name="fullName"
            required
            defaultValue={"buyer" in props ? props.buyer.fullName : ""}
            placeholder="e.g. John Doe"
          />
          <FormError messages={errors.fullName} />
        </div>

        {/* Email (optional per assignment, but if you want required, keep required) */}
        <div className="grid gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            defaultValue={"buyer" in props ? props.buyer.email ?? "" : ""}
            placeholder="e.g. john@example.com"
          />
          <FormError messages={errors.email} />
        </div>

        {/* Phone */}
        <div className="grid gap-1">
          <Label htmlFor="phone">
            Phone <span className="text-red-600">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10,15}"
            maxLength={15}
            required
            defaultValue={"buyer" in props ? props.buyer.phone : ""}
            placeholder="10–15 digits"
          />
          <FormError messages={errors.phone} />
        </div>

        {/* City */}
        <div className="grid gap-1">
          <Label htmlFor="city">
            City <span className="text-red-600">*</span>
          </Label>
          <Select
            value={city}
            onValueChange={(v) => {
              setCity(v);
              const hidden = formRef.current?.elements.namedItem(
                "city"
              ) as HTMLInputElement | null;
              if (hidden) hidden.value = v;
            }}
          >
            <SelectTrigger id="city">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITY.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="city" value={city} />
          <FormError messages={errors.city} />
        </div>

        {/* Property Type */}
        <div className="grid gap-1">
          <Label htmlFor="propertyType">
            Property Type <span className="text-red-600">*</span>
          </Label>
          <Select
            value={propertyType}
            onValueChange={(v) => {
              setPropertyType(v);
              // Reset bhk when switching to non-residential
              if (!(v === "Apartment" || v === "Villa")) {
                setBhk("");
                const bhkHidden = formRef.current?.elements.namedItem(
                  "bhk"
                ) as HTMLInputElement | null;
                if (bhkHidden) bhkHidden.value = "";
              }
              const hidden = formRef.current?.elements.namedItem(
                "propertyType"
              ) as HTMLInputElement | null;
              if (hidden) hidden.value = v;
            }}
          >
            <SelectTrigger id="propertyType">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="propertyType" value={propertyType} />
          <FormError messages={errors.propertyType} />
        </div>

        {/* BHK (conditional) */}
{needsBhk && (
  <div className="grid gap-1">
    <Label htmlFor="bhk">
      BHK <span className="text-red-600">*</span>
    </Label>
    <Select
      value={bhk}
      onValueChange={(v) => {
        setBhk(v);
        const hidden = formRef.current?.elements.namedItem(
          "bhk"
        ) as HTMLInputElement | null;
        if (hidden) hidden.value = v;
      }}
    >
      <SelectTrigger id="bhk">
        <SelectValue placeholder="Select BHK" />
      </SelectTrigger>
      <SelectContent>
        {BHK.map((b) => (
          <SelectItem key={b} value={b}>
            {b}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {/* Hidden input reflects current BHK selection (can be "") */}
    <input type="hidden" name="bhk" value={bhk} />
    <FormError messages={errors.bhk} />
  </div>
)}

        {/* Purpose */}
        <div className="grid gap-1">
          <Label htmlFor="purpose">
            Purpose <span className="text-red-600">*</span>
          </Label>
          <Select
            value={purpose}
            onValueChange={(v) => {
              setPurpose(v);
              const hidden = formRef.current?.elements.namedItem(
                "purpose"
              ) as HTMLInputElement | null;
              if (hidden) hidden.value = v;
            }}
          >
            <SelectTrigger id="purpose">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              {PURPOSE.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="purpose" value={purpose} />
          <FormError messages={errors.purpose} />
        </div>

        {/* Budget Min */}
        <div className="grid gap-1">
          <Label htmlFor="budgetMin">Budget Min</Label>
          <Input
            id="budgetMin"
            type="number"
            min={0}
            name="budgetMin"
            defaultValue={"buyer" in props ? props.buyer.budgetMin ?? "" : ""}
            placeholder="e.g. 5000000"
          />
          <FormError messages={errors.budgetMin} />
        </div>

        {/* Budget Max */}
        <div className="grid gap-1">
          <Label htmlFor="budgetMax">Budget Max</Label>
          <Input
            id="budgetMax"
            type="number"
            min={0}
            name="budgetMax"
            defaultValue={"buyer" in props ? props.buyer.budgetMax ?? "" : ""}
            placeholder="e.g. 8000000"
          />
            <FormError messages={errors.budgetMax} />
        </div>

        {/* Timeline */}
        <div className="grid gap-1">
          <Label htmlFor="timeline">
            Timeline <span className="text-red-600">*</span>
          </Label>
          <Select
            value={timeline}
            onValueChange={(v) => {
              setTimeline(v);
              const hidden = formRef.current?.elements.namedItem(
                "timeline"
              ) as HTMLInputElement | null;
              if (hidden) hidden.value = v;
            }}
          >
            <SelectTrigger id="timeline">
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              {TIMELINE.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="timeline" value={timeline} />
          <FormError messages={errors.timeline} />
        </div>

        {/* Source */}
        <div className="grid gap-1">
          <Label htmlFor="source">
            Source <span className="text-red-600">*</span>
          </Label>
          <Select
            value={source}
            onValueChange={(v) => {
              setSource(v);
              const hidden = formRef.current?.elements.namedItem(
                "source"
              ) as HTMLInputElement | null;
              if (hidden) hidden.value = v;
            }}
          >
            <SelectTrigger id="source">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="source" value={source} />
          <FormError messages={errors.source} />
        </div>

        {/* Tags */}
        <div className="grid gap-1 md:col-span-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={
              "buyer" in props ? (props.buyer.tags ?? []).join(",") : ""
            }
            placeholder="comma separated: hot, followup"
          />
          <FormError messages={errors.tags} />
        </div>

        {/* Notes */}
        <div className="grid gap-1 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            maxLength={1000}
            defaultValue={"buyer" in props ? props.buyer.notes ?? "" : ""}
            placeholder="Any context or special requirements..."
            className="min-h-[100px]"
          />
          <FormError messages={errors.notes} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {props.mode === "create" ? "Create Lead" : "Save Changes"}
        </Button>
        {"buyer" in props && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/buyers")}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}