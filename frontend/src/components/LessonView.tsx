"use client";

import Link from "next/link";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

interface LessonViewProps {
  lessonId: string;
}

export default function LessonView({ lessonId }: LessonViewProps) {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/lessons/${lessonId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch lesson");
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setLesson(data.lesson);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-text-main p-8 flex justify-center items-center">
        <p className="text-xl">Ładowanie lekcji...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-dark-bg text-text-main p-8 flex flex-col justify-center items-center">
        <p className="text-xl text-red-500 mb-4">Błąd: {error || "Nie znaleziono lekcji"}</p>
        <Link href="/graph" className="text-accent-main hover:text-accent-hover transition-colors">
          &larr; Wróć do Mapy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-text-main flex flex-col justify-between">
      {/* Header with enlarged Logo */}
      <header className="border-b border-[var(--border-dark)] bg-[var(--bg-dark)]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="lg" showSubtitle />
          <Link
            href="/graph"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-[var(--border-dark)] text-[var(--text-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-main)] hover:border-[var(--accent-main)] transition-all shadow-sm"
          >
            &larr; Wróć do Mapy
          </Link>
        </div>
      </header>

      <div className="p-8 flex-1">
        <div className="max-w-3xl mx-auto bg-[var(--bg-card)] border border-[var(--border-dark)] p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-[var(--text-main)]">{lesson.title}</h1>
          
          {lesson.video_url && (
            <div className="aspect-video bg-[var(--bg-surface)] border border-[var(--border-dark)] mb-6 flex items-center justify-center overflow-hidden">
              <iframe 
                src={lesson.video_url} 
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          )}

          <div className="prose max-w-none text-[var(--text-main)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-subtle)]">Treść lekcji</h2>
            <div className="my-4 p-6 bg-[var(--bg-surface)] border border-[var(--border-dark)] text-center overflow-x-auto text-[var(--text-main)] shadow-inner">
               {lesson.content_tex ? (
                   <BlockMath math={lesson.content_tex} />
               ) : (
                   <p className="text-[var(--text-muted)] italic">Brak treści.</p>
               )}
            </div>
          </div>

          {lesson.task_groups && lesson.task_groups.length > 0 && (
            <div className="mt-12 border-t border-[var(--border-dark)] pt-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--node-green)] shadow-[0_0_8px_var(--node-green)] inline-block" />
                <h2 className="text-2xl font-bold text-[var(--text-main)]">Grupy zadań</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.task_groups.map((group: any) => (
                  <Link 
                    key={group.id} 
                    href={`/exercise/${group.id}`}
                    className="block p-5 border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-md hover:border-[var(--accent-main)] hover:bg-[var(--bg-card-hover)] transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg text-[var(--text-main)] group-hover:text-[var(--accent-main)] transition-colors">{group.name}</h3>
                      <span className="text-[var(--node-green)] group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs mt-2 group-hover:text-[var(--text-subtle)]">Przejdź do zadań</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
