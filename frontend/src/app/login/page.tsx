"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: "error", text: "Proszę wypełnić wszystkie pola." });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    // Dynamic mock login simulation
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: "success", text: "Zalogowano pomyślnie! Przekierowanie do grafu wiedzy..." });
      setTimeout(() => {
        router.push("/graph");
      }, 1200);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-main)] flex flex-col justify-center items-center relative overflow-hidden p-4">
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-main)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[var(--accent-yellow)]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="absolute top-6 left-6 right-6 flex justify-between items-center max-w-6xl mx-auto w-full z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--text-main)] hover:text-[var(--accent-main)] transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-dark)]/30 border border-[var(--accent-main)] flex items-center justify-center text-[var(--accent-main)] font-mono text-sm font-bold">
            ∑
          </div>
          <span>Edu<span className="text-[var(--accent-main)]">Math</span></span>
        </Link>

        <Link
          href="/graph"
          className="px-4 py-2 text-sm rounded-lg border border-[var(--border-subtle)] text-[var(--text-subtle)] hover:border-[var(--accent-main)] hover:text-[var(--text-main)] transition-all flex items-center gap-2"
        >
          <span>Wykres bez logowania</span>
          <span>&rarr;</span>
        </Link>
      </header>

      {/* Login Card */}
      <main className="w-full max-w-md z-10 my-12">
        <div className="bg-[var(--bg-card)] border border-[var(--border-dark)] rounded-2xl p-8 shadow-2xl backdrop-blur-md relative">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--accent-main)] mb-3 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">Zaloguj się do EduMath</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Uzyskaj dostęp do swojego profilu, postępów i spersonalizowanych lekcji.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm border ${
              message.type === "success" 
                ? "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success-text)]" 
                : "bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error-text)]"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-2">
                Adres e-mail lub login
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. student@edumath.pl"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                  Hasło
                </label>
                <a href="#" className="text-xs text-[var(--accent-main)] hover:underline">
                  Zapomniałeś hasła?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-[var(--text-muted)]">
                <input 
                  type="checkbox" 
                  className="rounded border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--accent-main)] focus:ring-0" 
                />
                <span>Zapamiętaj mnie</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[var(--accent-dark)] to-[var(--accent-hover)] text-white font-semibold rounded-lg shadow-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logowanie...</span>
                </>
              ) : (
                <span>Zaloguj się</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-[var(--border-dark)] flex-1" />
            <span className="text-xs text-[var(--text-dim)] uppercase">lub</span>
            <div className="h-px bg-[var(--border-dark)] flex-1" />
          </div>

          {/* Guest Button Option inside form */}
          <Link
            href="/graph"
            className="w-full py-3 px-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] font-medium rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--node-green)] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Przejdź do grafu jako Gość</span>
          </Link>

          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            Nie masz jeszcze konta?{" "}
            <a href="#" className="text-[var(--accent-main)] font-semibold hover:underline">
              Zarejestruj się
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-[var(--text-dim)] z-10 pb-6">
        &copy; {new Date().getFullYear()} EduMath Platform. Wszelkie prawa zastrzeżone.
      </footer>
    </div>
  );
}
