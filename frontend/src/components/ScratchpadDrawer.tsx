"use client";

import { useEffect, useState } from "react";
import { X, Calculator, Maximize2, Minimize2 } from "lucide-react";
import { useScratchpadStore } from "@/store/useScratchpadStore";
import DesmosCalculator from "@/components/DesmosCalculator";

export default function ScratchpadDrawer() {
  const { isOpen, close } = useScratchpadStore();
  const [isMaximized, setIsMaximized] = useState(false);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  return (
    <>
      {/* Backdrop overlay (clickable to close) */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Slide-over Drawer Panel */}
      {/* Note: Kept mounted in the DOM at all times so Desmos state/equations are preserved */}
      <aside
        role="dialog"
        aria-modal={isOpen}
        aria-label="Brudnopis z kalkulatorem Desmos"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full z-50 bg-[var(--bg-card)] border-l border-[var(--border-dark)] shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          isMaximized
            ? "w-full"
            : "w-full sm:w-[600px] md:w-[750px] lg:w-[900px] xl:w-[1050px] 2xl:w-[1200px] max-w-full"
        } ${isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-dark)] bg-[var(--bg-card)] select-none shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--accent-main)] border border-[var(--border-subtle)]">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-main)]">Kalkulator graficzny</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              type="button"
              aria-label={isMaximized ? "Zmniejsz panel kalkulatora" : "Maksymalizuj panel kalkulatora"}
              title={isMaximized ? "Przywróć standardowy rozmiar" : "Rozwiń na pełny ekran"}
              className="p-2 rounded-lg text-[var(--text-subtle)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] active:scale-95 transition-all cursor-pointer border border-transparent hover:border-[var(--border-subtle)]"
            >
              {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={close}
              type="button"
              aria-label="Zamknij panel kalkulatora"
              className="p-2 rounded-lg text-[var(--text-subtle)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] active:scale-95 transition-all cursor-pointer border border-transparent hover:border-[var(--border-subtle)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desmos Calculator Container */}
        <div className="flex-1 w-full min-h-0 relative flex flex-col overflow-hidden bg-white">
          <DesmosCalculator isVisible={isOpen} />
        </div>
      </aside>
    </>
  );
}
