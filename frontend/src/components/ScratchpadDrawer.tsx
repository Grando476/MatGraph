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
      {/* Backdrop overlay */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-200 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Slide-over Drawer Panel */}
      <aside
        role="dialog"
        aria-modal={isOpen}
        aria-label="Brudnopis z kalkulatorem Desmos"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full z-50 bg-[var(--bg-card)] border-l-3 border-[var(--border-dark)] shadow-[-8px_0px_0px_0px_#000] flex flex-col transition-all duration-300 ease-in-out ${isMaximized
            ? "w-full"
            : "w-full sm:w-[600px] md:w-[750px] lg:w-[900px] xl:w-[1050px] 2xl:w-[1200px] max-w-full"
          } ${isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2.5 border-[var(--border-dark)] bg-[var(--bg-deep)] select-none shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[var(--neo-yellow)] text-black border-2 border-[var(--border-dark)] shadow-[2px_2px_0px_0px_#000]">
              <Calculator className="w-5 h-5 text-black" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)]">
                Kalkulator Graficzny
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              type="button"
              aria-label={isMaximized ? "Zmniejsz panel kalkulatora" : "Maksymalizuj panel kalkulatora"}
              title={isMaximized ? "Przywróć standardowy rozmiar" : "Rozwiń na pełny ekran"}
              className="p-1.5 rounded-lg bg-white text-black border-2 border-[var(--border-dark)] shadow-[2px_2px_0px_0px_#000] hover:bg-[var(--neo-yellow)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={close}
              type="button"
              aria-label="Zamknij panel kalkulatora"
              className="p-1.5 rounded-lg bg-white text-black border-2 border-[var(--border-dark)] shadow-[2px_2px_0px_0px_#000] hover:bg-[var(--neo-pink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
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
