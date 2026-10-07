"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authLogin } from "@/utils/auth";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: "error", text: "Proszę wypełnić wszystkie pola." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { success, error } = await authLogin(email, password);

      if (!success || error) {
        throw new Error(error || "Błąd logowania. Sprawdź e-mail i hasło.");
      }

      setMessage({ type: "success", text: "Zalogowano pomyślnie! Przekierowanie..." });
      setTimeout(() => {
        router.push("/graph");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Błąd logowania. Sprawdź e-mail i hasło.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between items-center relative overflow-hidden p-4">
      {/* Decorative Badges */}
      <div className="hidden sm:block absolute top-8 left-8 rotate-[-5deg] z-0 pointer-events-none">
        <div className="bg-[var(--neo-yellow)] text-black font-extrabold text-xs px-3 py-1.5 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] uppercase">
          ★ Twoje Konto Ucznia
        </div>
      </div>

      {/* Login Card */}
      <main className="w-full max-w-md z-10 my-10">
        <div className="bg-[var(--bg-card)] border-3 border-[var(--border-dark)] rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] relative">

          <div className="text-center mb-7">
            <div className="flex justify-center mb-3">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight">
              Zaloguj się do MatGraph
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1.5">
              Uzyskaj dostęp do swojego profilu, postępów i lekcji.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-bold border-2 border-[var(--border-dark)] shadow-[3px_3px_0px_0px_#000] ${
              message.type === "success"
                ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                : "bg-[var(--error-bg)] text-[var(--error-text)]"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-main)] mb-1.5">
                Adres e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. student@edumath.pl"
                className="w-full px-4 py-3 bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] rounded-xl text-[var(--text-main)] placeholder-[var(--text-dim)] font-semibold shadow-[3px_3px_0px_0px_#000] focus:shadow-[5px_5px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
                  Hasło
                </label>
                <a href="#" className="text-xs font-bold text-[var(--text-muted)] hover:text-black hover:underline">
                  Zapomniałeś hasła?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] rounded-xl text-[var(--text-main)] placeholder-[var(--text-dim)] font-semibold shadow-[3px_3px_0px_0px_#000] focus:shadow-[5px_5px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black font-black uppercase tracking-wider text-xs rounded-xl border-2.5 border-[var(--border-dark)] shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logowanie...</span>
                </>
              ) : (
                <span>Zaloguj się &rarr;</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-[2px] bg-black flex-1" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">lub</span>
            <div className="h-[2px] bg-black flex-1" />
          </div>

          <Link
            href="/graph"
            className="w-full py-3 px-4 border-2.5 border-[var(--border-dark)] bg-white hover:bg-[var(--neo-green)] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Przejdź do grafu jako Gość</span>
          </Link>

          <p className="mt-6 text-center text-xs font-semibold text-[var(--text-muted)]">
            Nie masz jeszcze konta?{" "}
            <Link href="/register" className="text-black font-black underline hover:text-[var(--neo-pink)] ml-1">
              Zarejestruj się &rarr;
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
