"use client";

import Link from "next/link";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// A helper component to parse strings like "Oblicz wartość wyrażenia $\\sqrt[4]{81}$."
const MixedMathText = ({ text }: { text: string }) => {
  if (!text || typeof text !== 'string') return null;

  if (!text.includes('$')) {
    return <span>{text}</span>;
  }

  // Normalize $$ to $ so we can easily split and render everything as InlineMath
  const normalizedText = text.replace(/\$\$/g, '$');
  const parts = normalizedText.split('$');

  return (
    <span>
      {parts.map((part, index) => {
        if (part === '') return null;
        if (index % 2 === 1) { // Odd indices are the math content
          return <InlineMath key={index} math={part} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default function ExercisePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [taskGroup, setTaskGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/exercises/${params.id}`);
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
  }, [params.id]);

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
    <div className="min-h-screen bg-dark-bg text-text-main p-8">
      <div className="max-w-3xl mx-auto bg-card-bg border border-border-dark p-8 rounded-lg shadow-xl text-text-main">
        <button onClick={() => router.back()} className="text-accent-main hover:text-accent-hover transition-colors mb-6 inline-block">
          &larr; Wróć do Lekcji
        </button>
        <h1 className="text-3xl font-bold mb-6 text-text-main">{taskGroup.task_group_name}</h1>

        {taskGroup.tasks && taskGroup.tasks.length > 0 ? (
          <div className="space-y-8">
            {taskGroup.tasks.map((task: any, index: number) => {
              // Parse the content if it's a JSON string
              let contentObj: any = {};
              try {
                contentObj = typeof task.content === 'string' ? JSON.parse(task.content) : task.content;
              } catch (e) {
                // If it's not JSON, fallback to treating it as a raw string
                contentObj = { question: task.content };
              }

              return (
                <div key={task.id} className="p-6 border border-border-subtle rounded-lg bg-surface-bg shadow-md">
                  <h3 className="font-semibold text-lg text-text-subtle mb-4">
                    Zadanie {index + 1}
                  </h3>

                  <div className="text-lg text-text-main mb-6">
                    <MixedMathText text={contentObj.question || ''} />
                  </div>

                  {/* The Options (if available) */}
                  {contentObj.options && Array.isArray(contentObj.options) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {contentObj.options.map((opt: string, optIndex: number) => {
                        let btnClass = "p-4 text-center border rounded-md transition-all text-lg ";
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
                        className={`px-8 py-3 rounded-md font-bold text-white transition-all ${isChecked || selectedOpt === undefined
                            ? 'bg-disabled-bg cursor-not-allowed opacity-50'
                            : 'bg-accent-hover hover:bg-accent-dark shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:shadow-[0_0_20px_rgba(14,165,233,0.6)]'
                          }`}
                      >
                        {isChecked ? "Sprawdzono" : "Sprawdź odpowiedź"}
                      </button>

                      {isChecked && (
                        <div className={`mt-4 p-5 w-full rounded-md border ${selectedOpt === correctOpt ? 'bg-success-bg/30 border-success-border' : 'bg-error-bg/30 border-error-border'}`}>
                          <p className={`font-bold text-lg mb-2 ${selectedOpt === correctOpt ? 'text-success-highlight' : 'text-error-highlight'}`}>
                            {selectedOpt === correctOpt ? "✨ Świetnie! Poprawna odpowiedź." : "❌ Niestety, to nie jest poprawna odpowiedź."}
                          </p>

                          {task.exemplary_solution && (
                            <div className="mt-5 pt-5 border-t border-border-subtle text-text-main">
                              <h4 className="font-semibold text-accent-main mb-3">Wyjaśnienie:</h4>
                              <div className="text-lg bg-deep-bg p-4 rounded-md border border-surface-bg">
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
  );
}
