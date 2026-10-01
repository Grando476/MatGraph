"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRegister } from "@/utils/auth";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage({ type: "error", text: "Proszę wypełnić wszystkie pola formularza." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Podane hasła nie są identyczne." });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Hasło musi składać się z co najmniej 6 znaków." });
      return;
    }

    if (!acceptTerms) {
      setMessage({ type: "error", text: "Musisz zaakceptować Regulamin i Politykę Prywatności." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { success, error } = await authRegister({
        email,
        password,
        firstName,
        lastName,
      });

      if (!success || error) {
        throw new Error(error || "Rejestracja nie powiodła się.");
      }

      setMessage({
        type: "success",
        text: "Konto zostało pomyślnie utworzone! Przekierowanie do logowania...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Rejestracja nie powiodła się.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-main)] flex flex-col justify-center items-center relative overflow-hidden p-4">
      {/* Background Glowing Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[var(--accent-main)]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-[var(--node-green)]/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Header Navigation */}
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

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-[var(--text-muted)]">Masz już konto?</span>
          <Link
            href="/login"
            className="px-4 py-2 text-sm rounded-lg border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-main)] hover:text-[var(--accent-main)] transition-all"
          >
            Zaloguj się
          </Link>
        </div>
      </header>

      {/* Registration Card Form */}
      <main className="w-full max-w-md z-10 my-16">
        <div className="bg-[var(--bg-card)] border border-[var(--border-dark)] rounded-2xl p-8 shadow-2xl backdrop-blur-md relative">

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--accent-main)] mb-3 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">Dołącz do EduMath</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Utwórz darmowe konto ucznia i rozpocznij naukę.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm border ${message.type === "success"
                ? "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success-text)]"
                : "bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error-text)]"
              }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-1.5">
                  Imię
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="np. Jan"
                  className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-1.5">
                  Nazwisko
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="np. Kowalski"
                  className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-1.5">
                Adres e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. student@edumath.pl"
                className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-1.5">
                Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 znaków"
                className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-1.5">
                Potwierdź hasło
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Powtórz swoje hasło"
                className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all"
                required
              />
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-[var(--text-muted)] leading-snug">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--accent-main)] focus:ring-0"
                />
                <span>Akceptuję <a href="#" className="text-[var(--accent-main)] hover:underline">Regulamin</a> oraz <a href="#" className="text-[var(--accent-main)] hover:underline">Politykę Prywatności</a></span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 mt-2 bg-gradient-to-r from-[var(--accent-dark)] to-[var(--accent-hover)] text-white font-semibold rounded-lg shadow-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Rejestracja...</span>
                </>
              ) : (
                <span>Zarejestruj się</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px bg-[var(--border-dark)] flex-1" />
            <span className="text-xs text-[var(--text-dim)] uppercase">lub</span>
            <div className="h-px bg-[var(--border-dark)] flex-1" />
          </div>

          <Link
            href="/graph"
            className="w-full py-2.5 px-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--node-green)] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Przejdź do grafu bez rejestracji</span>
          </Link>

          <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
            Masz już konto?{" "}
            <Link href="/login" className="text-[var(--accent-main)] font-semibold hover:underline">
              Zaloguj się
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
