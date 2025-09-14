// src/app/buyers/[id]/page.tsx
import BuyerForm from "@/components/BuyerForm";
import { notFound } from "next/navigation";
import { getBuyer } from "../actions";

export default async function BuyerDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params; // await params
  const buyer = await getBuyer(id);
  if (!buyer) return notFound();

  return (
    <div className="space-y-6 mx-auto max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold">View / Edit</h1>
        <p className="text-gray-600">
          Last updated: {new Date(buyer.updatedAt).toLocaleString()}
        </p>
      </div>
      <BuyerForm mode="edit" buyer={buyer} />
    </div>
  );
}
