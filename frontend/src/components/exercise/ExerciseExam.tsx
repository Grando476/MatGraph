"use client";

import MixedMathText from "@/components/MixedMathText";
import { parseTaskContent, formatDifficulty } from "./types";

interface ExerciseExamProps {
  examTasks: any[];
  examIndex: number;
  setExamIndex: (idx: number | ((prev: number) => number)) => void;
  examAnswers: Record<string, any>;
  setExamAnswerForTask: (taskId: string, answerPayload: any) => void;
  examSubmitting: boolean;
  onExamSubmit: () => void;
}

export default function ExerciseExam({
  examTasks,
  examIndex,
  setExamIndex,
  examAnswers,
  setExamAnswerForTask,
  examSubmitting,
  onExamSubmit,
}: ExerciseExamProps) {
  return (
    <div className="space-y-6">
      {/* Exam Navigator Bar */}
      <div className="bg-white border-3 border-[var(--border-dark)] p-4 sm:p-5 rounded-2xl shadow-[6px_6px_0px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-[var(--neo-pink)] text-black font-black text-xs px-2.5 py-1 rounded border-2 border-black uppercase">
              Zaliczenie
            </span>

            <span className="text-xs font-bold text-gray-700">
              Pytanie <strong className="text-black">{examIndex + 1}</strong> z <strong className="text-black">{examTasks.length}</strong>
            </span>
          </div>

          <span className="text-xs font-black text-gray-600 bg-gray-100 border border-gray-400 px-2 py-0.5 rounded">
            Wypełniono: {Object.keys(examAnswers).length} / {examTasks.length}
          </span>
        </div>

        {/* Question Numbers Strip */}
        <div className="flex flex-wrap gap-2">
          {examTasks.map((t, i) => {
            const isAnswered = examAnswers[t.id] !== undefined;
            const isActive = i === examIndex;

            let pillClass = "bg-white text-black hover:bg-gray-100";
            if (isActive) {
              pillClass = "bg-[var(--neo-yellow)] text-black border-black font-black shadow-[2px_2px_0px_0px_#000]";
            } else if (isAnswered) {
              pillClass = "bg-[var(--neo-blue)] text-black font-black";
            }

            return (
              <button
                key={t.id || i}
                onClick={() => setExamIndex(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold border-2 border-black flex items-center justify-center transition-all ${pillClass}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Exam Question */}
      {examTasks[examIndex] && (() => {
        const task = examTasks[examIndex];
        const { contentObj, isTrueFalse, isOpen, isMcq } = parseTaskContent(task);
        const currentAnswer = examAnswers[task.id];

        return (
          <div className="bg-white border-3 border-[var(--border-dark)] p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0px_0px_#000]">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="bg-black text-white font-black text-xs uppercase px-2.5 py-1 rounded">
                Pytanie {examIndex + 1}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">
                Trudność: {formatDifficulty(task.difficulty_level)}
              </span>
            </div>

            <div className="text-lg font-semibold text-[var(--text-main)] mb-6 leading-relaxed">
              <MixedMathText text={contentObj.question || ""} />
            </div>

            {/* TRUE_FALSE in Exam */}
            {isTrueFalse && contentObj.statements && Array.isArray(contentObj.statements) && (
              <div className="space-y-3">
                {contentObj.statements.map((stmt: any) => {
                  const tfMap = currentAnswer || {};
                  const val = tfMap[stmt.id];

                  return (
                    <div key={stmt.id} className="p-4 rounded-xl border-2 border-black bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-sm font-medium">
                        <MixedMathText text={stmt.text} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setExamAnswerForTask(task.id, { ...tfMap, [stmt.id]: true });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black ${
                            val === true ? "bg-[var(--neo-green)] shadow-[2px_2px_0px_0px_#000]" : "bg-white"
                          }`}
                        >
                          PRAWDA
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExamAnswerForTask(task.id, { ...tfMap, [stmt.id]: false });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black ${
                            val === false ? "bg-[var(--neo-pink)] shadow-[2px_2px_0px_0px_#000]" : "bg-white"
                          }`}
                        >
                          FAŁSZ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* OPEN in Exam */}
            {isOpen && (
              <div>
                <input
                  type="text"
                  placeholder="Wpisz swoją odpowiedź..."
                  value={currentAnswer?.user_answer ?? ""}
                  onChange={(e) => setExamAnswerForTask(task.id, { user_answer: e.target.value })}
                  className="w-full p-3.5 border-2 border-black rounded-xl bg-white font-bold text-sm shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
            )}

            {/* MCQ in Exam */}
            {isMcq && contentObj.options && Array.isArray(contentObj.options) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contentObj.options.map((opt: string, optIdx: number) => {
                  const isSelected = currentAnswer?.selected_option === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => setExamAnswerForTask(task.id, { selected_option: optIdx })}
                      className={`p-4 text-center border-2 border-black rounded-xl font-bold text-sm transition-all ${
                        isSelected
                          ? "bg-[var(--neo-blue)] text-black font-black shadow-[2px_2px_0px_0px_#000] translate-x-[1px] translate-y-[1px]"
                          : "bg-white text-black hover:bg-gray-100 shadow-[3px_3px_0px_0px_#000]"
                      }`}
                    >
                      <MixedMathText text={opt} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setExamIndex((prev) => Math.max(0, (typeof prev === "number" ? prev : 0) - 1))}
                disabled={examIndex === 0}
                className="px-4 py-2.5 bg-white disabled:opacity-40 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] disabled:cursor-not-allowed"
              >
                &larr; Poprzednie
              </button>

              {examIndex < examTasks.length - 1 ? (
                <button
                  onClick={() => setExamIndex((prev) => (typeof prev === "number" ? prev : 0) + 1)}
                  className="px-5 py-2.5 bg-[var(--neo-yellow)] border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#fde047]"
                >
                  Następne &rarr;
                </button>
              ) : (
                <button
                  onClick={onExamSubmit}
                  disabled={examSubmitting}
                  className="px-6 py-2.5 bg-[var(--neo-green)] hover:bg-[#86efac] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
                >
                  {examSubmitting ? "Weryfikacja..." : "Zakończ egzamin i sprawdź wynik"}
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Bottom Submit Shortcut */}
      <div className="flex justify-end">
        <button
          onClick={onExamSubmit}
          disabled={examSubmitting}
          className="px-6 py-3 bg-[var(--neo-green)] hover:bg-[#86efac] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
        >
          {examSubmitting ? "Sprawdzanie wyników..." : `Zakończ egzamin (${Object.keys(examAnswers).length}/${examTasks.length} wypełnione)`}
        </button>
      </div>
    </div>
  );
}
