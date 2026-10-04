import Link from "next/link";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col justify-between selection:bg-blue-600/30 selection:text-[#e6edf3]">
      {/* Skupiona, minimalistyczna sekcja główna */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24 flex-1 flex flex-col justify-center items-center text-center">
        {/* Nowe, powiększone logo w sekcji hero */}
        <Logo size="2xl" className="mb-6" />

        {/* Czysty, wyrazisty nagłówek */}
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#e6edf3] leading-[1.15] mb-5">
          Odkrywaj zależności między pojęciami matematycznymi.
        </h1>

        {/* Zwięzły opis */}
        <p className="font-sans text-sm sm:text-base text-[#9da7b3] leading-relaxed max-w-xl mb-10">
          Przygotuj się do matury krok po kroku poznając zagadnienia i rozwiązując zadania, które razem tworzą mozaikę wiedzy matematycznej
        </p>

        {/* Precyzyjne, minimalistyczne akcje */}
        <div className="flex flex-col items-center justify-center gap-3 w-full sm:w-auto mb-10">
          {/* Rząd z Zaloguj się oraz Zarejestruj się */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Link
              href="/login"
              className="w-full sm:w-44 px-5 py-2.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-xs font-semibold tracking-wide border border-blue-400/30 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              Zaloguj się
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-44 px-5 py-2.5 rounded-md bg-[#161c26] hover:bg-[#1c2430] active:bg-[#131821] text-[#e6edf3] text-xs font-semibold border border-[#2b3446] hover:border-[#384358] hover:text-[var(--accent-main)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              Zarejestruj się
            </Link>
          </div>

          {/* Pod nimi: Przejdź do grafu jako Gość */}
          <Link
            href="/graph"
            className="w-full sm:w-[364px] px-5 py-2.5 rounded-md bg-[#111620] hover:bg-[#171f2b] active:bg-[#0e121a] text-[#9da7b3] hover:text-[#e6edf3] text-xs font-medium border border-[#232b3b] hover:border-[#384358] transition-colors flex items-center justify-center gap-2 group"
          >
            <span>Przejdź do grafu jako Gość</span>
            <span className="font-mono text-xs text-[var(--accent-main)] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>
        </div>
      </main>

      {/* Dyskretny Footer */}
      <Footer />
    </div>
  );
}

