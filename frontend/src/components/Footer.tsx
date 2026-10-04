import React from "react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--border-dark)]/50 py-6 text-center text-xs text-[var(--text-dim)] w-full bg-[var(--bg-dark)]">
      <div className="max-w-7xl mx-auto px-6 flex justify-center items-center">
        <span>&copy; {new Date().getFullYear()} MatGraph Platform</span>
      </div>
    </footer>
  );
}
