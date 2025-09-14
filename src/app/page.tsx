// src/app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignedOut } from "@clerk/nextjs";
import HomePage from "@/components/Landing";

export default async function Home() {
  const { userId } = await auth();
  
  // If user is signed in, redirect to buyers page
  if (userId) {
    redirect("/buyers");
  }

  return (
    <div className="space-y-4">
      <SignedOut>
        <HomePage />
      </SignedOut>
    </div>
  );
}