// src/components/ui/form-error.tsx
import * as React from "react";

export function FormError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p className="text-xs text-red-600 mt-1" role="alert">
      {messages.join(", ")}
    </p>
  );
}