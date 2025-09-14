// src/components/Filters.tsx
"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronsUpDown, X } from "lucide-react";

const CITY = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"] as const;
const PROPERTY = ["Apartment", "Villa", "Plot", "Office", "Retail"] as const;
const STATUS = [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
] as const;
const TIMELINE = ["0-3m", "3-6m", ">6m", "Exploring"] as const;

export default function Filters() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = React.useState(sp.get("q") ?? "");
  const [city, setCity] = React.useState(sp.get("city") ?? "");
  const [propertyType, setPropertyType] = React.useState(
    sp.get("propertyType") ?? ""
  );
  const [status, setStatus] = React.useState(sp.get("status") ?? "");
  const [timeline, setTimeline] = React.useState(sp.get("timeline") ?? "");

  // Debounced search sync
  React.useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (q) next.set("q", q);
      else next.delete("q");
      next.set("page", "1");
      router.push(`${pathname}?${next.toString()}`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const update = React.useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(sp.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.set("page", "1");
      router.push(`${pathname}?${next.toString()}`);
    },
    [pathname, router, sp]
  );

  return (
    <div className="rounded-lg border bg-white p-3 md:p-4">
      <div className="grid gap-3 md:grid-cols-5">
        {/* Search */}
        <div className="md:col-span-2">
          <p>Search</p>
          <Input
            className="w-full border-2 border-gray-300"
            placeholder="Search name, phone, email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* City */}
        <ComboboxFilter
          label="City"
          placeholder="Select city"
          options={CITY}
          value={city}
          onChange={(v) => {
            setCity(v ?? "");
            update("city", v);
          }}
        />

        {/* Property Type */}
        <ComboboxFilter
          label="Property"
          placeholder="Select property"
          options={PROPERTY}
          value={propertyType}
          onChange={(v) => {
            setPropertyType(v ?? "");
            update("propertyType", v);
          }}
        />

        {/* Status */}
        <ComboboxFilter
          label="Status"
          placeholder="Select status"
          options={STATUS}
          value={status}
          onChange={(v) => {
            setStatus(v ?? "");
            update("status", v);
          }}
        />

        {/* Timeline */}
        <ComboboxFilter
          label="Timeline"
          placeholder="Select timeline"
          options={TIMELINE}
          value={timeline}
          onChange={(v) => {
            setTimeline(v ?? "");
            update("timeline", v);
          }}
        />
      </div>

      {/* Optional divider for extra controls below */}
      {/* <Separator className="mt-3" /> */}
    </div>
  );
}

type ComboboxFilterProps<T extends string> = {
  label: string;
  placeholder: string;
  options: readonly T[];
  value: string; // current value from URL
  onChange: (value: T | null) => void;
};

function ComboboxFilter<T extends string>({
  label,
  placeholder,
  options,
  value,
  onChange,
}: ComboboxFilterProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selected = value && options.includes(value as T) ? (value as T) : "";

  return (
    <div className="grid gap-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center gap-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <span className={cn(!selected && "text-muted-foreground")}>
                {selected || placeholder}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const active = selected === opt;
                  return (
                    <CommandItem
                      key={opt}
                      value={opt}
                      onSelect={() => {
                        onChange(active ? null : opt);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          active ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {selected ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}