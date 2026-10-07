"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRegister } from "@/utils/auth";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between items-center relative overflow-hidden p-4">
      {/* Decorative Badges */}
      <div className="hidden sm:block absolute top-8 right-8 rotate-[4deg] z-0 pointer-events-none">
        <div className="bg-[var(--neo-green)] text-black font-extrabold text-xs px-3 py-1.5 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] uppercase">
          ★ Rejestracja Ucznia
        </div>
      </div>

      {/* Registration Card Form */}
      <main className="w-full max-w-md z-10 my-10">
        <div className="bg-[var(--bg-card)] border-3 border-[var(--border-dark)] rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] relative">

          <div className="text-center mb-6">
            <div className="flex justify-center mb-2.5">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight">
              Dołącz do MatGraph
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
              Utwórz darmowe konto ucznia i rozpocznij naukę.
            </p>
          </div>

          {message && (
            <div className={`mb-5 p-4 rounded-xl text-xs font-bold border-2 border-[var(--border-dark)] shadow-[3px_3px_0px_0px_#000] ${
              message.type === "success"
                ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                : "bg-[var(--error-bg)] text-[var(--error-text)]"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-main)] mb-1">
                  Imię
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="np. Jan"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] rounded-xl text-[var(--text-main)] placeholder-[var(--text-dim)] font-semibold shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-main)] mb-1">
                  Nazwisko
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="np. Kowalski"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] rounded-xl text-[var(--text-main)] placeholder-[var(--text-dim)] font-semibold shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-main)] mb-1">
                Adres e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. student@edumath.pl"
                className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] rounded-xl text-[var(--text-main)] placeholder-[var(--text-dim)] font-semibold shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-main)] mb-1">
                Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 znaków"
                className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] rounded-xl text-[var(--text-main)] placeholder-[var(--text-dim)] font-semibold shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-main)] mb-1">
                Potwierdź hasło
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Powtórz swoje hasło"
                className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-[var(--border-dark)] rounded-xl text-[var(--text-main)] placeholder-[var(--text-dim)] font-semibold shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                required
              />
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-[var(--text-muted)] leading-snug">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-2 border-[var(--border-dark)] text-black focus:ring-0 cursor-pointer shadow-[1px_1px_0px_0px_#000]"
                />
                <span>
                  Akceptuję <a href="#" className="font-bold text-black underline">Regulamin</a> oraz <a href="#" className="font-bold text-black underline">Politykę Prywatności</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[var(--neo-green)] hover:bg-[#86efac] text-black font-black uppercase tracking-wider text-xs rounded-xl border-2.5 border-[var(--border-dark)] shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Rejestracja...</span>
                </>
              ) : (
                <span>Zarejestruj się &rarr;</span>
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
            className="w-full py-2.5 px-4 border-2.5 border-[var(--border-dark)] bg-white hover:bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Przejdź do grafu bez rejestracji</span>
          </Link>

          <p className="mt-5 text-center text-xs font-semibold text-[var(--text-muted)]">
            Masz już konto?{" "}
            <Link href="/login" className="text-black font-black underline hover:text-[var(--neo-pink)] ml-1">
              Zaloguj się &rarr;
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
