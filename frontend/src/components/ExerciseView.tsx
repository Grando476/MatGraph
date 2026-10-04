"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import 'katex/dist/katex.min.css';
import MixedMathText from "@/components/MixedMathText";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

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
    setSelectedAnswers(prev => ({ ...prev, [taskId]: optionIndex }));
  };

  const handleCheck = (taskId: string) => {
    setCheckedTasks(prev => ({ ...prev, [taskId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-text-main p-8 flex justify-center items-center">
        <p className="text-xl">Ładowanie zadań...</p>
      </div>
    );
  }

  if (error || !taskGroup) {
    return (
      <div className="min-h-screen bg-dark-bg text-text-main p-8 flex flex-col justify-center items-center">
        <p className="text-xl text-red-500 mb-4">Błąd: {error || "Nie znaleziono zadań"}</p>
        <button onClick={() => router.back()} className="text-accent-main hover:text-accent-hover transition-colors">
          &larr; Wróć
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-text-main flex flex-col justify-between">
      {/* Header with enlarged Logo */}
      <header className="border-b border-[var(--border-dark)] bg-[var(--bg-dark)]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <Logo size="md" href="/graph" />
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--text-subtle)] hover:text-[var(--accent-main)] transition-colors group cursor-pointer"
          >
            <span className="text-lg transition-transform duration-200 group-hover:-translate-x-1.5">&larr;</span>
            <span>Wróć</span>
          </button>
        </div>
      </header>

      <div className="p-8 flex-1">
        <div className="max-w-3xl mx-auto bg-[var(--bg-card)] border border-[var(--border-dark)] p-8 rounded-2xl shadow-xl text-[var(--text-main)]">
          <h1 className="text-3xl font-bold mb-6 text-[var(--text-main)]">{taskGroup.task_group_name}</h1>

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
                  <div key={task.id} className="p-6 border border-border-subtle rounded-xl bg-surface-bg shadow-md">
                    <h3 className="font-semibold text-lg text-text-subtle mb-4">
                      Zadanie {index + 1}
                    </h3>

                    <div className="text-lg text-text-main mb-6">
                      <MixedMathText text={contentObj.question || ''} />
                    </div>

                    {contentObj.options && Array.isArray(contentObj.options) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {contentObj.options.map((opt: string, optIndex: number) => {
                          let btnClass = "p-4 text-center border rounded-lg transition-all text-lg ";
                          if (isChecked) {
                            if (optIndex === correctOpt) {
                              btnClass += "bg-success-bg border-success-border text-success-text font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]";
                            } else if (optIndex === selectedOpt) {
                              btnClass += "bg-error-bg border-error-border text-error-text opacity-80";
                            } else {
                              btnClass += "bg-deep-bg border-border-subtle text-text-dim opacity-50";
                            }
                          } else {
                            if (selectedOpt === optIndex) {
                              btnClass += "bg-selected-bg border-accent-hover text-selected-text shadow-[0_0_10px_rgba(14,165,233,0.3)]";
                            } else {
                              btnClass += "bg-card-bg border-border-subtle text-text-subtle hover:bg-card-hover hover:border-accent-hover";
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
                          className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${isChecked || selectedOpt === undefined
                              ? 'bg-disabled-bg cursor-not-allowed opacity-50'
                              : 'bg-accent-hover hover:bg-accent-dark shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:shadow-[0_0_20px_rgba(14,165,233,0.6)]'
                            }`}
                        >
                          {isChecked ? "Sprawdzono" : "Sprawdź odpowiedź"}
                        </button>

                        {isChecked && (
                          <div className={`mt-4 p-5 w-full rounded-lg border ${selectedOpt === correctOpt ? 'bg-success-bg/30 border-success-border' : 'bg-error-bg/30 border-error-border'}`}>
                            <p className={`font-bold text-lg mb-2 ${selectedOpt === correctOpt ? 'text-success-highlight' : 'text-error-highlight'}`}>
                              {selectedOpt === correctOpt ? "Poprawna odpowiedź." : "Niestety, to nie jest poprawna odpowiedź."}
                            </p>

                            {task.exemplary_solution && (
                              <div className="mt-5 pt-5 border-t border-border-subtle text-text-main">
                                <h4 className="font-semibold text-accent-main mb-3">Wyjaśnienie:</h4>
                                <div className="text-lg bg-deep-bg p-4 rounded-lg border border-surface-bg">
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
            <p className="text-text-muted italic">Brak zadań w tej grupie.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
