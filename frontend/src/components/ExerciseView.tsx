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

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

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

  const handleSelect = (taskId: string, optionIndex: number) => {
    if (checkedTasks[taskId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [taskId]: optionIndex }));
  };

  const handleCheck = (taskId: string) => {
    setCheckedTasks((prev) => ({ ...prev, [taskId]: true }));
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
            <div className="space-y-8">
              {taskGroup.tasks.map((task: any, index: number) => {
                let contentObj: any = {};
                try {
                  contentObj = typeof task.content === 'string' ? JSON.parse(task.content) : task.content;
                } catch (e) {
                  contentObj = { question: task.content };
                }

                const isChecked = checkedTasks[task.id];
                const selectedOpt = selectedAnswers[task.id];
                const correctOpt = contentObj.correct_index;

                return (
                  <div key={task.id} className="p-6 border-2.5 border-[var(--border-dark)] rounded-xl bg-white shadow-[6px_6px_0px_0px_#000]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        Zadanie {index + 1}
                      </span>
                    </div>

                    <div className="text-lg font-semibold text-[var(--text-main)] mb-6 leading-relaxed">
                      <MixedMathText text={contentObj.question || ''} />
                    </div>

                    {contentObj.options && Array.isArray(contentObj.options) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {contentObj.options.map((opt: string, optIndex: number) => {
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
                    )}

                    {contentObj.options && (
                      <div className="mt-8 flex flex-col items-start gap-4">
                        <button
                          onClick={() => handleCheck(task.id)}
                          disabled={isChecked || selectedOpt === undefined}
                          className={`px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all border-2.5 border-[var(--border-dark)] ${
                            isChecked || selectedOpt === undefined
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50 shadow-none'
                              : 'bg-[var(--neo-yellow)] hover:bg-[#fde047] text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer'
                          }`}
                        >
                          {isChecked ? "Sprawdzono ✓" : "Sprawdź odpowiedź &rarr;"}
                        </button>

                        {isChecked && (
                          <div className={`mt-4 p-5 w-full rounded-xl border-2.5 border-[var(--border-dark)] shadow-[4px_4px_0px_0px_#000] ${
                            selectedOpt === correctOpt ? 'bg-[var(--success-bg)]' : 'bg-[var(--error-bg)]'
                          }`}>
                            <p className="font-black text-lg text-black">
                              {selectedOpt === correctOpt ? "✓ Poprawna odpowiedź! Brawo." : "✕ Niestety, to nie jest poprawna odpowiedź."}
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
