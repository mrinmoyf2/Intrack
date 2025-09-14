// src/app/layout.tsx
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-50 text-gray-900">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <nav>
                  <SignedOut>
                    <Link href="/">
                      <h1 className="text-xl font-bold text-foreground">
                        LeadIntake
                      </h1>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/buyers">
                      <h1 className="text-xl font-bold text-foreground">
                        LeadIntake
                      </h1>
                    </Link>
                  </SignedIn>
                </nav>
              </div>
              <nav className="flex items-center gap-4">
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <Link className="text-sm" href="/sign-in">
                    Sign in
                  </Link>
                </SignedOut>
              </nav>
            </div>
          </header>
          <main className="mx-auto px-6 py-6">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
