// src/lib/csv.ts
import { stringify } from "csv-stringify/sync";

export function toCSV(rows: any[], header = true) {
  return stringify(rows, {
    header,
    quoted: true,
    quoted_empty: true,
    quoted_string: true
  });
}