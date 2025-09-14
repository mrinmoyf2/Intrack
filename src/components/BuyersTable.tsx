// src/components/BuyersTable.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type BuyerRow = {
  id: string;
  fullName: string;
  email?: string | null;
  phone: string;
  city: string;
  propertyType: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  timeline: string;
  status: string;
  updatedAt: string | Date;
};

export default function BuyersTable({ items }: { items: BuyerRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="w-full caption-bottom text-sm">
        <thead className="sticky top-0 z-10 bg-muted/50">
          <tr className="text-left text-muted-foreground">
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>City</Th>
            <Th>Property</Th>
            <Th>Budget</Th>
            <Th>Timeline</Th>
            <Th>Status</Th>
            <Th>Updated</Th>
            <Th className="text-right pr-3">Action</Th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-3 py-10 text-center text-muted-foreground"
              >
                No buyers found.
              </td>
            </tr>
          ) : (
            items.map((b, i) => (
              <tr
                key={b.id}
                className="border-t hover:bg-muted/30 transition-colors"
              >
                <Td title={b.fullName} className="font-medium max-w-[200px] truncate">
                  {b.fullName}
                </Td>
                <Td className="whitespace-nowrap">{b.phone}</Td>
                <Td className="whitespace-nowrap">{b.city}</Td>
                <Td className="whitespace-nowrap">{b.propertyType}</Td>
                <Td className="whitespace-nowrap">
                  {formatBudget(b.budgetMin, b.budgetMax)}
                </Td>
                <Td className="whitespace-nowrap">{b.timeline}</Td>
                <Td className="whitespace-nowrap">
                  <StatusBadge status={b.status} />
                </Td>
                <Td className="whitespace-nowrap">
                  {formatDate(b.updatedAt)}
                </Td>
                <Td className="text-right pr-3">
                  <Button asChild variant="link" className="px-0">
                    <Link href={`/buyers/${b.id}`}>View / Edit</Link>
                  </Button>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <th className={`px-3 py-2 text-xs font-medium uppercase tracking-wide ${className ?? ""}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  title,
}: React.PropsWithChildren<{ className?: string; title?: string }>) {
  return (
    <td className={`px-3 py-2 align-middle ${className ?? ""}`} title={title}>
      {children}
    </td>
  );
}

function formatBudget(min?: number | null, max?: number | null) {
  const hasMin = typeof min === "number";
  const hasMax = typeof max === "number";

  if (!hasMin && !hasMax) return "—";
  if (hasMin && hasMax) return `${num(min)}–${num(max)}`;
  if (hasMin) return `${num(min as number)}`;
  return `${num(max as number)}`;
}

function num(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return String(n);
  }
}

function formatDate(d: string | Date) {
  const dt = new Date(d);
  return dt.toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
  const variant = statusVariant(status);
  return <Badge variant={variant}>{status}</Badge>;
}

function statusVariant(
  s: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "New":
      return "secondary";
    case "Qualified":
    case "Contacted":
    case "Visited":
      return "default";
    case "Negotiation":
      return "outline";
    case "Converted":
      return "default";
    case "Dropped":
      return "destructive";
    default:
      return "secondary";
  }
}