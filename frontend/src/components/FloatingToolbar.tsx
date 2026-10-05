"use client";

import { Calculator } from "lucide-react";
import { useScratchpadStore } from "@/store/useScratchpadStore";

export default function FloatingToolbar() {
  const { isOpen, toggle } = useScratchpadStore();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={toggle}
        type="button"
        aria-label={isOpen ? "Zamknij brudnopis" : "Otwórz brudnopis"}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2.5 px-4 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-xl active:scale-95 cursor-pointer ${isOpen
          ? "bg-[var(--accent-main)] text-[var(--bg-dark)] shadow-[0_0_25px_rgba(56,189,248,0.5)] ring-2 ring-[var(--accent-hover)] font-bold scale-105"
          : "bg-[var(--bg-card)]/90 hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border border-[var(--border-dark)] hover:border-[var(--accent-main)] hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] backdrop-blur-md"
          }`}
      >
        <span
          className={`p-1 rounded-full transition-transform duration-300 ${isOpen ? "rotate-12 bg-white/20" : "group-hover:rotate-6 text-[var(--accent-main)]"
            }`}
        >
          <Calculator className="w-5 h-5" />
        </span>
        <span className="tracking-wide">Kalkulator Graficzny</span>

      </button>
    </div>
  );
}
