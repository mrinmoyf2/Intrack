// // src/app/buyers/import/page.tsx
// "use client";
// import Papa from "papaparse";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// type Row = Record<string, string>;

// export default function ImportPage() {
//   const [rows, setRows] = useState<Row[]>([]);
//   const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
//   const [result, setResult] = useState<{ inserted: number } | null>(null);
//   const router = useRouter();

//   const onFile = (file: File) => {
//     Papa.parse<Row>(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (res) => {
//         if (res.data.length > 200) {
//           setErrors([{ row: 0, message: "Max 200 rows" }]);
//           return;
//         }
//         setErrors([]);
//         setResult(null);
//         setRows(res.data);
//       },
//     });
//   };

//   const upload = async () => {
//     const res = await fetch("/buyers/import/api", {
//       method: "POST",
//       body: JSON.stringify({ rows }),
//       headers: { "Content-Type": "application/json" },
//     });
//     const data = await res.json();
//     if (!data.ok) setErrors(data.errors);
//     else setResult({ inserted: data.inserted });
//     router.push("/buyers");
//   };

//   return (
//     <main className="space-y-4">
//       <h1 className="text-xl font-semibold">CSV Import</h1>
//       <input
//         type="file"
//         accept=".csv"
//         onChange={(e) => e.target.files && onFile(e.target.files[0])}
//       />
//       <button
//         onClick={upload}
//         disabled={!rows.length}
//         className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//       >
//         Validate & Import
//       </button>
//       {errors.length > 0 && (
//         <div className="overflow-x-auto rounded border bg-white">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-50"><tr><th className="px-3 py-2">Row</th><th className="px-3 py-2">Error</th></tr></thead>
//             <tbody>
//               {errors.map((e, i) => (
//                 <tr key={i} className="border-t">
//                   <td className="px-3 py-2">{e.row}</td>
//                   <td className="px-3 py-2">{e.message}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//     </main>
//   );
// }