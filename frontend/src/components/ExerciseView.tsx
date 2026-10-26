"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import "katex/dist/katex.min.css";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Scratchpad from "@/components/Scratchpad";
import { getApiUrl, getAuthToken, getCurrentUser, UserProfile } from "@/utils/auth";
import { ViewMode } from "./exercise/types";
import ExerciseLobby from "./exercise/ExerciseLobby";
import ExercisePractice from "./exercise/ExercisePractice";
import ExerciseExam from "./exercise/ExerciseExam";
import ExerciseExamResult from "./exercise/ExerciseExamResult";

interface ExerciseViewProps {
  exerciseId: string;
}

const getExamStorageKey = (exId: string, uId?: string | null) => {
  return `matgraph_exam_${exId}_${uId || "guest"}`;
};

export default function ExerciseView({ exerciseId }: ExerciseViewProps) {
  const router = useRouter();

  // Core Data
  const [taskGroup, setTaskGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [adminPassing, setAdminPassing] = useState(false);

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
  const [cachedExam, setCachedExam] = useState<{
    examTasks: any[];
    examAnswers: Record<string, any>;
    examIndex: number;
    updatedAt?: number;
  } | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const [u, userToken] = await Promise.all([getCurrentUser(), getAuthToken()]);
      setCurrentUser(u);
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

  // Load cached exam if exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageKey = getExamStorageKey(exerciseId, currentUser?.id);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.examTasks && Array.isArray(parsed.examTasks) && parsed.examTasks.length > 0) {
            setCachedExam(parsed);
            return;
          }
        } catch (e) {
          console.error("Błąd odczytu zapisanego egzaminu:", e);
        }
      }
      setCachedExam(null);
    }
  }, [exerciseId, currentUser]);

  // Auto-save exam progress to localStorage
  useEffect(() => {
    if (viewMode === "EXAM" && examTasks.length > 0 && typeof window !== "undefined") {
      const storageKey = getExamStorageKey(exerciseId, currentUser?.id);
      const stateToSave = {
        examTasks,
        examAnswers,
        examIndex,
        updatedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      setCachedExam(stateToSave);
    }
  }, [viewMode, examTasks, examAnswers, examIndex, exerciseId, currentUser]);

  // Before unload warning during exam
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (viewMode === "EXAM" && examTasks.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [viewMode, examTasks]);

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

  // Resume Exam Mode from cached state
  const resumeExam = () => {
    if (!cachedExam || !cachedExam.examTasks || cachedExam.examTasks.length === 0) return;
    setExamTasks(cachedExam.examTasks);
    setExamIndex(cachedExam.examIndex || 0);
    setExamAnswers(cachedExam.examAnswers || {});
    setExamResult(null);
    setViewMode("EXAM");
  };

  // Start Exam Mode
  const startExam = () => {
    if (!token) {
      router.push(`/login?redirect=/exercise/${exerciseId}`);
      return;
    }
    if (cachedExam) {
      resumeExam();
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

    // Immediately cache the newly generated exam
    if (typeof window !== "undefined") {
      const storageKey = getExamStorageKey(exerciseId, currentUser?.id);
      const stateToSave = {
        examTasks: sample,
        examAnswers: {},
        examIndex: 0,
        updatedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      setCachedExam(stateToSave);
    }
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

      if (typeof window !== "undefined") {
        const storageKey = getExamStorageKey(exerciseId, currentUser?.id);
        localStorage.removeItem(storageKey);
        setCachedExam(null);
      }

      fetchTasks();
    } catch (err: any) {
      alert(`Błąd: ${err.message}`);
    } finally {
      setExamSubmitting(false);
    }
  };

  // Admin Quick Pass (100% pass instantly)
  const handleAdminQuickPass = async () => {
    const userToken = token || (await getAuthToken());
    if (!userToken) {
      alert("Musisz być zalogowany jako administrator.");
      return;
    }
    setAdminPassing(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/exercises/${exerciseId}/admin-quick-pass`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Błąd szybkiego zaliczenia");
      }
      if (typeof window !== "undefined") {
        const storageKey = getExamStorageKey(exerciseId, currentUser?.id);
        localStorage.removeItem(storageKey);
        setCachedExam(null);
      }
      await fetchTasks();
      setViewMode("LOBBY");
    } catch (err: any) {
      alert(`Błąd: ${err.message}`);
    } finally {
      setAdminPassing(false);
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
          {viewMode === "LOBBY" && (
            <ExerciseLobby
              taskGroup={taskGroup}
              token={token}
              totalTasksInGroup={totalTasksInGroup}
              examPoolSize={examPoolSize}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              difficultyCounts={difficultyCounts}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
              onStartPractice={startPractice}
              onStartExam={startExam}
              exerciseId={exerciseId}
              cachedExam={cachedExam}
              onResumeExam={resumeExam}
              currentUser={currentUser}
              adminPassing={adminPassing}
              onAdminQuickPass={handleAdminQuickPass}
            />
          )}

          {viewMode === "PRACTICE" && (
            <ExercisePractice
              filteredPracticeTasks={filteredPracticeTasks}
              practiceIndex={practiceIndex}
              setPracticeIndex={setPracticeIndex}
              selectedDifficulty={selectedDifficulty}
              difficultyCounts={difficultyCounts}
              switchPracticeDifficulty={switchPracticeDifficulty}
              resetPracticeQuestionState={resetPracticeQuestionState}
              practiceSelectedMcq={practiceSelectedMcq}
              practiceCheckedMcq={practiceCheckedMcq}
              onSelectMcq={handlePracticeMcqSelect}
              onCheckMcq={() => setPracticeCheckedMcq(true)}
              practiceTfAnswers={practiceTfAnswers}
              practiceTfResult={practiceTfResult}
              practiceTfVerifying={practiceTfVerifying}
              onSelectTf={handlePracticeTfSelect}
              onCheckTf={handlePracticeTfCheck}
              practiceOpenAnswer={practiceOpenAnswer}
              setPracticeOpenAnswer={setPracticeOpenAnswer}
              practiceOpenResult={practiceOpenResult}
              practiceOpenVerifying={practiceOpenVerifying}
              onCheckOpen={handlePracticeOpenCheck}
              nextPracticeQuestion={nextPracticeQuestion}
            />
          )}

          {viewMode === "EXAM" && (
            <ExerciseExam
              examTasks={examTasks}
              examIndex={examIndex}
              setExamIndex={setExamIndex}
              examAnswers={examAnswers}
              setExamAnswerForTask={setExamAnswerForTask}
              examSubmitting={examSubmitting}
              onExamSubmit={handleExamSubmit}
              currentUser={currentUser}
              adminPassing={adminPassing}
              onAdminQuickPass={handleAdminQuickPass}
            />
          )}

          {viewMode === "EXAM_RESULT" && examResult && (
            <ExerciseExamResult
              examResult={examResult}
              examTasks={examTasks}
              onRetryExam={startExam}
              onStartPractice={startPractice}
              onBack={handleBack}
            />
          )}
        </div>
      </main>

      <Footer />
      <Scratchpad />
    </div>
  );
}
