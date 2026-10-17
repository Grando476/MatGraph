"use client";

import Link from "next/link";

export default function TutorPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md w-full bg-white border-3 border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_#000]">
        <div className="w-16 h-16 mx-auto mb-4 bg-[var(--neo-yellow)] border-2 border-black rounded-xl flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#000]">
          🎓
        </div>
        <h1 className="text-xl font-black text-black uppercase tracking-tight mb-2">
          Panel Korepetytora
        </h1>
        <p className="text-xs text-gray-600 font-semibold mb-6">
          Ta sekcja jest w trakcie przygotowywania.
        </p>
        <Link
          href="/graph"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--neo-green)] text-black font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          &larr; Wróć do Grafu Wiedzy
        </Link>
      </div>
    </div>
  );
}
