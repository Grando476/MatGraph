"use client";

import Link from "next/link";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Scratchpad from "@/components/Scratchpad";

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
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-8 flex justify-center items-center">
        <div className="bg-white border-3 border-[var(--border-dark)] p-8 rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center">
          <div className="w-10 h-10 border-3 border-black border-t-[var(--neo-yellow)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base font-black uppercase tracking-wider">Ładowanie lekcji...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-8 flex flex-col justify-center items-center">
        <div className="bg-white border-3 border-[var(--border-dark)] p-8 rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center max-w-md">
          <p className="text-base font-black text-red-600 mb-4 uppercase">Błąd: {error || "Nie znaleziono lekcji"}</p>
          <Link
            href="/graph"
            className="inline-flex items-center gap-2 bg-[var(--neo-yellow)] text-black font-black text-xs uppercase px-5 py-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            &larr; Wróć do Mapy
          </Link>
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
            <span className="hidden sm:inline-block bg-[var(--neo-yellow)] text-black border-2 border-black rounded-md px-2.5 py-0.5 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
              Lekcja Teoretyczna
            </span>
          </div>
          <Link
            href="/graph"
            className="flex items-center gap-2 bg-white hover:bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl border-2 border-[var(--border-dark)] shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer group"
          >
            <span className="text-base transition-transform duration-200 group-hover:-translate-x-1">&larr;</span>
            <span>Wróć do Mapy</span>
          </Link>
        </div>
      </header>

      <div className="p-6 sm:p-10 flex-1">
        <div className="max-w-3xl mx-auto bg-[var(--bg-card)] border-3 border-[var(--border-dark)] p-6 sm:p-10 rounded-2xl shadow-[8px_8px_0px_0px_#000]">
          
          {/* Importance / Category Tag */}
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[var(--neo-blue)] text-black font-extrabold text-xs px-3 py-1 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] uppercase">
              ★ Zagadnienie
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-6 text-[var(--text-main)] tracking-tight">
            {lesson.title}
          </h1>

          {lesson.video_url && (
            <div className="aspect-video bg-[var(--bg-surface)] border-2.5 border-[var(--border-dark)] mb-8 flex items-center justify-center rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
              <iframe
                src={lesson.video_url}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          <div>
            <div className="inline-block bg-[var(--neo-yellow)] px-3 py-1 border-2 border-black rounded-md font-black text-xs uppercase tracking-wider mb-4 shadow-[2px_2px_0px_0px_#000]">
              Treść lekcji
            </div>
            <div className="p-6 bg-[var(--bg-deep)] border-2.5 border-[var(--border-dark)] rounded-xl text-center overflow-x-auto text-[var(--text-main)] shadow-[4px_4px_0px_0px_#000] font-medium">
              {lesson.content_tex ? (
                <BlockMath math={lesson.content_tex} />
              ) : (
                <p className="text-[var(--text-muted)] italic font-medium">Brak treści teoretycznej.</p>
              )}
            </div>
          </div>

          {lesson.task_groups && lesson.task_groups.length > 0 && (
            <div className="mt-12 border-t-2 border-[var(--border-dark)] pt-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3 h-3 bg-[var(--neo-green)] border border-black rounded-sm shadow-[1px_1px_0px_0px_#000]" />
                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight uppercase">
                  Grupy zadań
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.task_groups.map((group: any) => (
                  <Link
                    key={group.id}
                    href={`/exercise/${group.id}`}
                    className="block p-5 border-2.5 border-[var(--border-dark)] rounded-xl bg-white shadow-[4px_4px_0px_0px_#000] hover:bg-[var(--neo-yellow)] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-extrabold text-lg text-[var(--text-main)] group-hover:text-black">
                        {group.name}
                      </h3>
                      <span className="bg-[var(--neo-green)] text-black border border-black rounded-md px-2 py-0.5 font-black text-xs shadow-[1px_1px_0px_0px_#000] group-hover:translate-x-1 transition-transform">
                        &rarr;
                      </span>
                    </div>
                    <p className="text-[var(--text-muted)] font-semibold text-xs mt-3 uppercase tracking-wider group-hover:text-black">
                      Przejdź do zadań
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <Scratchpad />
    </div>
  );
}
