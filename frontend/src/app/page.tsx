import Link from "next/link";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col justify-between selection:bg-blue-600/30 selection:text-[#e6edf3]">
      {/* Header z drastycznie powiększonym logo */}
      <header className="border-b border-[#212836] bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="xl" showSubtitle />

          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#2b3446] text-[#e6edf3] bg-[#161c26] hover:bg-[#1c2430] hover:border-[var(--accent-main)] hover:text-[var(--accent-main)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all shadow-sm"
          >
            Zaloguj się
          </Link>
        </div>
      </header>

      {/* Skupiona, minimalistyczna sekcja główna */}
      <main className="max-w-3xl mx-auto px-6 py-14 sm:py-20 flex-1 flex flex-col justify-center items-center text-center">
        {/* Nowe, powiększone logo w sekcji hero */}
        <Logo size="2xl" className="mb-6" />

        {/* Czysty, wyrazisty nagłówek */}
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#e6edf3] leading-[1.15] mb-5">
          Odkrywaj zależności między pojęciami matematycznymi.
        </h1>

        {/* Zwięzły opis */}
        <p className="font-sans text-sm sm:text-base text-[#9da7b3] leading-relaxed max-w-xl mb-10">
          Wizualizacja pojęć w formie grafu zależności, teoria ze składem formuł KaTeX oraz ukierunkowane zadania dopasowane do Twojego poziomu.
        </p>

        {/* Precyzyjne, minimalistyczne akcje */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-16">
          <Link
            href="/graph"
            className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-xs font-semibold tracking-wide border border-blue-400/30 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            <span>Przejdź do grafu jako Gość</span>
            <span className="font-mono text-xs">&rarr;</span>
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#131821] hover:bg-[#19202c] active:bg-[#161c26] text-[#e6edf3] text-xs font-medium border border-[#2b3446] hover:border-[#384358] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors"
          >
            Zarejestruj konto
          </Link>
        </div>

        {/* Minimalistyczny, horyzontalny podział na 3 filary */}
        <div className="w-full border-t border-[#212836] pt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-[#768390] uppercase tracking-wider block">
              01 // Topologia
            </span>
            <h2 className="font-heading text-xs font-semibold text-[#e6edf3]">
              Struktura powiązań
            </h2>
            <p className="text-xs text-[#768390] leading-relaxed">
              Przechodź płynnie od definicji bazowych do zaawansowanych teorii wzdłuż ścieżki krytycznej.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-[#768390] uppercase tracking-wider block">
              02 // Teoria
            </span>
            <h2 className="font-heading text-xs font-semibold text-[#e6edf3]">
              Formuły KaTeX
            </h2>
            <p className="text-xs text-[#768390] leading-relaxed">
              Zwięzłe lekcje, czytelny zapis matematyczny i formalne definicje zoptymalizowane pod naukę.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-[#768390] uppercase tracking-wider block">
              03 // Trening
            </span>
            <h2 className="font-heading text-xs font-semibold text-[#e6edf3]">
              Praktyka & Zadania
            </h2>
            <p className="text-xs text-[#768390] leading-relaxed">
              Natychmiastowa weryfikacja odpowiedzi i utrwalanie aparatu pojęciowego w praktyce.
            </p>
          </div>
        </div>

      </main>

      {/* Dyskretny Footer */}
      <Footer />
    </div>
  );
}

