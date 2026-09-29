import Link from "next/link";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-main)] flex flex-col justify-between relative overflow-hidden selection:bg-[var(--accent-main)] selection:text-black">

      {/* Dynamic Glowing Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[var(--accent-dark)]/20 via-[var(--accent-main)]/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[var(--node-green)]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[var(--accent-yellow)]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Overlay background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* Header / Navbar */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-[var(--border-dark)]/50 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-main)] to-[var(--accent-dark)] p-0.5 shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:shadow-[0_0_25px_rgba(56,189,248,0.7)] transition-all">
            <div className="w-full h-full bg-[var(--bg-dark)] rounded-[10px] flex items-center justify-center font-mono font-bold text-[var(--accent-main)] text-xl">
              ∑
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            Edu<span className="text-[var(--accent-main)]">Math</span>
          </span>
        </Link>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-main)] hover:text-[var(--accent-main)] hover:shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all"
          >
            Zaloguj się
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center flex-1 flex flex-col justify-center items-center">


        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          Odkrywaj matematykę w formie{" "}
          <span className="bg-gradient-to-r from-[var(--accent-main)] via-[var(--node-green)] to-[var(--accent-yellow)] bg-clip-text text-transparent">
            interaktywnego grafu
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[var(--text-subtle)] max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Wizualizuj zależności między pojęciami matematycznymi, ucz się z lekcji multimedialnych i rozwiązuj interaktywne zadania dopasowane do Twojego poziomu.
        </p>

        {/* Primary Action Buttons Requested by User */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">

          {/* Button 1: Transfer to Register Page */}
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--accent-dark)] to-[var(--accent-hover)] text-white font-bold text-base shadow-[0_0_25px_rgba(14,165,233,0.4)] hover:shadow-[0_0_35px_rgba(14,165,233,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-200 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Zarejestruj się</span>
          </Link>

          {/* Button 2: Go unlogged into math graph page */}
          <Link
            href="/graph"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] text-[var(--text-main)] font-bold text-base hover:border-[var(--node-green)] hover:text-white hover:shadow-[0_0_25px_rgba(76,211,155,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--node-green)] group-hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Sprawdź bez logowania</span>
          </Link>

        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-4">

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dark)] hover:border-[var(--accent-main)]/50 transition-all hover:-translate-y-1 shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-dark)]/20 border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)] mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Graf Wiedzy</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Przeglądaj powiązane węzły tematów matematycznych. Przemieszczaj się płynnie od podstaw do zaawansowanych teorii.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dark)] hover:border-[var(--node-green)]/50 transition-all hover:-translate-y-1 shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-[var(--node-green)]/10 border border-[var(--node-green)]/30 flex items-center justify-center text-[var(--node-green)] mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Dedykowane Lekcje</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Dostęp do teorii z pięknymi wzorami KaTeX oraz dedykowanymi materiałami wideo ułatwiającymi przyswojenie wiedzy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dark)] hover:border-[var(--accent-yellow)]/50 transition-all hover:-translate-y-1 shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-yellow)]/10 border border-[var(--accent-yellow)]/30 flex items-center justify-center text-[var(--accent-yellow)] mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Zadania i Praktyka</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Sprawdzaj wiedzę w praktyce, otrzymuj natychmiastową weryfikację odpowiedzi oraz pełne wzorcowe wyjaśnienia krok po kroku.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
