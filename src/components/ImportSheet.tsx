// src/components/ImportSheet.tsx
"use client";

import Papa from "papaparse";
import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

type Row = Record<string, string>;

interface ImportSheetProps {
  children: React.ReactNode;
}

export default function ImportSheet({ children }: ImportSheetProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [result, setResult] = useState<{ inserted: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const onFile = (file: File) => {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (res.data.length > 200) {
          setErrors([{ row: 0, message: "Max 200 rows" }]);
          setRows([]);
          return;
        }
        setErrors([]);
        setResult(null);
        setRows(res.data);
      },
    });
  };

  const upload = async () => {
    if (rows.length === 0 || isUploading) return;
    setIsUploading(true);
    setProgress(0);

    // Simulate progress to 90%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const res = await fetch("/buyers/import/api", {
        method: "POST",
        body: JSON.stringify({ rows }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      setProgress(100);

      if (!data.ok) {
        setErrors(data.errors || [{ row: 0, message: "Import failed." }]);
      } else {
        setResult({ inserted: data.inserted });
        // Close after a short delay and refresh page
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
          resetState();
        }, 1200);
      }
    } catch {
      setErrors([{ row: 0, message: "Import failed. Please try again." }]);
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setRows([]);
    setErrors([]);
    setResult(null);
    setProgress(0);
    setIsUploading(false);
  };

  const closeSheet = () => {
    setIsOpen(false);
    resetState();
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetState();
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>

      {/* Constrain width and make content scrollable within viewport */}
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0"
      >
        {/* Header with sticky positioning and a Close button */}
        <div className="sticky top-0 z-10 border-b bg-white">
          <SheetHeader className="px-5 py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <SheetTitle>CSV Import</SheetTitle>
                <SheetDescription>
                  Import buyer data from a CSV file. Maximum 200 rows allowed.
                </SheetDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closeSheet}
                aria-label="Close import sheet"
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </SheetHeader>
        </div>

        {/* Scrollable content area */}
        <div className="px-5 py-4 overflow-y-auto max-h-[calc(100vh-60px)] space-y-4">
          {/* File input */}
          <div>
            <label htmlFor="csv-file" className="block text-sm font-medium mb-2">
              Select CSV File
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files && onFile(e.target.files[0])}
              className="
                block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/15 cursor-pointer
              "
              disabled={isUploading}
            />
          </div>

          {rows.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {rows.length} row{rows.length === 1 ? "" : "s"} loaded
            </div>
          )}

          {/* Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={upload}
              disabled={!rows.length || isUploading}
              className="flex-1 cursor-pointer"
            >
              {isUploading ? "Importing..." : "Validate & Import"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetState}
              disabled={isUploading}
              className="cursor-pointer"
            >
              Reset
            </Button>
          </div>

          {/* Success */}
          {result && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
              Successfully imported {result.inserted} record
              {result.inserted === 1 ? "" : "s"}!
            </div>
          )}

          {/* Errors table (scrollable section) */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-destructive">Validation Errors</h4>
              <div className="max-h-56 overflow-y-auto rounded border bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left">Row</th>
                      <th className="px-3 py-2 text-left">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((e, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{e.row}</td>
                        <td className="px-3 py-2 text-destructive">
                          {e.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom spacer */}
          <div className="h-2" />
        </div>
      </SheetContent>
    </Sheet>
  );
}