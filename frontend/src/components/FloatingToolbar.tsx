"use client";

import { Calculator } from "lucide-react";
import { useScratchpadStore } from "@/store/useScratchpadStore";

export default function FloatingToolbar() {
  const { isOpen, toggle } = useScratchpadStore();

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <button
        onClick={toggle}
        type="button"
        aria-label={isOpen ? "Zamknij kalkulator graficzny" : "Otwórz kalkulator graficzny"}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2.5 px-4 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer border-2.5 border-[var(--border-dark)] ${
          isOpen
            ? "bg-[var(--neo-green)] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[2px] translate-y-[2px]"
            : "bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        }`}
      >
        <span
          className={`p-1 rounded-full border border-black bg-white transition-transform duration-200 ${
            isOpen ? "rotate-12 bg-white" : "group-hover:rotate-12"
          }`}
        >
          <Calculator className="w-4 h-4 text-black" />
        </span>
        <span>Kalkulator Graficzny</span>
      </button>
    </div>
  );
}
