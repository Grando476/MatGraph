"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";
import 'katex/dist/katex.min.css';
import MixedMathText from "@/components/MixedMathText";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Scratchpad from "@/components/Scratchpad";
import { getApiUrl, getAuthToken } from "@/utils/auth";

interface ExerciseViewProps {
  exerciseId: string;
}

type ViewMode = "LOBBY" | "PRACTICE" | "EXAM" | "EXAM_RESULT";

export default function ExerciseView({ exerciseId }: ExerciseViewProps) {
  const router = useRouter();

  // Core Data
  const [taskGroup, setTaskGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // App Mode
  const [viewMode, setViewMode] = useState<ViewMode>("LOBBY");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [showHistory, setShowHistory] = useState(false);

  // Practice State
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceSelectedMcq, setPracticeSelectedMcq] = useState<number | undefined>(undefined);
  const [practiceCheckedMcq, setPracticeCheckedMcq] = useState(false);
  const [practiceTfAnswers, setPracticeTfAnswers] = useState<Record<string | number, boolean>>({});
  const [practiceTfResult, setPracticeTfResult] = useState<any>(null);
  const [practiceTfVerifying, setPracticeTfVerifying] = useState(false);
  const [practiceOpenAnswer, setPracticeOpenAnswer] = useState("");
  const [practiceOpenResult, setPracticeOpenResult] = useState<any>(null);
  const [practiceOpenVerifying, setPracticeOpenVerifying] = useState(false);

  // Exam State
  const [examTasks, setExamTasks] = useState<any[]>([]);
  const [examIndex, setExamIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, any>>({});
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const userToken = await getAuthToken();
      setToken(userToken);

      const headers: Record<string, string> = {};
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`;
      }

      const res = await fetch(`${getApiUrl()}/api/v1/exercises/${exerciseId}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error("Nie udało się pobrać zadań");
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
  }, [exerciseId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);


  // Handle browser back / navigation
  const handleBack = () => {
    if (viewMode !== "LOBBY") {
      setViewMode("LOBBY");
      return;
    }

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const from = urlParams.get("from");
      if (from) {
        router.push(from);
        return;
      }
      if (window.history.length > 1) {
        router.back();
        return;
      }
    }
    router.push("/graph");
  };

  // Helper to parse content
  const parseTaskContent = (task: any) => {
    let contentObj: any = {};
    try {
      contentObj = typeof task.content === "string" ? JSON.parse(task.content) : task.content;
    } catch {
      contentObj = { question: task.content };
    }
    const taskType = task.task_type || (contentObj.statements ? "TRUE_FALSE" : contentObj.options ? "MCQ" : "OPEN");
    const isTrueFalse = taskType === "TRUE_FALSE" || (contentObj.statements && Array.isArray(contentObj.statements));
    const isOpen = taskType === "OPEN" || (!isTrueFalse && contentObj.correct_answer !== undefined);
    const isMcq = !isTrueFalse && !isOpen;
    return { contentObj, taskType, isTrueFalse, isOpen, isMcq };
  };

  // Count tasks per difficulty level
  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: taskGroup?.tasks?.length || 0,
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };
    if (taskGroup?.tasks) {
      for (const t of taskGroup.tasks) {
        const level = (t.difficulty_level || "Medium").toLowerCase();
        if (level === "easy") counts.Easy += 1;
        else if (level === "hard") counts.Hard += 1;
        else counts.Medium += 1;
      }
    }
    return counts;
  }, [taskGroup]);

  // Filtered tasks for Practice Mode
  const filteredPracticeTasks = useMemo(() => {
    if (!taskGroup?.tasks) return [];
    if (selectedDifficulty === "ALL") return taskGroup.tasks;
    return taskGroup.tasks.filter(
      (t: any) => (t.difficulty_level || "Medium").toLowerCase() === selectedDifficulty.toLowerCase()
    );
  }, [taskGroup, selectedDifficulty]);

  // Reset practice question state
  const resetPracticeQuestionState = () => {
    setPracticeSelectedMcq(undefined);
    setPracticeCheckedMcq(false);
    setPracticeTfAnswers({});
    setPracticeTfResult(null);
    setPracticeTfVerifying(false);
    setPracticeOpenAnswer("");
    setPracticeOpenResult(null);
    setPracticeOpenVerifying(false);
  };

  // Start Practice Mode
  const startPractice = (diff: string = "ALL") => {
    const validDiff = (difficultyCounts[diff] ?? 0) > 0 ? diff : "ALL";
    setSelectedDifficulty(validDiff);
    setPracticeIndex(0);
    resetPracticeQuestionState();
    setViewMode("PRACTICE");
  };

  const switchPracticeDifficulty = (diff: string) => {
    if ((difficultyCounts[diff] ?? 0) === 0) return;
    setSelectedDifficulty(diff);
    setPracticeIndex(0);
    resetPracticeQuestionState();
  };

  // Start Exam Mode
  const startExam = () => {
    if (!token) {
      router.push(`/login?redirect=/exercise/${exerciseId}`);
      return;
    }
    if (!taskGroup?.tasks || taskGroup.tasks.length === 0) return;

    // Shuffle and sample up to 10 questions
    const shuffled = [...taskGroup.tasks].sort(() => 0.5 - Math.random());
    const sample = shuffled.slice(0, 10);

    setExamTasks(sample);
    setExamIndex(0);
    setExamAnswers({});
    setExamResult(null);
    setViewMode("EXAM");
  };


  // Practice Handlers
  const handlePracticeMcqSelect = (optIndex: number) => {
    if (practiceCheckedMcq) return;
    setPracticeSelectedMcq(optIndex);
  };

  const handlePracticeTfSelect = (stmtId: string | number, val: boolean) => {
    if (practiceTfResult) return;
    setPracticeTfAnswers((prev) => ({ ...prev, [stmtId]: val }));
  };

  const handlePracticeTfCheck = async (taskId: string) => {
    if (practiceTfVerifying || practiceTfResult) return;
    setPracticeTfVerifying(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/exercises/${taskId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, answers: practiceTfAnswers }),
      });
      const data = await res.json();
      setPracticeTfResult(data);
    } catch {
      alert("Wystąpił błąd podczas weryfikacji.");
    } finally {
      setPracticeTfVerifying(false);
    }
  };

  const handlePracticeOpenCheck = async (taskId: string) => {
    if (practiceOpenVerifying || practiceOpenResult) return;
    setPracticeOpenVerifying(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/exercises/${taskId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          answers: { user_answer: practiceOpenAnswer.trim() },
        }),
      });
      const data = await res.json();
      setPracticeOpenResult(data);
    } catch {
      alert("Wystąpił błąd podczas weryfikacji.");
    } finally {
      setPracticeOpenVerifying(false);
    }
  };

  const nextPracticeQuestion = () => {
    if (filteredPracticeTasks.length === 0) return;
    if (practiceIndex < filteredPracticeTasks.length - 1) {
      setPracticeIndex((prev) => prev + 1);
      resetPracticeQuestionState();
    } else {
      // Loop or return
      setPracticeIndex(0);
      resetPracticeQuestionState();
    }
  };

  // Exam Answer Handlers
  const setExamAnswerForTask = (taskId: string, answerPayload: any) => {
    setExamAnswers((prev) => ({
      ...prev,
      [taskId]: answerPayload,
    }));
  };

  // Exam Submit
  const handleExamSubmit = async () => {
    const totalQuestions = examTasks.length;
    const answeredCount = Object.keys(examAnswers).length;

    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `Odpowiedziałeś tylko na ${answeredCount} z ${totalQuestions} pytań. Pozostałe zostaną uznane za błędne. Czy na pewno chcesz zakończyć egzamin?`
      );
      if (!confirmSubmit) return;
    }

    setExamSubmitting(true);
    try {
      const userToken = token || (await getAuthToken());
      if (!userToken) {
        alert("Musisz być zalogowany, aby Twój wynik egzaminu został zapisany!");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`;
      }

      // Prepare answers payload
      const payloadAnswers: Record<string, any> = {};
      examTasks.forEach((t) => {
        payloadAnswers[t.id] = examAnswers[t.id] ?? null;
      });

      const res = await fetch(`${getApiUrl()}/api/v1/exercises/${exerciseId}/submit-test`, {
        method: "POST",
        headers,
        body: JSON.stringify({ answers: payloadAnswers }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Błąd zapisu egzaminu.");
      }

      setExamResult(data);
      setViewMode("EXAM_RESULT");

      // Refresh task group stats in background
      fetchTasks();
    } catch (err: any) {
      alert(`Błąd: ${err.message}`);
    } finally {
      setExamSubmitting(false);
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
            onClick={handleBack}
            className="inline-flex items-center gap-2 bg-[var(--neo-yellow)] text-black font-black text-xs uppercase px-5 py-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
          >
            &larr; Wróć
          </button>
        </div>
      </div>
    );
  }

  const totalTasksInGroup = taskGroup.total_tasks || (taskGroup.tasks?.length ?? 0);
  const examPoolSize = Math.min(10, totalTasksInGroup);
  const passRequirementText = examPoolSize >= 10 ? "8 z 10 zadań" : `${Math.ceil(examPoolSize * 0.8)} z ${examPoolSize} zadań`;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b-2.5 border-[var(--border-dark)] bg-[var(--bg-card)] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" href="/graph" />
            <span className="hidden sm:inline-block bg-[var(--neo-green)] text-black border-2 border-black rounded-md px-2.5 py-0.5 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
              {viewMode === "LOBBY" && "Panel Grupy Zadań"}
              {viewMode === "PRACTICE" && "Ćwicz"}
              {viewMode === "EXAM" && "Zaliczenie"}
              {viewMode === "EXAM_RESULT" && "Wynik Zaliczenia"}
            </span>

          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-white hover:bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl border-2 border-[var(--border-dark)] shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer group"
          >
            <span className="text-base transition-transform duration-200 group-hover:-translate-x-1">&larr;</span>
            <span>{viewMode === "LOBBY" ? "Wróć do mapy" : "Zmień tryb"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 sm:p-8 flex-1">
        <div className="max-w-4xl mx-auto">

          {/* ========================================================================= */}
          {/* 1. LOBBY SCREEN                                                           */}
          {/* ========================================================================= */}
          {viewMode === "LOBBY" && (
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
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 font-black text-xs px-3 py-1.5 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] uppercase">
                      Nowa (brak prób)
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black mb-3 text-[var(--text-main)] tracking-tight">
                  {taskGroup.task_group_name}
                </h1>
                <p className="text-sm font-semibold text-gray-600 mb-6">
                  W tej grupie znajduje się <strong className="text-black">{totalTasksInGroup}</strong> zadań o różnych poziomach trudności.
                </p>

                {/* History & Statistics Pills */}
                {taskGroup.attempts_count > 0 && (
                  <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#000] mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold uppercase text-gray-600">Statystyki:</span>
                        <span className="bg-gray-100 border border-black px-2.5 py-1 rounded text-xs font-black">
                          Łącznie podejść: {taskGroup.attempts_count}
                        </span>
                        <span className="bg-red-50 text-red-800 border border-red-500 px-2.5 py-1 rounded text-xs font-black">
                          Nieudane: {taskGroup.failed_attempts_count}
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
                      Rozwiązuj zadania pojedynczo z natychmiastowym sprawdzaniem. Wyniki nie są zapisywane w historii.
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
                    onClick={() => startPractice(selectedDifficulty)}
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
                      Test z losowych zadań z grupy. Wymagane min. 80% do zaliczenia. Każde podejście jest rejestrowane.
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
                  ) : (
                    <button
                      onClick={startExam}
                      className="w-full py-3.5 bg-[var(--neo-green)] hover:bg-[#86efac] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer text-center"
                    >
                      Rozpocznij zaliczenie ({examPoolSize} pytań)
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}


          {/* ========================================================================= */}
          {/* 2. PRACTICE MODE (SINGLE QUESTION STEP-BY-STEP, NO DB SAVING)            */}
          {/* ========================================================================= */}
          {viewMode === "PRACTICE" && (
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
                            {task.difficulty_level || "Medium"}
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
                                      onClick={() => handlePracticeTfSelect(stmt.id, true)}
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
                                      onClick={() => handlePracticeTfSelect(stmt.id, false)}
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
                              onClick={() => handlePracticeTfCheck(task.id)}
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
                                onClick={() => handlePracticeOpenCheck(task.id)}
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
                                  onClick={() => handlePracticeMcqSelect(optIdx)}
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
                              onClick={() => setPracticeCheckedMcq(true)}
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
          )}

          {/* ========================================================================= */}
          {/* 3. EXAM MODE (10 QUESTIONS, PROGRESS BAR, SUBMIT AT END)                  */}
          {/* ========================================================================= */}
          {viewMode === "EXAM" && (
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
                        Trudność: {task.difficulty_level || "Medium"}
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
                        onClick={() => setExamIndex((prev) => Math.max(0, prev - 1))}
                        disabled={examIndex === 0}
                        className="px-4 py-2.5 bg-white disabled:opacity-40 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] disabled:cursor-not-allowed"
                      >
                        &larr; Poprzednie
                      </button>

                      {examIndex < examTasks.length - 1 ? (
                        <button
                          onClick={() => setExamIndex((prev) => prev + 1)}
                          className="px-5 py-2.5 bg-[var(--neo-yellow)] border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#fde047]"
                        >
                          Następne &rarr;
                        </button>
                      ) : (
                        <button
                          onClick={handleExamSubmit}
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
                  onClick={handleExamSubmit}
                  disabled={examSubmitting}
                  className="px-6 py-3 bg-[var(--neo-green)] hover:bg-[#86efac] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
                >
                  {examSubmitting ? "Sprawdzanie wyników..." : `Zakończ egzamin (${Object.keys(examAnswers).length}/${examTasks.length} wypełnione)`}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. EXAM RESULT VIEW                                                       */}
          {/* ========================================================================= */}
          {viewMode === "EXAM_RESULT" && examResult && (
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
                  onClick={startExam}
                  className="px-6 py-3.5 bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  Spróbuj ponownie (nowe pytania)
                </button>
                <button
                  onClick={() => startPractice("ALL")}
                  className="px-6 py-3.5 bg-[var(--neo-blue)] hover:bg-[#60a5fa] text-black font-black uppercase text-xs rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  Przejdź do ćwiczeń
                </button>
                <button
                  onClick={handleBack}
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

                        {/* Exemplary solution if wrong or available */}
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
          )}

        </div>
      </main>

      <Footer />
      <Scratchpad />
    </div>
  );
}
