import Link from "next/link";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-main)] flex flex-col justify-between relative overflow-hidden selection:bg-[var(--accent-main)]/30 selection:text-[var(--text-main)]">
      {/* Ambient glowing radial effects matching login/register pages */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[var(--accent-main)]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[var(--node-green)]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Skupiona, minimalistyczna sekcja główna */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24 flex-1 flex flex-col justify-center items-center text-center relative z-10">
        {/* Nowe, powiększone logo w sekcji hero */}
        <Logo size="2xl" className="mb-6" />

        {/* Czysty, wyrazisty nagłówek */}
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)] leading-[1.15] mb-5">
          Odkrywaj zależności między pojęciami matematycznymi.
        </h1>

        {/* Zwięzły opis */}
        <p className="font-sans text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-xl mb-10">
          Przygotuj się do matury krok po kroku poznając zagadnienia i rozwiązując zadania, które razem tworzą mozaikę wiedzy matematycznej
        </p>

        {/* Ujednolicone akcje */}
        <div className="flex flex-col items-center justify-center gap-3 w-full sm:w-auto mb-10">
          {/* Rząd z Zaloguj się oraz Zarejestruj się */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Link
              href="/login"
              className="w-full sm:w-44 py-3 px-5 rounded-lg bg-gradient-to-r from-[var(--accent-dark)] to-[var(--accent-hover)] hover:brightness-110 active:scale-[0.99] text-white text-xs font-semibold tracking-wide shadow-lg shadow-[var(--accent-main)]/20 transition-all flex items-center justify-center gap-2"
            >
              Zaloguj się
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-44 py-3 px-5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--accent-main)] hover:text-[var(--accent-main)] transition-all flex items-center justify-center gap-2 shadow-md"
            >
              Zarejestruj się
            </Link>
          </div>

          {/* Pod nimi: Przejdź do grafu jako Gość */}
          <Link
            href="/graph"
            className="w-full sm:w-[364px] py-3 px-5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--node-green)] transition-all flex items-center justify-center gap-2 shadow-md group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--node-green)] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Przejdź do grafu jako Gość</span>
          </Link>
        </div>
      </main>

      {/* Dyskretny Footer */}
      <Footer />
    </div>
  );
}

