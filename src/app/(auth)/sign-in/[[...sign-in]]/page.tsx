// src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
"use client";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl="/buyers"
      />
    </main>
  );
}