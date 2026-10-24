"use client";

import MixedMathText from "@/components/MixedMathText";
import { parseTaskContent } from "./types";

interface ExerciseExamResultProps {
  examResult: any;
  examTasks: any[];
  onRetryExam: () => void;
  onStartPractice: (diff: string) => void;
  onBack: () => void;
}

export default function ExerciseExamResult({
  examResult,
  examTasks,
  onRetryExam,
  onStartPractice,
  onBack,
}: ExerciseExamResultProps) {
  return (
    <div className="space-y-6">
      {/* Hero Result Banner */}
      <div
        className={`border-3 border-[var(--border-dark)] p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0px_0px_#000] text-center ${
          examResult.passed ? "bg-[var(--neo-green)] text-black" : "bg-[var(--neo-pink)] text-black"
        }`}
      >
        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
          {examResult.passed ? "Egzamin Zaliczony!" : "Egzamin Niezaliczony"}
        </h2>
        <p className="text-base font-bold mb-4">
          Twój wynik: <strong className="text-3xl font-black">{examResult.score_percentage}%</strong>
        </p>

        <p className="text-xs font-bold max-w-md mx-auto leading-relaxed">
          {examResult.passed
            ? "Gratulacje! Osiągnąłeś wymagany próg 80%. Grupa zadań została oficjalnie oznaczona jako zaliczona."
            : "Do zaliczenia wymagane jest co najmniej 80.0%. Przećwicz zadania w trybie ćwiczeń i spróbuj ponownie."}
        </p>

        <div className="mt-4 pt-4 border-t-2 border-black flex items-center justify-center text-xs font-black">
          <span>Podejście nr: #{examResult.attempts_count}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onRetryExam}
          className="px-6 py-3.5 bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          Spróbuj ponownie (nowe pytania)
        </button>
        <button
          onClick={() => onStartPractice("ALL")}
          className="px-6 py-3.5 bg-[var(--neo-blue)] hover:bg-[#60a5fa] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          Przejdź do ćwiczeń
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3.5 bg-white hover:bg-gray-100 text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          Wróć do grupy zadań &rarr;
        </button>
      </div>

      {/* Detailed Question Review */}
      <div className="bg-white border-3 border-[var(--border-dark)] p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0px_0px_#000]">
        <h3 className="text-xl font-black uppercase mb-6 tracking-tight">Przegląd odpowiedzi z egzaminu:</h3>
        <div className="space-y-6">
          {examTasks.map((t, idx) => {
            const taskRes = examResult.task_results?.[t.id];
            const isCorrect = taskRes?.is_correct;
            const { contentObj } = parseTaskContent(t);

            return (
              <div
                key={t.id || idx}
                className={`p-5 rounded-xl border-2.5 border-black ${
                  isCorrect ? "bg-green-50 border-green-600" : "bg-red-50 border-red-600"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-xs uppercase">
                    Zadanie {idx + 1} ({t.difficulty_level || "Medium"})
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-black uppercase border border-black ${
                      isCorrect ? "bg-[var(--neo-green)] text-black" : "bg-[var(--neo-pink)] text-black"
                    }`}
                  >
                    {isCorrect ? "✓ Poprawnie" : "✕ Błąd"}
                  </span>
                </div>

                <div className="text-sm font-semibold mb-3">
                  <MixedMathText text={contentObj.question || ""} />
                </div>

                {/* Exemplary solution if available */}
                {t.exemplary_solution && (
                  <div className="mt-3 pt-3 border-t border-black/10">
                    <span className="text-xs font-bold uppercase text-gray-500 block mb-1">
                      Wzorcowe rozwiązanie:
                    </span>
                    <div className="text-xs bg-white p-3 rounded-lg border border-black font-medium leading-relaxed">
                      <MixedMathText text={t.exemplary_solution} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
