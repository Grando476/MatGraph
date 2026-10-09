"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import 'katex/dist/katex.min.css';
import MixedMathText from "@/components/MixedMathText";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Scratchpad from "@/components/Scratchpad";

interface ExerciseViewProps {
  exerciseId: string;
}

export default function ExerciseView({ exerciseId }: ExerciseViewProps) {
  const router = useRouter();
  const [taskGroup, setTaskGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // MCQ State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  // TRUE_FALSE State
  const [tfSelections, setTfSelections] = useState<Record<string, Record<string | number, boolean>>>({});
  const [tfResults, setTfResults] = useState<Record<string, any>>({});
  const [tfVerifying, setTfVerifying] = useState<Record<string, boolean>>({});
  const [tfErrors, setTfErrors] = useState<Record<string, string>>({});

  // OPEN State
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [openResults, setOpenResults] = useState<Record<string, any>>({});
  const [openVerifying, setOpenVerifying] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/exercises/${exerciseId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch exercises");
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setTaskGroup(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [exerciseId]);

  // MCQ Handlers
  const handleSelect = (taskId: string, optionIndex: number) => {
    if (checkedTasks[taskId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [taskId]: optionIndex }));
  };

  const handleCheck = (taskId: string) => {
    setCheckedTasks((prev) => ({ ...prev, [taskId]: true }));
  };

  // TRUE_FALSE Handlers
  const handleTfSelect = (taskId: string, stmtId: number | string, value: boolean) => {
    if (tfResults[taskId]) return;
    setTfSelections((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [stmtId]: value,
      },
    }));
  };

  const handleTfCheck = async (taskId: string) => {
    if (tfVerifying[taskId] || tfResults[taskId]) return;
    const selections = tfSelections[taskId] || {};
    setTfVerifying((prev) => ({ ...prev, [taskId]: true }));
    setTfErrors((prev) => ({ ...prev, [taskId]: "" }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/v1/exercises/${taskId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          answers: selections,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || "Błąd podczas sprawdzania odpowiedzi");
      }

      const data = await res.json();
      setTfResults((prev) => ({ ...prev, [taskId]: data }));
    } catch (err: any) {
      setTfErrors((prev) => ({ ...prev, [taskId]: err.message || "Błąd połączenia z serwerem" }));
    } finally {
      setTfVerifying((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  // OPEN Handlers
  const handleOpenCheck = async (taskId: string) => {
    if (openVerifying[taskId] || openResults[taskId]) return;
    const ans = openAnswers[taskId] || "";
    setOpenVerifying((prev) => ({ ...prev, [taskId]: true }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/v1/exercises/${taskId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          answers: { user_answer: ans },
        }),
      });

      if (!res.ok) {
        throw new Error("Błąd podczas sprawdzania odpowiedzi");
      }
      const data = await res.json();
      setOpenResults((prev) => ({ ...prev, [taskId]: data }));
    } catch (err: any) {
      console.error(err);
    } finally {
      setOpenVerifying((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-8 flex justify-center items-center">
        <div className="bg-white border-3 border-[var(--border-dark)] p-8 rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center">
          <div className="w-10 h-10 border-3 border-black border-t-[var(--neo-yellow)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base font-black uppercase tracking-wider">Ładowanie zadań...</p>
        </div>
      </div>
    );
  }

  if (error || !taskGroup) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-8 flex flex-col justify-center items-center">
        <div className="bg-white border-3 border-[var(--border-dark)] p-8 rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center max-w-md">
          <p className="text-base font-black text-red-600 mb-4 uppercase">Błąd: {error || "Nie znaleziono zadań"}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-[var(--neo-yellow)] text-black font-black text-xs uppercase px-5 py-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
          >
            &larr; Wróć
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b-2.5 border-[var(--border-dark)] bg-[var(--bg-card)] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" href="/graph" />
            <span className="hidden sm:inline-block bg-[var(--neo-green)] text-black border-2 border-black rounded-md px-2.5 py-0.5 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
              Zadania Praktyczne
            </span>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white hover:bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl border-2 border-[var(--border-dark)] shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer group"
          >
            <span className="text-base transition-transform duration-200 group-hover:-translate-x-1">&larr;</span>
            <span>Wróć</span>
          </button>
        </div>
      </header>

      <div className="p-6 sm:p-10 flex-1">
        <div className="max-w-3xl mx-auto bg-[var(--bg-card)] border-3 border-[var(--border-dark)] p-6 sm:p-10 rounded-2xl shadow-[8px_8px_0px_0px_#000]">
          
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[var(--neo-pink)] text-black font-black text-xs px-3 py-1 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] uppercase">
              ★ Grupa Zadań
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-8 text-[var(--text-main)] tracking-tight">
            {taskGroup.task_group_name}
          </h1>

          {taskGroup.tasks && taskGroup.tasks.length > 0 ? (
            <div className="space-y-10">
              {taskGroup.tasks.map((task: any, index: number) => {
                let contentObj: any = {};
                try {
                  contentObj = typeof task.content === 'string' ? JSON.parse(task.content) : task.content;
                } catch (e) {
                  contentObj = { question: task.content };
                }

                const taskType = task.task_type || (contentObj.statements ? 'TRUE_FALSE' : (contentObj.options ? 'MCQ' : 'OPEN'));
                const isTrueFalse = taskType === 'TRUE_FALSE' || (contentObj.statements && Array.isArray(contentObj.statements));
                const isOpen = taskType === 'OPEN' || (!isTrueFalse && contentObj.correct_answer !== undefined);
                const isMcq = !isTrueFalse && !isOpen;

                // TRUE_FALSE Task specific state
                const currentTfSelections = tfSelections[task.id] || {};
                const currentTfResult = tfResults[task.id];
                const isTfVerifying = !!tfVerifying[task.id];
                const tfError = tfErrors[task.id];
                const totalStatements = contentObj.statements?.length || 0;
                const answeredCount = Object.keys(currentTfSelections).length;
                const allAnswered = totalStatements > 0 && contentObj.statements.every((s: any) => currentTfSelections[s.id] !== undefined);

                return (
                  <div key={task.id} className="p-6 sm:p-8 border-2.5 border-[var(--border-dark)] rounded-2xl bg-white shadow-[6px_6px_0px_0px_#000]">
                    {/* Task Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                      <div className="flex items-center gap-2">
                        <span className="bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                          Zadanie {index + 1}
                        </span>
                        {isTrueFalse ? (
                          <span className="bg-[var(--neo-blue)] text-black font-black text-xs uppercase tracking-wider px-2.5 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                            Prawda / Fałsz
                          </span>
                        ) : isOpen ? (
                          <span className="bg-[var(--neo-green)] text-black font-black text-xs uppercase tracking-wider px-2.5 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                            Zadanie Otwarte
                          </span>
                        ) : (
                          <span className="bg-white text-black font-black text-xs uppercase tracking-wider px-2.5 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                            Wielokrotny Wybór
                          </span>
                        )}
                      </div>

                      {task.difficulty_level && (
                        <span className="text-xs font-black uppercase text-gray-600 bg-gray-100 border border-gray-400 px-2 py-0.5 rounded">
                          {task.difficulty_level}
                        </span>
                      )}
                    </div>

                    {/* Question text */}
                    <div className="text-lg font-semibold text-[var(--text-main)] mb-6 leading-relaxed">
                      <MixedMathText text={contentObj.question || ''} />
                    </div>

                    {/* ========================================================= */}
                    {/* TYPE: TRUE_FALSE                                          */}
                    {/* ========================================================= */}
                    {isTrueFalse && contentObj.statements && Array.isArray(contentObj.statements) && (
                      <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                          Oceń każde ze zdań poniżej:
                        </p>

                        <div className="space-y-3.5">
                          {contentObj.statements.map((stmt: any, sIdx: number) => {
                            const userChoice = currentTfSelections[stmt.id];
                            const stmtResult = currentTfResult?.statement_results?.find(
                              (r: any) => String(r.id) === String(stmt.id)
                            );
                            const isStatementChecked = !!currentTfResult;

                            let cardBorderClass = "border-2.5 border-[var(--border-dark)] bg-[var(--bg-card)] shadow-[3px_3px_0px_0px_#000]";
                            if (isStatementChecked) {
                              if (stmtResult?.is_correct) {
                                cardBorderClass = "border-2.5 border-green-600 bg-[#E8F8EE] shadow-[3px_3px_0px_0px_#000]";
                              } else {
                                cardBorderClass = "border-2.5 border-red-600 bg-[#FEECEC] shadow-[3px_3px_0px_0px_#000]";
                              }
                            }

                            return (
                              <div
                                key={stmt.id || sIdx}
                                className={`p-4 sm:p-5 rounded-xl transition-all ${cardBorderClass}`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="bg-[var(--neo-yellow)] text-black font-black text-xs px-2.5 py-0.5 rounded border-2 border-black shadow-[1px_1px_0px_0px_#000] uppercase">
                                    Zdanie {sIdx + 1}
                                  </span>

                                  {isStatementChecked && (
                                    stmtResult?.is_correct ? (
                                      <span className="inline-flex items-center gap-1 bg-[var(--neo-green)] text-black border-2 border-black px-2.5 py-0.5 rounded-md font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]">
                                        ✓ Poprawnie
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-[var(--neo-pink)] text-black border-2 border-black px-2.5 py-0.5 rounded-md font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]">
                                        ✕ Błąd! Prawidłowa: {stmtResult?.correct_answer ? 'PRAWDA' : 'FAŁSZ'}
                                      </span>
                                    )
                                  )}
                                </div>

                                <div className="text-base font-medium text-[var(--text-main)] my-3 leading-relaxed">
                                  <MixedMathText text={stmt.text} />
                                </div>

                                {/* PRAWDA / FAŁSZ Toggle Buttons */}
                                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t-2 border-black/10">
                                  <span className="text-xs font-black uppercase text-gray-600 tracking-wider">
                                    Twoja ocena:
                                  </span>

                                  {/* Button: PRAWDA */}
                                  <button
                                    type="button"
                                    onClick={() => handleTfSelect(task.id, stmt.id, true)}
                                    disabled={isStatementChecked || isTfVerifying}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
                                      isStatementChecked
                                        ? stmtResult?.correct_answer === true
                                          ? userChoice === true
                                            ? 'bg-[var(--neo-green)] text-black shadow-[2px_2px_0px_0px_#000] cursor-default'
                                            : 'bg-green-100 text-green-900 border-green-600 shadow-none cursor-default font-black'
                                          : userChoice === true
                                            ? 'bg-[var(--neo-pink)] text-black line-through opacity-70 shadow-none cursor-default'
                                            : 'bg-gray-100 text-gray-400 border-gray-300 opacity-40 shadow-none cursor-default'
                                        : userChoice === true
                                          ? 'bg-[var(--neo-green)] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[1px] translate-y-[1px]'
                                          : 'bg-white hover:bg-green-50 text-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer'
                                    }`}
                                  >
                                    PRAWDA {isStatementChecked && stmtResult?.correct_answer === true && '✓'}
                                  </button>

                                  {/* Button: FAŁSZ */}
                                  <button
                                    type="button"
                                    onClick={() => handleTfSelect(task.id, stmt.id, false)}
                                    disabled={isStatementChecked || isTfVerifying}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
                                      isStatementChecked
                                        ? stmtResult?.correct_answer === false
                                          ? userChoice === false
                                            ? 'bg-[var(--neo-green)] text-black shadow-[2px_2px_0px_0px_#000] cursor-default'
                                            : 'bg-green-100 text-green-900 border-green-600 shadow-none cursor-default font-black'
                                          : userChoice === false
                                            ? 'bg-[var(--neo-pink)] text-black line-through opacity-70 shadow-none cursor-default'
                                            : 'bg-gray-100 text-gray-400 border-gray-300 opacity-40 shadow-none cursor-default'
                                        : userChoice === false
                                          ? 'bg-[var(--neo-pink)] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[1px] translate-y-[1px]'
                                          : 'bg-white hover:bg-pink-50 text-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer'
                                    }`}
                                  >
                                    FAŁSZ {isStatementChecked && stmtResult?.correct_answer === false && '✓'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* TRUE_FALSE Check Button */}
                        <div className="mt-6 flex flex-col items-start gap-4">
                          {tfError && (
                            <div className="p-3 bg-red-100 border-2 border-red-600 text-red-800 text-xs font-bold rounded-xl">
                              ⚠️ {tfError}
                            </div>
                          )}

                          {!currentTfResult && (
                            <button
                              onClick={() => handleTfCheck(task.id)}
                              disabled={!allAnswered || isTfVerifying}
                              className={`px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all border-2.5 border-[var(--border-dark)] ${
                                !allAnswered || isTfVerifying
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60 shadow-none'
                                  : 'bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] cursor-pointer'
                              }`}
                            >
                              {isTfVerifying ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                  Weryfikacja w backendzie...
                                </span>
                              ) : allAnswered ? (
                                "Sprawdź odpowiedzi &rarr;"
                              ) : (
                                `Zaznacz wszystkie zdania (${answeredCount}/${totalStatements})`
                              )}
                            </button>
                          )}

                          {/* TRUE_FALSE Verified Feedback Box */}
                          {currentTfResult && (
                            <div className={`mt-4 p-6 w-full rounded-xl border-3 border-[var(--border-dark)] shadow-[6px_6px_0px_0px_#000] ${
                              currentTfResult.is_correct ? 'bg-[var(--success-bg)]' : 'bg-[var(--error-bg)]'
                            }`}>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">
                                  {currentTfResult.is_correct ? "🎉" : "💡"}
                                </span>
                                <p className="font-black text-lg sm:text-xl text-black">
                                  {currentTfResult.is_correct
                                    ? "Wszystkie stwierdzenia ocenione poprawnie! Brawo!"
                                    : "Część odpowiedzi jest niepoprawna."}
                                </p>
                              </div>
                              <p className="font-medium text-xs sm:text-sm text-gray-800">
                                {currentTfResult.is_correct
                                  ? "Świetna robota! Doskonale rozumiesz te własności."
                                  : "Przeanalizuj poniższe wyjaśnienie krok po kroku, aby zrozumieć poprawne uzasadnienia."}
                              </p>

                              {(currentTfResult.exemplary_solution || task.exemplary_solution) && (
                                <div className="mt-5 pt-5 border-t-2 border-black text-[var(--text-main)]">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-[var(--neo-yellow)] text-black font-black text-xs uppercase px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
                                      Wyjaśnienie krok po kroku
                                    </span>
                                  </div>
                                  <div className="text-base bg-white p-5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] font-medium leading-relaxed">
                                    <MixedMathText text={currentTfResult.exemplary_solution || task.exemplary_solution} />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* TYPE: OPEN                                                */}
                    {/* ========================================================= */}
                    {isOpen && (
                      <div className="mt-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <input
                            type="text"
                            placeholder="Wpisz odpowiedź liczbową..."
                            value={openAnswers[task.id] || ""}
                            onChange={(e) => setOpenAnswers((prev) => ({ ...prev, [task.id]: e.target.value }))}
                            disabled={!!openResults[task.id] || openVerifying[task.id]}
                            className="flex-1 p-3.5 border-2.5 border-[var(--border-dark)] rounded-xl bg-white font-bold text-base shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[var(--neo-yellow)]"
                          />
                          {!openResults[task.id] && (
                            <button
                              onClick={() => handleOpenCheck(task.id)}
                              disabled={!openAnswers[task.id]?.trim() || openVerifying[task.id]}
                              className="px-6 py-3.5 bg-[var(--neo-yellow)] hover:bg-[#fde047] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
                            >
                              {openVerifying[task.id] ? "Sprawdzanie..." : "Sprawdź &rarr;"}
                            </button>
                          )}
                        </div>

                        {openResults[task.id] && (
                          <div className={`mt-5 p-5 rounded-xl border-2.5 border-[var(--border-dark)] shadow-[4px_4px_0px_0px_#000] ${
                            openResults[task.id].is_correct ? 'bg-[var(--success-bg)]' : 'bg-[var(--error-bg)]'
                          }`}>
                            <p className="font-black text-lg text-black">
                              {openResults[task.id].is_correct
                                ? `✓ Poprawna odpowiedź: ${openResults[task.id].correct_answer || contentObj.correct_answer}!`
                                : `✕ Niepoprawna odpowiedź. Prawidłowa odpowiedź: ${openResults[task.id].correct_answer || contentObj.correct_answer}`}
                            </p>
                            {(openResults[task.id].exemplary_solution || task.exemplary_solution) && (
                              <div className="mt-4 pt-4 border-t-2 border-black">
                                <div className="text-base bg-white p-4 rounded-xl border-2 border-black font-medium shadow-[2px_2px_0px_0px_#000]">
                                  <MixedMathText text={openResults[task.id].exemplary_solution || task.exemplary_solution} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* TYPE: MCQ (Wielokrotny wybór)                             */}
                    {/* ========================================================= */}
                    {isMcq && contentObj.options && Array.isArray(contentObj.options) && (
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {contentObj.options.map((opt: string, optIndex: number) => {
                            const isChecked = checkedTasks[task.id];
                            const selectedOpt = selectedAnswers[task.id];
                            const correctOpt = contentObj.correct_index;

                            let btnClass = "p-4 text-center border-2.5 border-[var(--border-dark)] rounded-xl font-bold text-base transition-all ";
                            if (isChecked) {
                              if (optIndex === correctOpt) {
                                btnClass += "bg-[var(--neo-green)] text-black font-black shadow-[4px_4px_0px_0px_#000]";
                              } else if (optIndex === selectedOpt) {
                                btnClass += "bg-[var(--neo-pink)] text-black font-bold shadow-[2px_2px_0px_0px_#000] opacity-90";
                              } else {
                                btnClass += "bg-gray-100 text-gray-400 border-gray-300 shadow-none opacity-40";
                              }
                            } else {
                              if (selectedOpt === optIndex) {
                                btnClass += "bg-[var(--neo-blue)] text-black font-black shadow-[2px_2px_0px_0px_#000] translate-x-[2px] translate-y-[2px]";
                              } else {
                                btnClass += "bg-white hover:bg-[var(--neo-yellow)] text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer";
                              }
                            }

                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleSelect(task.id, optIndex)}
                                disabled={isChecked}
                                className={btnClass}
                              >
                                <MixedMathText text={opt} />
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-8 flex flex-col items-start gap-4">
                          <button
                            onClick={() => handleCheck(task.id)}
                            disabled={checkedTasks[task.id] || selectedAnswers[task.id] === undefined}
                            className={`px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all border-2.5 border-[var(--border-dark)] ${
                              checkedTasks[task.id] || selectedAnswers[task.id] === undefined
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50 shadow-none'
                                : 'bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer'
                            }`}
                          >
                            {checkedTasks[task.id] ? "Sprawdzono ✓" : "Sprawdź odpowiedź &rarr;"}
                          </button>

                          {checkedTasks[task.id] && (
                            <div className={`mt-4 p-5 w-full rounded-xl border-2.5 border-[var(--border-dark)] shadow-[4px_4px_0px_0px_#000] ${
                              selectedAnswers[task.id] === contentObj.correct_index ? 'bg-[var(--success-bg)]' : 'bg-[var(--error-bg)]'
                            }`}>
                              <p className="font-black text-lg text-black">
                                {selectedAnswers[task.id] === contentObj.correct_index
                                  ? "✓ Poprawna odpowiedź! Brawo."
                                  : "✕ Niestety, to nie jest poprawna odpowiedź."}
                              </p>

                              {task.exemplary_solution && (
                                <div className="mt-4 pt-4 border-t-2 border-[var(--border-dark)] text-[var(--text-main)]">
                                  <h4 className="font-black text-xs uppercase tracking-wider mb-2">Wyjaśnienie krok po kroku:</h4>
                                  <div className="text-base bg-white p-4 rounded-xl border-2 border-[var(--border-dark)] shadow-[2px_2px_0px_0px_#000] font-medium">
                                    <MixedMathText text={task.exemplary_solution} />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] italic font-medium">Brak zadań w tej grupie.</p>
          )}
        </div>
      </div>
      <Footer />
      <Scratchpad />
    </div>
  );
}
