"use client";

import MixedMathText from "@/components/MixedMathText";
import { parseTaskContent, formatDifficulty } from "./types";

interface ExercisePracticeProps {
  filteredPracticeTasks: any[];
  practiceIndex: number;
  setPracticeIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedDifficulty: string;
  difficultyCounts: Record<string, number>;
  switchPracticeDifficulty: (diff: string) => void;
  resetPracticeQuestionState: () => void;
  practiceSelectedMcq: number | undefined;
  practiceCheckedMcq: boolean;
  onSelectMcq: (optIdx: number) => void;
  onCheckMcq: () => void;
  practiceTfAnswers: Record<string | number, boolean>;
  practiceTfResult: any;
  practiceTfVerifying: boolean;
  onSelectTf: (stmtId: string | number, val: boolean) => void;
  onCheckTf: (taskId: string) => void;
  practiceOpenAnswer: string;
  setPracticeOpenAnswer: (ans: string) => void;
  practiceOpenResult: any;
  practiceOpenVerifying: boolean;
  onCheckOpen: (taskId: string) => void;
  nextPracticeQuestion: () => void;
}

export default function ExercisePractice({
  filteredPracticeTasks,
  practiceIndex,
  setPracticeIndex,
  selectedDifficulty,
  difficultyCounts,
  switchPracticeDifficulty,
  resetPracticeQuestionState,
  practiceSelectedMcq,
  practiceCheckedMcq,
  onSelectMcq,
  onCheckMcq,
  practiceTfAnswers,
  practiceTfResult,
  practiceTfVerifying,
  onSelectTf,
  onCheckTf,
  practiceOpenAnswer,
  setPracticeOpenAnswer,
  practiceOpenResult,
  practiceOpenVerifying,
  onCheckOpen,
  nextPracticeQuestion,
}: ExercisePracticeProps) {
  return (
    <div className="space-y-6">
      {/* Practice Mode Header Bar */}
      <div className="bg-white border-3 border-[var(--border-dark)] p-4 sm:p-5 rounded-2xl shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-gray-500 mr-1">
            Poziom:
          </span>
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
                onClick={() => switchPracticeDifficulty(d.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-black border-2 border-black transition-all ${
                  isDisabled
                    ? "bg-gray-300 text-gray-500 shadow-[2px_2px_0px_0px_#000] cursor-not-allowed"
                    : isSelected
                    ? "bg-[var(--neo-yellow)] text-black shadow-[2px_2px_0px_0px_#000]"
                    : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {filteredPracticeTasks.length > 0 ? (
            <span className="text-xs font-bold text-gray-600">
              Zadanie <strong className="text-black">{practiceIndex + 1}</strong> z <strong className="text-black">{filteredPracticeTasks.length}</strong>
            </span>
          ) : (
            <span className="text-xs font-bold text-gray-500">
              Brak zadań (0 z 0)
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (practiceIndex > 0) {
                  setPracticeIndex((prev) => prev - 1);
                  resetPracticeQuestionState();
                }
              }}
              disabled={practiceIndex === 0 || filteredPracticeTasks.length === 0}
              className="px-3 py-1.5 bg-white disabled:opacity-40 border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:bg-gray-100 disabled:cursor-not-allowed"
            >
              &larr; Poprzednie
            </button>
            <button
              onClick={nextPracticeQuestion}
              disabled={filteredPracticeTasks.length <= 1 || practiceIndex >= filteredPracticeTasks.length - 1}
              className="px-3 py-1.5 bg-[var(--neo-yellow)] disabled:opacity-40 border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#fde047] disabled:cursor-not-allowed"
            >
              Następne &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Single Task Display */}
      {filteredPracticeTasks[practiceIndex] ? (
        (() => {
          const task = filteredPracticeTasks[practiceIndex];
          const { contentObj, isTrueFalse, isOpen, isMcq } = parseTaskContent(task);

          return (
            <div className="bg-white border-3 border-[var(--border-dark)] p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0px_0px_#000]">
              {/* Task Metadata */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white font-black text-xs uppercase px-2.5 py-1 rounded">
                    Zadanie #{practiceIndex + 1}
                  </span>
                  <span className="bg-gray-100 text-black border border-black font-black text-xs uppercase px-2 py-0.5 rounded">
                    {formatDifficulty(task.difficulty_level)}
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="text-lg font-semibold text-[var(--text-main)] mb-6 leading-relaxed">
                <MixedMathText text={contentObj.question || ""} />
              </div>

              {/* 1. TRUE_FALSE */}
              {isTrueFalse && contentObj.statements && Array.isArray(contentObj.statements) && (
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Oceń każde ze zdań poniżej:
                  </p>
                  <div className="space-y-3">
                    {contentObj.statements.map((stmt: any, sIdx: number) => {
                      const userChoice = practiceTfAnswers[stmt.id];
                      const stmtRes = practiceTfResult?.statement_results?.find(
                        (r: any) => String(r.id) === String(stmt.id)
                      );
                      const isChecked = !!practiceTfResult;

                      return (
                        <div
                          key={stmt.id || sIdx}
                          className={`p-4 rounded-xl border-2 border-black transition-all ${
                            isChecked
                              ? stmtRes?.is_correct
                                ? "bg-green-50 border-green-600"
                                : "bg-red-50 border-red-600"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="text-sm font-medium mb-3">
                            <MixedMathText text={stmt.text} />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectTf(stmt.id, true)}
                              disabled={isChecked}
                              className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black ${
                                userChoice === true
                                  ? "bg-[var(--neo-green)] text-black shadow-[2px_2px_0px_0px_#000]"
                                  : "bg-white text-black hover:bg-gray-100"
                              }`}
                            >
                              PRAWDA {isChecked && stmtRes?.correct_answer === true && "✓"}
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectTf(stmt.id, false)}
                              disabled={isChecked}
                              className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black ${
                                userChoice === false
                                  ? "bg-[var(--neo-pink)] text-black shadow-[2px_2px_0px_0px_#000]"
                                  : "bg-white text-black hover:bg-gray-100"
                              }`}
                            >
                              FAŁSZ {isChecked && stmtRes?.correct_answer === false && "✓"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!practiceTfResult && (
                    <button
                      onClick={() => onCheckTf(task.id)}
                      disabled={practiceTfVerifying}
                      className="mt-4 px-6 py-3 bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black font-black uppercase text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                    >
                      {practiceTfVerifying ? "Sprawdzanie..." : "Sprawdź odpowiedź"}
                    </button>
                  )}

                  {practiceTfResult && (
                    <div className="mt-4 p-4 rounded-xl border-2 border-black bg-gray-50">
                      <p className="font-black text-sm mb-2">
                        {practiceTfResult.is_correct ? "Wszystkie zdania poprawnie!" : "Część zdań jest niepoprawna."}
                      </p>
                      {task.exemplary_solution && (
                        <div className="text-xs bg-white p-3 rounded-lg border border-black font-medium leading-relaxed">
                          <MixedMathText text={task.exemplary_solution} />
                        </div>
                      )}
                      <button
                        onClick={nextPracticeQuestion}
                        className="mt-4 px-5 py-2.5 bg-[var(--neo-green)] text-black font-black uppercase text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        Następne zadanie &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. OPEN */}
              {isOpen && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Wpisz odpowiedź..."
                      value={practiceOpenAnswer}
                      onChange={(e) => setPracticeOpenAnswer(e.target.value)}
                      disabled={!!practiceOpenResult}
                      className="flex-1 p-3.5 border-2 border-black rounded-xl bg-white font-bold text-sm shadow-[2px_2px_0px_0px_#000]"
                    />
                    {!practiceOpenResult && (
                      <button
                        onClick={() => onCheckOpen(task.id)}
                        disabled={!practiceOpenAnswer.trim() || practiceOpenVerifying}
                        className="px-6 py-3.5 bg-[var(--neo-yellow)] text-black font-black uppercase text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                      >
                        {practiceOpenVerifying ? "Sprawdzanie..." : "Sprawdź"}
                      </button>
                    )}
                  </div>

                  {practiceOpenResult && (
                    <div className="p-4 rounded-xl border-2 border-black bg-gray-50">
                      <p className="font-black text-sm mb-2">
                        {practiceOpenResult.is_correct
                          ? `✓ Brawo! Poprawna odpowiedź: ${practiceOpenResult.correct_answer}`
                          : `✕ Błąd. Prawidłowa odpowiedź: ${practiceOpenResult.correct_answer}`}
                      </p>
                      {task.exemplary_solution && (
                        <div className="text-xs bg-white p-3 rounded-lg border border-black font-medium leading-relaxed">
                          <MixedMathText text={task.exemplary_solution} />
                        </div>
                      )}
                      <button
                        onClick={nextPracticeQuestion}
                        className="mt-4 px-5 py-2.5 bg-[var(--neo-green)] text-black font-black uppercase text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        Następne zadanie &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 3. MCQ */}
              {isMcq && contentObj.options && Array.isArray(contentObj.options) && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {contentObj.options.map((opt: string, optIdx: number) => {
                      const isChecked = practiceCheckedMcq;
                      const isSelected = practiceSelectedMcq === optIdx;
                      const isCorrectOpt = optIdx === contentObj.correct_index;

                      let btnStyle = "bg-white text-black hover:bg-[var(--neo-yellow)] shadow-[3px_3px_0px_0px_#000]";
                      if (isChecked) {
                        if (isCorrectOpt) {
                          btnStyle = "bg-[var(--neo-green)] text-black font-black shadow-[2px_2px_0px_0px_#000]";
                        } else if (isSelected) {
                          btnStyle = "bg-[var(--neo-pink)] text-black font-bold opacity-80";
                        } else {
                          btnStyle = "bg-gray-100 text-gray-400 opacity-40 shadow-none";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-[var(--neo-blue)] text-black font-black shadow-[2px_2px_0px_0px_#000] translate-x-[1px] translate-y-[1px]";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => onSelectMcq(optIdx)}
                          disabled={isChecked}
                          className={`p-4 text-center border-2 border-black rounded-xl font-bold text-sm transition-all ${btnStyle}`}
                        >
                          <MixedMathText text={opt} />
                        </button>
                      );
                    })}
                  </div>

                  {!practiceCheckedMcq ? (
                    <button
                      onClick={onCheckMcq}
                      disabled={practiceSelectedMcq === undefined}
                      className="px-6 py-3 bg-[var(--neo-yellow)] disabled:bg-gray-200 disabled:text-gray-400 text-black font-black uppercase text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                    >
                      Sprawdź odpowiedź
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl border-2 border-black bg-gray-50">
                      <p className="font-black text-sm mb-2">
                        {practiceSelectedMcq === contentObj.correct_index
                          ? "✓ Poprawna odpowiedź! Brawo."
                          : "✕ Niestety, błędna odpowiedź."}
                      </p>
                      {task.exemplary_solution && (
                        <div className="text-xs bg-white p-3 rounded-lg border border-black font-medium leading-relaxed">
                          <MixedMathText text={task.exemplary_solution} />
                        </div>
                      )}
                      <button
                        onClick={nextPracticeQuestion}
                        className="mt-4 px-5 py-2.5 bg-[var(--neo-green)] text-black font-black uppercase text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        Następne zadanie &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="bg-white border-3 border-[var(--border-dark)] p-8 rounded-2xl text-center shadow-[6px_6px_0px_0px_#000]">
          <p className="font-bold text-base text-gray-700 mb-4">
            Brak zadań w wybranym poziomie trudności.
          </p>
          <button
            onClick={() => switchPracticeDifficulty("ALL")}
            className="px-5 py-2.5 bg-[var(--neo-yellow)] border-2 border-black font-black text-xs uppercase rounded-xl shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] cursor-pointer"
          >
            Pokaż wszystkie dostępne zadania
          </button>
        </div>
      )}
    </div>
  );
}
