"use client";

import Link from "next/link";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { useEffect, useState } from "react";
import { FileText, Download, ExternalLink, Eye, EyeOff, AlertCircle, Loader2, Maximize2, Minimize2 } from "lucide-react";
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

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isPdfExpanded, setIsPdfExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

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
      setPdfUrl(data.lesson?.pdf_url || null);
      setPdfError(data.lesson?.pdf_error || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const refreshPdfUrl = async () => {
    if (!lessonId) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/v1/lessons/${lessonId}/pdf-url`);
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.pdf_url) {
        setPdfUrl(data.pdf_url);
      } else {
        throw new Error(data.error || "Nie udało się wygenerować linku do pliku.");
      }
    } catch (err: any) {
      console.error("PDF refresh error:", err);
      setPdfError(err?.message || "Błąd pobierania presigned URL");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    const filename = lesson?.pdf_path?.split('/').pop() || 'materialy.pdf';
    setDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Błąd sieci podczas pobierania pliku.");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error("Direct download failed, falling back to new window:", err);
      window.open(pdfUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };



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
        <div className={`mx-auto bg-[var(--bg-card)] border-3 border-[var(--border-dark)] p-6 sm:p-10 rounded-2xl shadow-[8px_8px_0px_0px_#000] transition-all duration-300 ${
          isPdfExpanded ? "max-w-7xl" : showPdfPreview ? "max-w-5xl" : "max-w-3xl"
        }`}>

          {/* Importance / Category Tag */}
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[var(--neo-blue)] text-black font-extrabold text-xs px-3 py-1 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] uppercase">
              Zagadnienie
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-6 text-[var(--text-main)] tracking-tight">
            {lesson.title}
          </h1>

          {/* Theoretical Content (LaTeX) - only displayed if present */}
          {lesson.content_tex && (
            <div className="mb-8">
              <div className="inline-block bg-[var(--neo-yellow)] px-3 py-1 border-2 border-black rounded-md font-black text-xs uppercase tracking-wider mb-4 shadow-[2px_2px_0px_0px_#000]">
                Treść lekcji
              </div>
              <div className="p-6 bg-[var(--bg-deep)] border-2.5 border-[var(--border-dark)] rounded-xl text-center overflow-x-auto text-[var(--text-main)] shadow-[4px_4px_0px_0px_#000] font-medium">
                <BlockMath math={lesson.content_tex} />
              </div>
            </div>
          )}

          {/* PDF Materials Section */}
          {lesson.pdf_path && (
            <div className="mt-8 p-6 bg-[var(--bg-deep)] border-2.5 border-[var(--border-dark)] rounded-xl shadow-[4px_4px_0px_0px_#000]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[var(--neo-yellow)] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_#000] shrink-0">
                    <FileText className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                        PDF
                      </span>
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase">
                        Materiały do lekcji
                      </span>
                    </div>
                    <h3 className="text-base font-black text-[var(--text-main)] mt-0.5 break-all">
                      {lesson.pdf_path.split('/').pop()}
                    </h3>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {pdfLoading && (
                    <div className="flex items-center gap-2 text-xs font-black uppercase px-3 py-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Generowanie linku...</span>
                    </div>
                  )}

                  {pdfUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowPdfPreview(!showPdfPreview)}
                        className="flex items-center gap-2 bg-white hover:bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                      >
                        {showPdfPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showPdfPreview ? "Ukryj podgląd" : "Podgląd"}</span>
                      </button>

                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white hover:bg-[var(--neo-blue)] text-black font-black text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Nowa karta</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex items-center gap-2 bg-[var(--neo-green)] hover:bg-[#16a34a] hover:text-white text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {downloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>{downloading ? "Pobieranie..." : "Pobierz"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Error Notice */}
              {pdfError && (
                <div className="mt-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-xs font-bold text-red-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Błąd pobierania pliku PDF: {pdfError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={refreshPdfUrl}
                    disabled={pdfLoading}
                    className="bg-white hover:bg-black hover:text-white text-black px-2.5 py-1 rounded border border-black shadow-[1px_1px_0px_0px_#000] text-[11px] font-black uppercase transition-all shrink-0 cursor-pointer"
                  >
                    Spróbuj ponownie
                  </button>
                </div>
              )}


              {/* Embedded Viewer */}
              {showPdfPreview && pdfUrl && (
                <div className="mt-5 border-2.5 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_#000] bg-white">
                  <div className="bg-black text-white text-xs font-black uppercase px-4 py-2.5 flex items-center justify-between gap-4">
                    <span className="truncate">Podgląd: {lesson.pdf_path.split('/').pop()}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsPdfExpanded(!isPdfExpanded)}
                        className="text-white hover:text-[var(--neo-yellow)] font-black text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={isPdfExpanded ? "Standardowa szerokość" : "Pełna szerokość"}
                      >
                        {isPdfExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isPdfExpanded ? "Zwęż" : "Rozszerz"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPdfPreview(false)}
                        className="text-white hover:text-[var(--neo-yellow)] font-black text-xs uppercase transition-colors cursor-pointer"
                      >
                        Zamknij &times;
                      </button>
                    </div>
                  </div>
                  <iframe
                    src={`${pdfUrl}#toolbar=1&view=FitH`}
                    className="w-full h-[750px] sm:h-[850px] border-none"
                    title={`Podgląd PDF: ${lesson.title}`}
                  />
                </div>
              )}
            </div>
          )}

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
