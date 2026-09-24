"use client";

import Link from "next/link";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { useEffect, useState } from "react";

export default function LessonPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/lessons/${params.id}`);
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
  }, [params.id]);

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
        <Link href="/" className="text-accent-main hover:text-accent-hover transition-colors">
          &larr; Wróć do Mapy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-text-main p-8">
      <div className="max-w-3xl mx-auto bg-card-bg border border-border-dark p-8 rounded-lg shadow-xl">
        <Link href="/" className="text-accent-main hover:text-accent-hover transition-colors mb-6 inline-block">
          &larr; Wróć do Mapy
        </Link>
        <h1 className="text-3xl font-bold mb-6 text-text-main">{lesson.title}</h1>

        {lesson.video_url && (
          <div className="aspect-video bg-surface-bg border border-border-dark mb-6 flex items-center justify-center rounded-lg overflow-hidden">
            <iframe
              src={lesson.video_url}
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="prose max-w-none text-text-main">
          <h2 className="text-xl font-semibold mb-4 text-text-subtle">Treść lekcji</h2>
          <div className="my-4 p-6 bg-surface-bg border border-border-dark rounded text-center overflow-x-auto text-text-main shadow-inner">
            {lesson.content_tex ? (
              <BlockMath math={lesson.content_tex} />
            ) : (
              <p className="text-text-muted italic">Brak treści.</p>
            )}
          </div>
        </div>

        {lesson.task_groups && lesson.task_groups.length > 0 && (
          <div className="mt-12 border-t border-border-dark pt-8">
            <h2 className="text-2xl font-bold mb-6 text-text-main">Grupy zadań</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.task_groups.map((group: any) => (
                <Link
                  key={group.id}
                  href={`/exercise/${group.id}`}
                  className="block p-5 border border-border-subtle rounded-lg bg-surface-bg shadow-md hover:border-accent-hover hover:bg-card-hover transition-all group"
                >
                  <h3 className="font-semibold text-lg text-accent-main group-hover:text-accent-hover">{group.name}</h3>
                  <p className="text-text-muted text-sm mt-2">Przejdź do zadań &rarr;</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
