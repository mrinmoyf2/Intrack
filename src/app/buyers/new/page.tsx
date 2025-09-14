// src/app/buyers/new/page.tsx
import BuyerForm from "@/components/BuyerForm";

export default function NewBuyerPage() {
  return (
    <div className="space-y-4 mx-auto max-w-6xl">
      <h1 className="text-xl font-semibold">Create Lead</h1>
      <BuyerForm mode="create" />
    </div>
  );
}