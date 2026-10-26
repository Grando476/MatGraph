"use client";

import { useRouter } from "next/navigation";

interface ExerciseLobbyProps {
  taskGroup: any;
  token: string | null;
  totalTasksInGroup: number;
  examPoolSize: number;
  selectedDifficulty: string;
  setSelectedDifficulty: (d: string) => void;
  difficultyCounts: Record<string, number>;
  showHistory: boolean;
  setShowHistory: (val: boolean | ((prev: boolean) => boolean)) => void;
  onStartPractice: (diff: string) => void;
  onStartExam: () => void;
  exerciseId: string;
  cachedExam?: any;
  onResumeExam?: () => void;
  currentUser?: any;
  adminPassing?: boolean;
  onAdminQuickPass?: () => void;
}

export default function ExerciseLobby({
  taskGroup,
  token,
  totalTasksInGroup,
  examPoolSize,
  selectedDifficulty,
  setSelectedDifficulty,
  difficultyCounts,
  showHistory,
  setShowHistory,
  onStartPractice,
  onStartExam,
  exerciseId,
  cachedExam,
  onResumeExam,
  currentUser,
  adminPassing,
  onAdminQuickPass,
}: ExerciseLobbyProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Title & Status Card */}
      <div className="bg-[var(--bg-card)] border-3 border-[var(--border-dark)] p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="bg-[var(--neo-pink)] text-black font-black text-xs px-3 py-1 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] uppercase">
            Grupa Zadań
          </span>

          {/* Status Badge */}
          {!token ? (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 font-black text-xs px-3 py-1.5 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] uppercase">
              Gość (zaloguj się, aby zapisywać postęp)
            </span>
          ) : taskGroup.is_passed ? (
            <span className="inline-flex items-center gap-1.5 bg-[var(--neo-green)] text-black font-black text-xs px-3 py-1.5 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] uppercase">
              Zaliczone ({taskGroup.best_score}%)
            </span>
          ) : taskGroup.attempts_count > 0 ? (
            <span className="inline-flex items-center gap-1.5 bg-[var(--neo-yellow)] text-black font-black text-xs px-3 py-1.5 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] uppercase">
              W trakcie ({taskGroup.attempts_count} podejść, max {taskGroup.best_score || 0}%)
            </span>
          ) : null}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black mb-6 text-[var(--text-main)] tracking-tight">
          {taskGroup.task_group_name}
        </h1>

        {/* History & Statistics Pills */}
        {taskGroup.attempts_count > 0 && (
          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#000] mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase text-gray-600">Statystyki:</span>
                <span className="bg-gray-100 border border-black px-2.5 py-1 rounded text-xs font-black">
                  Ilość podejść: {taskGroup.attempts_count}
                </span>
                {taskGroup.best_score !== null && (
                  <span className="bg-green-50 text-green-900 border border-green-600 px-2.5 py-1 rounded text-xs font-black">
                    Najlepszy wynik: {taskGroup.best_score}%
                  </span>
                )}
              </div>

              {taskGroup.history && taskGroup.history.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-3 py-1.5 bg-white hover:bg-[var(--neo-yellow)] text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{showHistory ? "Ukryj historię podejść" : `Historia podejść (${taskGroup.history.length})`}</span>
                  <span className="text-[10px]">{showHistory ? "▲" : "▼"}</span>
                </button>
              )}
            </div>

            {/* Expandable History Table */}
            {showHistory && taskGroup.history && (
              <div className="mt-4 pt-4 border-t border-gray-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-black font-black uppercase text-gray-500">
                      <th className="py-2 px-2">Nr</th>
                      <th className="py-2 px-2">Data</th>
                      <th className="py-2 px-2">Wynik</th>
                      <th className="py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskGroup.history.map((h: any, hIdx: number) => (
                      <tr key={h.id || hIdx} className="border-b border-gray-100 font-semibold hover:bg-gray-50">
                        <td className="py-2 px-2 font-black">#{taskGroup.history.length - hIdx}</td>
                        <td className="py-2 px-2 text-gray-600">
                          {h.completed_at ? new Date(h.completed_at).toLocaleString("pl-PL") : "—"}
                        </td>
                        <td className="py-2 px-2 font-black text-sm">{h.score_percentage}%</td>
                        <td className="py-2 px-2">
                          {h.passed ? (
                            <span className="text-green-700 font-black">ZDANY</span>
                          ) : (
                            <span className="text-red-600 font-black">Niezdany</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: ĆWICZ */}
        <div className="bg-white border-3 border-[var(--border-dark)] p-6 sm:p-7 rounded-2xl shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-black uppercase tracking-tight">Ćwicz</h2>
            </div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed mb-5">
              Rozwiązuj zadania pojedynczo z natychmiastowym sprawdzaniem.
            </p>

            {/* Difficulty selector pills */}
            <div className="mb-6">
              <span className="text-xs font-black uppercase text-gray-500 block mb-2">
                Poziom trudności:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "ALL", label: "Wszystkie" },
                  { id: "Easy", label: "Łatwe" },
                  { id: "Medium", label: "Średnie" },
                  { id: "Hard", label: "Trudne" },
                ].map((d) => {
                  const count = difficultyCounts[d.id] ?? 0;
                  const isDisabled = count === 0;
                  const isSelected = selectedDifficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedDifficulty(d.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black transition-all ${
                        isDisabled
                          ? "bg-gray-300 text-gray-500 shadow-[3px_3px_0px_0px_#000] cursor-not-allowed"
                          : isSelected
                          ? "bg-[var(--neo-yellow)] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[1px] translate-y-[1px]"
                          : "bg-white text-black hover:bg-gray-100 shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => onStartPractice(selectedDifficulty)}
            disabled={totalTasksInGroup === 0 || (difficultyCounts[selectedDifficulty] ?? 0) === 0}
            className="w-full py-3.5 bg-[var(--neo-blue)] hover:bg-[#60a5fa] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer text-center"
          >
            Rozpocznij ćwiczenia &rarr;
          </button>
        </div>

        {/* Card 2: ZALICZENIE */}
        <div className="bg-white border-3 border-[var(--border-dark)] p-6 sm:p-7 rounded-2xl shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-black uppercase tracking-tight">Zaliczenie</h2>
            </div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed mb-4">
              Test z losowych zadań z grupy. Wymagane min. 80% do zaliczenia.
            </p>

            <div className="bg-[var(--bg-main)] border-2 border-black p-3.5 rounded-xl mb-6 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 uppercase">Liczba pytań:</span>
                <span className="font-black text-black">
                  {examPoolSize} {examPoolSize >= 10 ? "(losowe)" : "(wszystkie dostępne)"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 uppercase">Próg zdania:</span>
                <span className="font-black text-green-700">80.0%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 uppercase">Zapis prób:</span>
                <span className="font-black text-red-600">Rejestracja w historii</span>
              </div>
            </div>
          </div>

          {!token ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border-2 border-black text-black font-bold text-xs rounded-xl shadow-[2px_2px_0px_0px_#000]">
                Zaliczenie wymaga zalogowania do konta.
              </div>
              <button
                onClick={() => router.push(`/login?redirect=/exercise/${exerciseId}`)}
                className="w-full py-3.5 bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer text-center"
              >
                Zaloguj się, aby przystąpić &rarr;
              </button>
            </div>
          ) : totalTasksInGroup === 0 ? (
            <div className="p-3 bg-gray-100 border-2 border-gray-400 text-gray-500 font-bold text-xs rounded-xl text-center">
              Brak zadań w tej grupie.
            </div>
          ) : cachedExam ? (
            <button
              onClick={onResumeExam}
              className="w-full py-3.5 bg-[var(--neo-green)] hover:bg-[#86efac] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>
                Kontynuuj zaliczenie ({Object.keys(cachedExam.examAnswers || {}).length}/{cachedExam.examTasks?.length || 10} pytań) &rarr;
              </span>
            </button>
          ) : (
            <button
              onClick={onStartExam}
              className="w-full py-3.5 bg-[var(--neo-green)] hover:bg-[#86efac] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer text-center"
            >
              Rozpocznij zaliczenie ({examPoolSize} pytań)
            </button>
          )}

          {currentUser?.role === "admin" && onAdminQuickPass && (
            <button
              type="button"
              onClick={onAdminQuickPass}
              disabled={adminPassing}
              className="w-full mt-3 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-black font-black uppercase text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{adminPassing ? "Zaliczanie..." : "Zalicz natychmiast"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
