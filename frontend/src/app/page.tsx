import Link from "next/link";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between relative overflow-hidden">
      {/* Neobrutalist Corner Geometric Badges */}
      <div className="hidden lg:block absolute top-8 left-8 rotate-[-6deg] z-0 pointer-events-none">
        <div className="bg-[var(--neo-yellow)] text-black font-extrabold text-xs px-3 py-1.5 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider">
          📐 Matematyka Maturalna
        </div>
      </div>
      <div className="hidden lg:block absolute top-12 right-12 rotate-[4deg] z-0 pointer-events-none">
        <div className="bg-[var(--neo-pink)] text-black font-extrabold text-xs px-3 py-1.5 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider">
          ★ Graf Pojęć i Zadań
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-24 left-10 rotate-[5deg] z-0 pointer-events-none">
        <div className="bg-[var(--neo-green)] text-black font-extrabold text-xs px-3 py-1.5 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider">
          ⚡ Szybka Nauka Krok po Kroku
        </div>
      </div>

      {/* Skupiona sekcja główna - Neobrutalism Hero Card */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16 flex-1 flex flex-col justify-center items-center text-center relative z-10 w-full">
        {/* Main Brutalist Container Card */}
        <div className="w-full bg-[var(--bg-card)] border-3 border-[var(--border-dark)] rounded-2xl p-6 sm:p-12 shadow-[8px_8px_0px_0px_#000] relative">
          
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-6 bg-[var(--neo-yellow)] border-2 border-[var(--border-dark)] rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span>Matura 2026 • Interaktywna Platforma</span>
          </div>

          {/* Logo w sekcji hero */}
          <div className="flex justify-center mb-6">
            <Logo size="2xl" />
          </div>

          {/* Wyrazisty nagłówek Neobrutalist */}
          <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-main)] leading-[1.18] mb-5 max-w-2xl mx-auto">
            Odkrywaj zależności między{" "}
            <span className="bg-[var(--neo-yellow)] px-2.5 py-0.5 border-2 border-[var(--border-dark)] rounded-lg shadow-[3px_3px_0px_0px_#000] inline-block -rotate-1 mt-1">
              pojęciami
            </span>{" "}
            matematycznymi.
          </h1>

          {/* Zwięzły opis */}
          <p className="font-sans text-sm sm:text-base text-[var(--text-muted)] font-medium leading-relaxed max-w-xl mx-auto mb-8">
            Przygotuj się do matury krok po kroku poznając zagadnienia i rozwiązując zadania, które razem tworzą spójną mozaikę wiedzy matematycznej.
          </p>

          {/* Feature Micro-Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 text-xs font-bold">
            <span className="bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] px-3 py-1 rounded-md shadow-[2px_2px_0px_0px_#000]">
              ✓ Interaktywna mapa zagadnień
            </span>
            <span className="bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] px-3 py-1 rounded-md shadow-[2px_2px_0px_0px_#000]">
              ✓ Formuły LaTeX & wideolekcje
            </span>
            <span className="bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] px-3 py-1 rounded-md shadow-[2px_2px_0px_0px_#000]">
              ✓ Wbudowany kalkulator Desmos
            </span>
          </div>

          {/* Akcje Neobrutalist */}
          <div className="flex flex-col items-center justify-center gap-3.5 w-full max-w-md mx-auto">
            {/* Rząd z Zaloguj się oraz Zarejestruj się */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <Link
                href="/login"
                className="w-full sm:w-1/2 py-3.5 px-5 rounded-xl bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black font-extrabold text-xs uppercase tracking-wider border-2.5 border-[var(--border-dark)] shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <span>Zaloguj się</span>
                <span className="text-base">&rarr;</span>
              </Link>

              <Link
                href="/register"
                className="w-full sm:w-1/2 py-3.5 px-5 rounded-xl bg-[var(--neo-green)] hover:bg-[#86efac] text-black font-extrabold text-xs uppercase tracking-wider border-2.5 border-[var(--border-dark)] shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <span>Zarejestruj się</span>
                <span className="text-base">+</span>
              </Link>
            </div>

            {/* Przejdź do grafu jako Gość */}
            <Link
              href="/graph"
              className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-[var(--neo-blue)] text-black font-black text-xs uppercase tracking-wider border-2.5 border-[var(--border-dark)] shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Przejdź do grafu jako Gość</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Dyskretny Footer */}
      <Footer />
    </div>
  );
}
