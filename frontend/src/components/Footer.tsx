import React from "react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t-2.5 border-[var(--border-dark)] py-5 text-center text-xs font-bold text-[var(--text-main)] w-full bg-[var(--bg-card)]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--neo-green)] border border-[var(--border-dark)] rounded-sm inline-block shadow-[1px_1px_0px_#000]" />
          <span className="tracking-wider uppercase font-extrabold">MatGraph Platform</span>
          <span className="text-[var(--text-muted)] font-medium">• Egzamin Maturalny z Matematyki</span>
        </div>
        <div className="text-[var(--text-muted)] text-[11px] font-semibold">
          &copy; {new Date().getFullYear()} Wszelkie prawa zastrzeżone
        </div>
      </div>
    </footer>
  );
}
