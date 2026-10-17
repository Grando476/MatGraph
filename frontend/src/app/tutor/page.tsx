"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, authLogout, UserProfile, getApiUrl, getAuthToken } from "@/utils/auth";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";

interface StudentMember {
  id: string;
  name: string;
  email?: string;
  joined_at?: string;
}

interface Classroom {
  id: string;
  name: string;
  description?: string;
  join_code: string;
  created_at?: string;
  members_count: number;
  students: StudentMember[];
}

export default function TutorPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal tworzenia klasy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState("");
  const [classDescInput, setClassDescInput] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Podgląd listy uczniów w klasie
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/tutor/classes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error("Błąd podczas pobierania klas korepetytora:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);
      await fetchClasses();
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await authLogout();
    router.push("/login");
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = classNameInput.trim();
    if (!name) {
      setCreateError("Podaj nazwę klasy.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/tutor/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          description: classDescInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.detail || "Nie udało się utworzyć klasy.");
        return;
      }

      setClassNameInput("");
      setClassDescInput("");
      setIsModalOpen(false);
      await fetchClasses();
    } catch (err: any) {
      setCreateError(err.message || "Błąd połączenia z serwerem.");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between selection:bg-[var(--neo-yellow)]">
      {/* Header */}
      <header className="border-b-2.5 border-[var(--border-dark)] bg-[var(--bg-card)] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" href="/graph" />
            <span className="hidden sm:inline-block bg-[var(--neo-yellow)] text-black border-2 border-black rounded-md px-2.5 py-0.5 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
              Panel Korepetytora
            </span>
          </div>
          <Link
            href="/graph"
            className="flex items-center gap-2 bg-white hover:bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl border-2 border-[var(--border-dark)] shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer group"
          >
            <span className="text-base transition-transform duration-200 group-hover:-translate-x-1">&larr;</span>
            <span>Wróć do Mapy</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section with Create Class action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2.5">
              <span>Moje Klasy</span>
              <span className="text-sm font-black bg-[var(--neo-yellow)] border-2 border-black px-2.5 py-0.5 rounded-lg shadow-[2px_2px_0px_0px_#000]">
                {classes.length}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-700 font-semibold mt-1">
              Zarządzaj swoimi klasami, udostępniaj uczniom kody dołączenia i kontroluj ich postępy.
            </p>
          </div>

          <button
            onClick={() => {
              setCreateError("");
              setIsModalOpen(true);
            }}
            className="px-5 py-3 bg-[var(--neo-green)] hover:bg-[#72e89f] text-black font-black text-xs uppercase tracking-wider rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="text-base font-black">+</span>
            <span>Utwórz nową klasę</span>
          </button>
        </div>

        {/* Classes List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="bg-white border-3 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-black text-sm uppercase tracking-wider">Wczytywanie Twoich klas...</span>
            </div>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white border-3 border-black rounded-2xl p-10 text-center max-w-xl mx-auto shadow-[6px_6px_0px_0px_#000] space-y-4">
            <div className="w-16 h-16 mx-auto bg-[var(--neo-yellow)] border-2 border-black rounded-2xl flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#000]">
              🏫
            </div>
            <h2 className="text-xl font-black text-black uppercase">Nie masz jeszcze żadnych klas</h2>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold max-w-md mx-auto">
              Utwórz swoją pierwszą klasę, aby wygenerować unikalny kod, który przekażesz uczniom do dołączenia.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setCreateError("");
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-yellow-300 transition-all cursor-pointer"
              >
                + Utwórz pierwszą klasę
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const isExpanded = expandedClassId === cls.id;
              return (
                <div
                  key={cls.id}
                  className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    {/* Top Row: Title + Code Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-black leading-snug">
                          {cls.name}
                        </h3>
                        {cls.description && (
                          <p className="text-xs text-gray-600 font-semibold mt-1 line-clamp-2">
                            {cls.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Join Code Box */}
                    <div className="bg-[var(--bg-deep)] border-2 border-black rounded-xl p-3 flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000]">
                      <div>
                        <div className="text-[10px] font-black uppercase text-gray-600 tracking-wider">
                          Kod dołączenia:
                        </div>
                        <div className="font-mono text-base font-black tracking-widest text-black">
                          {cls.join_code}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(cls.join_code)}
                        className="px-2.5 py-1.5 bg-white hover:bg-[var(--neo-yellow)] border-1.5 border-black rounded-lg font-black text-[11px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                        title="Skopiuj kod do schowka"
                      >
                        {copiedCode === cls.join_code ? "✓ Skopiowano" : "Kopiuj"}
                      </button>
                    </div>

                    {/* Stats pill */}
                    <div className="flex items-center justify-between text-xs font-bold pt-1 text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <span>👥 Uczniowie:</span>
                        <strong className="text-black font-black text-sm">{cls.members_count}</strong>
                      </span>
                      {cls.created_at && (
                        <span className="text-[10px] text-gray-500 font-medium">
                          {new Date(cls.created_at).toLocaleDateString("pl-PL")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle students view */}
                  <div className="mt-4 pt-3 border-t-2 border-black/10">
                    <button
                      onClick={() => setExpandedClassId(isExpanded ? null : cls.id)}
                      className="w-full py-2 bg-gray-50 hover:bg-gray-100 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider text-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? "Ukryj listę uczniów" : "Pokaż uczniów"}</span>
                      <span>{isExpanded ? "▲" : "▼"}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-2 space-y-2 max-h-48 overflow-y-auto">
                        {cls.students && cls.students.length > 0 ? (
                          cls.students.map((student) => (
                            <div
                              key={student.id}
                              className="p-2 bg-[var(--bg-deep)] border-1.5 border-black rounded-lg flex items-center justify-between text-xs"
                            >
                              <div className="font-bold text-black truncate pr-2">
                                <div>{student.name}</div>
                                {student.email && (
                                  <div className="text-[10px] text-gray-500 truncate font-normal">
                                    {student.email}
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-600 whitespace-nowrap font-medium">
                                {student.joined_at
                                  ? new Date(student.joined_at).toLocaleDateString("pl-PL")
                                  : ""}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-3 text-xs text-gray-500 italic font-semibold">
                            Żaden uczeń jeszcze nie dołączył do tej klasy.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal: Tworzenie klasy */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creating) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white border-3 border-black rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-[8px_8px_0px_0px_#000] relative animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-[var(--neo-yellow)] border-2 border-black rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
                  ➕
                </div>
                <div>
                  <h2 className="text-lg font-black text-black uppercase tracking-tight">
                    Utwórz nową klasę
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold">
                    Kod dołączenia wygeneruje się automatycznie
                  </p>
                </div>
              </div>
              <button
                onClick={() => !creating && setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg border-2 border-black bg-gray-100 hover:bg-gray-200 font-black text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Nazwa klasy / grupy *
                </label>
                <input
                  type="text"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="np. Matura Podstawowa 2026 – Grupa A"
                  required
                  autoFocus
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-bold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  value={classDescInput}
                  onChange={(e) => setClassDescInput(e.target.value)}
                  placeholder="np. Zajęcia we wtorki i czwartki o 17:00..."
                  rows={3}
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-semibold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>

              {createError && (
                <div className="p-3 bg-red-100 border-2 border-red-600 rounded-xl text-xs font-bold text-red-800 text-center">
                  {createError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={creating}
                  className="flex-1 py-2.5 bg-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={creating || !classNameInput.trim()}
                  className="flex-1.5 py-2.5 bg-[var(--neo-green)] text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:bg-[#72e89f] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {creating ? "Tworzenie..." : "Utwórz klasę"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
