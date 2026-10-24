"use client";

import { useState } from "react";
import Link from "next/link";
import { Classroom } from "../types";

interface ClassCardProps {
  cls: Classroom;
  onEdit: (cls: Classroom) => void;
  onAssign: (cls: Classroom) => void;
  onDeleteAssignment: (assignmentId: string) => Promise<void>;
  deletingAssignmentId: string | null;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export default function ClassCard({
  cls,
  onEdit,
  onAssign,
  onDeleteAssignment,
  deletingAssignmentId,
  copiedCode,
  onCopyCode,
}: ClassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMeetRevealed, setIsMeetRevealed] = useState(false);
  const [expandedStudentKey, setExpandedStudentKey] = useState<string | null>(null);
  const [studentFilter, setStudentFilter] = useState<Record<string, "all" | "completed" | "pending">>({});

  const totalClassAssignments = cls.assignments?.length || 0;
  const totalMembers = cls.students?.length || cls.members_count || 0;

  return (
    <div className="bg-white border-3 border-black rounded-2xl p-6 sm:p-7 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between transition-all space-y-5">
      <div className="space-y-4">
        {/* Top Row: Title + Tags + Edit Button */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b-2 border-black/10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-black leading-snug">
                {cls.name}
              </h3>
              <span className="text-xs font-black bg-[var(--neo-yellow)] border-2 border-black px-2.5 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_#000]">
                👥 {totalMembers} {totalMembers === 1 ? "uczeń" : totalMembers < 5 ? "uczniów" : "uczniów"}
              </span>
            </div>
            {cls.description && (
              <p className="text-sm text-gray-700 font-semibold mt-1.5 leading-relaxed">
                {cls.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onEdit(cls)}
            className="px-3.5 py-2 bg-white hover:bg-[var(--neo-yellow)] border-2 border-black rounded-xl text-xs sm:text-sm font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer shrink-0 flex items-center gap-1.5 self-start"
            title="Edytuj klasę, godziny i link do spotkań"
          >
            <span>✏️</span>
            <span>Edytuj klasę</span>
          </button>
        </div>

        {/* Godziny lekcji (osobna linia, wyśrodkowana i powiększona) */}
        <div className="bg-[var(--neo-yellow)] border-2.5 border-black rounded-xl p-4 shadow-[2.5px_2.5px_0px_0px_#000] flex flex-col items-center justify-center text-center">
          <div className="text-xs sm:text-sm font-black uppercase text-black/80 tracking-wider mb-1 text-center">
            Godziny lekcji
          </div>
          <div className="text-sm sm:text-base md:text-lg font-black text-black break-words leading-snug text-center">
            {cls.schedule || "Brak harmonogramu"}
          </div>
        </div>

        {/* Google Meet i Kod klasy (obok siebie z wyśrodkowanymi, powiększonymi tytułami) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Google Meet Link */}
          <div className="bg-[var(--bg-deep)] border-2.5 border-black rounded-xl p-3.5 shadow-[2.5px_2.5px_0px_0px_#000] flex flex-col justify-between">
            <div className="relative flex items-center justify-center mb-2">
              <span className="text-xs sm:text-sm font-black uppercase text-gray-800 tracking-wider text-center">
                Google Meet
              </span>
              {cls.meet_link && (
                <button
                  type="button"
                  onClick={() => setIsMeetRevealed(!isMeetRevealed)}
                  className="absolute right-0 text-[10px] font-black uppercase underline hover:text-blue-700 cursor-pointer"
                >
                  {isMeetRevealed ? "Ukryj" : "Link"}
                </button>
              )}
            </div>
            {cls.meet_link ? (
              <div className="space-y-1.5">
                {isMeetRevealed && (
                  <div className="p-1.5 bg-white border border-black rounded-lg text-[10px] font-mono font-bold text-blue-700 break-all select-all text-center">
                    {cls.meet_link}
                  </div>
                )}
                <a
                  href={cls.meet_link.startsWith("http") ? cls.meet_link : `https://${cls.meet_link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-white hover:bg-[var(--neo-blue)] text-black border-2 border-black rounded-lg font-black text-xs uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_#000] flex items-center justify-center gap-1.5 no-underline transition-all"
                >
                  <span>Otwórz Meet</span>
                  <span>↗</span>
                </a>
              </div>
            ) : (
              <div className="text-xs font-bold text-gray-500 italic text-center py-1">
                Brak linku
              </div>
            )}
          </div>

          {/* Join Code Box */}
          <div className="bg-[var(--bg-deep)] border-2.5 border-black rounded-xl p-3.5 shadow-[2.5px_2.5px_0px_0px_#000] flex flex-col justify-between">
            <div className="text-xs sm:text-sm font-black uppercase text-gray-800 tracking-wider mb-2 text-center">
              Kod klasy
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <span className="font-mono text-lg sm:text-xl font-black tracking-widest text-black">
                {cls.join_code}
              </span>
              <button
                onClick={() => onCopyCode(cls.join_code)}
                className="px-2.5 py-1 bg-white hover:bg-[var(--neo-yellow)] border-1.5 border-black rounded-lg font-black text-xs uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_#000] cursor-pointer"
                title="Skopiuj kod"
              >
                {copiedCode === cls.join_code ? "✓" : "Kopiuj"}
              </button>
            </div>
          </div>
        </div>

        {/* Przydzielone zadania (Assignments) */}
        <div className="bg-[var(--bg-deep)] border-2.5 border-black rounded-xl p-4 sm:p-5 shadow-[3px_3px_0px_0px_#000] space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
                Przydzielone zadania
              </span>
              {totalClassAssignments > 0 && (
                <span className="bg-white text-black border-1.5 border-black text-xs font-black px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_#000]">
                  {totalClassAssignments}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onAssign(cls)}
              className="px-3.5 py-1.5 bg-[var(--neo-green)] hover:bg-[#72e89f] text-black border-2 border-black rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="font-black">+</span>
              <span>Przydziel zadania</span>
            </button>
          </div>

          {cls.assignments && cls.assignments.length > 0 ? (
            <div className="space-y-3.5 max-h-[34rem] overflow-y-auto pr-1">
              {cls.assignments.map((assignment) => {
                const completedStudents = (cls.students || []).filter((s) =>
                  s.assignments_status?.some(
                    (as) => as.assignment_id === assignment.id && as.is_completed
                  )
                );
                const pendingStudents = (cls.students || []).filter(
                  (s) =>
                    !s.assignments_status?.some(
                      (as) => as.assignment_id === assignment.id && as.is_completed
                    )
                );
                const studentsCount = (cls.students || []).length;
                const isAllCompleted =
                  studentsCount > 0 && completedStudents.length === studentsCount;
                const isPartiallyCompleted =
                  completedStudents.length > 0 && !isAllCompleted;

                return (
                  <div
                    key={assignment.id}
                    className="p-4 bg-white border-2.5 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-3"
                  >
                    {/* Assignment Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate">
                          {assignment.topic_name}{" "}
                          {assignment.subtopic_name ? `- ${assignment.subtopic_name}` : ""}
                        </div>
                        <div className="text-base sm:text-lg font-black text-black leading-snug">
                          {assignment.task_group_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-[var(--neo-yellow)] text-black border-1.5 border-black text-xs font-black px-2.5 py-1 rounded-lg shadow-[1.5px_1.5px_0px_#000]">
                          {assignment.task_count}{" "}
                          {assignment.task_count === 1
                            ? "zadanie"
                            : assignment.task_count < 5
                            ? "zadania"
                            : "zadań"}
                        </span>
                      </div>
                    </div>

                    {/* Due date and note */}
                    {(assignment.due_date || assignment.note) && (
                      <div className="text-xs space-y-1 pt-1 border-t border-black/10">
                        {assignment.due_date && (
                          <div className="font-black text-red-700 flex items-center gap-1.5">
                            <span>Termin oddania: {new Date(assignment.due_date).toLocaleDateString("pl-PL")}</span>
                          </div>
                        )}
                        {assignment.note && (
                          <div className="text-gray-700 font-medium italic leading-relaxed bg-yellow-50/70 p-2 rounded-lg border border-black/10">
                            „{assignment.note}”
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress bar and summary */}
                    <div className="space-y-1.5 pt-1 border-t border-black/10">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="flex items-center gap-2">
                          <span className="uppercase tracking-wider text-black">Status oddania:</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_#000] ${
                              isAllCompleted
                                ? "bg-[var(--neo-green)] text-black"
                                : isPartiallyCompleted
                                ? "bg-[var(--neo-yellow)] text-black"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {completedStudents.length} / {studentsCount} (
                            {studentsCount > 0
                              ? Math.round((completedStudents.length / studentsCount) * 100)
                              : 0}
                            %)
                          </span>
                        </span>
                        <span className="text-[11px] text-gray-600 font-bold hidden sm:inline">
                          Zaliczenie: test min. 80%
                        </span>
                      </div>

                      {studentsCount > 0 && (
                        <div className="w-full h-3 bg-gray-100 border-2 border-black rounded-full overflow-hidden flex shadow-inner">
                          <div
                            className="h-full bg-[var(--neo-green)] transition-all duration-300"
                            style={{
                              width: `${(completedStudents.length / studentsCount) * 100}%`,
                            }}
                            title={`Zaliczyło: ${completedStudents.length}`}
                          />
                          <div
                            className="h-full bg-amber-200 transition-all duration-300"
                            style={{
                              width: `${(pendingStudents.length / studentsCount) * 100}%`,
                            }}
                            title={`Do zaliczenia: ${pendingStudents.length}`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Student completion status cards (ZALICZONE vs DO ZALICZENIA) */}
                    {studentsCount > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                        {/* Kolumna ZALICZONE */}
                        <div className="p-3 bg-[#f0fdf4] border-2 border-emerald-600 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-black text-emerald-950 border-b border-emerald-300/80 pb-1">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                                ✓
                              </span>
                              <span>ZALICZONE</span>
                            </span>
                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                              {completedStudents.length}
                            </span>
                          </div>
                          {completedStudents.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                              {completedStudents.map((s) => {
                                const as = s.assignments_status?.find(
                                  (a) => a.assignment_id === assignment.id
                                );
                                return (
                                  <span
                                    key={s.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border-1.5 border-emerald-700 rounded-lg text-xs font-black text-black shadow-[1px_1px_0px_#059669]"
                                    title={`Test zdany! Najlepszy wynik: ${as?.best_score ?? 0}%, próby: ${
                                      as?.attempts_count ?? 1
                                    }`}
                                  >
                                    <span>✓</span>
                                    <span>{s.name}</span>
                                    {as?.best_score != null && (
                                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded border border-emerald-300">
                                        {as.best_score}%
                                      </span>
                                    )}
                                    {(as?.attempts_count ?? 0) > 1 && (
                                      <span
                                        className="text-[10px] text-gray-500 font-semibold"
                                        title={`Liczba podejść do testu: ${as?.attempts_count}`}
                                      >
                                        ({as?.attempts_count}p)
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-[11px] text-emerald-800/80 italic font-medium py-1">
                              Żaden uczeń jeszcze nie zdał testu.
                            </div>
                          )}
                        </div>

                        {/* Kolumna DO ZALICZENIA / NIEZALICZONE */}
                        <div className="p-3 bg-[#fffbeb] border-2 border-amber-500 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-black text-amber-950 border-b border-amber-300/80 pb-1">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black">
                                ⏳
                              </span>
                              <span>DO ZALICZENIA</span>
                            </span>
                            <span className="bg-amber-500 text-black px-2 py-0.5 rounded-md text-[10px] font-black">
                              {pendingStudents.length}
                            </span>
                          </div>
                          {pendingStudents.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                              {pendingStudents.map((s) => {
                                const as = s.assignments_status?.find(
                                  (a) => a.assignment_id === assignment.id
                                );
                                const attempts = as?.attempts_count ?? 0;
                                const failed = as?.failed_count ?? 0;
                                return (
                                  <span
                                    key={s.id}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-1.5 rounded-lg text-xs font-black shadow-[1px_1px_0px_#000] ${
                                      attempts > 0
                                        ? "bg-rose-50 border-red-500 text-red-950"
                                        : "bg-white border-amber-600 text-gray-900"
                                    }`}
                                    title={
                                      attempts > 0
                                        ? `Podejścia: ${attempts}, niezdane: ${failed}, najlepszy wynik: ${
                                            as?.best_score ?? 0
                                          }%`
                                        : "Uczeń nie podszedł jeszcze do testu"
                                    }
                                  >
                                    <span>{attempts > 0 ? "✕" : "⏳"}</span>
                                    <span>{s.name}</span>
                                    {attempts > 0 ? (
                                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1 py-0.2 rounded border border-red-200">
                                        {failed} {failed === 1 ? "porażka" : "porażek"} (max:{" "}
                                        {as?.best_score}%)
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-500 font-semibold italic">
                                        brak prób
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-[11px] text-amber-800/80 italic font-medium py-1">
                              Wszyscy uczniowie zaliczyli to zadanie
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Assignment actions */}
                    <div className="flex items-center justify-between pt-2 gap-2 border-t border-black/10">
                      <Link
                        href={`/exercise/${assignment.task_group_id}?from=/tutor`}
                        className="text-xs sm:text-sm font-black text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                      >
                        <span>Podgląd pytań</span>
                        <span>&rarr;</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDeleteAssignment(assignment.id)}
                        disabled={deletingAssignmentId === assignment.id}
                        className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {deletingAssignmentId === assignment.id ? "Usuwanie..." : "Usuń zadanie"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 px-3 bg-white/70 border-1.5 border-black/20 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-700 font-bold">
                Brak przypisanych zadań dla tej klasy.
              </p>
              <button
                type="button"
                onClick={() => onAssign(cls)}
                className="mt-1.5 text-xs sm:text-sm font-black text-black underline hover:text-[var(--neo-green)] cursor-pointer"
              >
                Kliknij tutaj, aby zadać materiał
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toggle students view */}
      <div className="pt-3 border-t-2 border-black/10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3.5 px-4 bg-gray-50 hover:bg-gray-100 border-2.5 border-black rounded-xl font-black text-sm sm:text-base uppercase tracking-wider text-black flex items-center justify-between gap-2.5 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>Uczniowie w tej klasie ({totalMembers})</span>
          </span>
          <span className="text-sm font-black">{isExpanded ? "▲ Zwiń" : "▼ Rozwiń listę"}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 pt-2 space-y-3.5 max-h-[36rem] overflow-y-auto pr-0.5">
            {cls.students && cls.students.length > 0 ? (
              cls.students.map((student) => {
                const studentKey = `${cls.id}-${student.id}`;
                const isStudentExpanded = expandedStudentKey === studentKey;
                const totalAssignments = cls.assignments?.length || 0;
                const completedCount = student.completed_assignments_count ?? 0;
                const pendingCount = Math.max(0, totalAssignments - completedCount);
                const allCompleted = totalAssignments > 0 && completedCount === totalAssignments;
                const someCompleted = completedCount > 0 && completedCount < totalAssignments;

                // Filtrowanie zadań tego ucznia
                const currentFilter = studentFilter[studentKey] || "all";
                const allStatuses = student.assignments_status || [];
                const filteredStatuses = allStatuses.filter((as) => {
                  if (currentFilter === "completed") return as.is_completed;
                  if (currentFilter === "pending") return !as.is_completed;
                  return true;
                });

                return (
                  <div
                    key={student.id}
                    className="bg-[var(--bg-deep)] border-2.5 border-black rounded-2xl overflow-hidden transition-all shadow-[3px_3px_0px_0px_#000]"
                  >
                    {/* Student row header (klikalny) */}
                    <div
                      onClick={() =>
                        setExpandedStudentKey(isStudentExpanded ? null : studentKey)
                      }
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-yellow-50/70 transition-colors select-none"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-base sm:text-lg font-black text-black leading-snug truncate">
                          {student.name}
                        </div>
                        {student.email && (
                          <div className="text-xs sm:text-sm text-gray-700 truncate font-semibold mt-0.5">
                            {student.email}
                          </div>
                        )}
                      </div>

                      {/* Right side: Homework progress badge & expand icon */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {totalAssignments > 0 ? (
                          <span
                            className={`text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000] ${
                              allCompleted
                                ? "bg-[var(--neo-green)] text-black"
                                : someCompleted
                                ? "bg-[var(--neo-yellow)] text-black"
                                : "bg-red-100 text-red-900"
                            }`}
                            title={`Uczeń zaliczył ${completedCount} z ${totalAssignments} zadań`}
                          >
                            Zaliczone: {completedCount}/{totalAssignments}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-gray-500 italic">
                            Brak zadań
                          </span>
                        )}

                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-black bg-white flex items-center justify-center text-xs sm:text-sm font-black shadow-[1.5px_1.5px_0px_#000]"
                          title={isStudentExpanded ? "Ukryj szczegóły" : "Zobacz szczegóły zadań"}
                        >
                          {isStudentExpanded ? "▲" : "▼"}
                        </div>
                      </div>
                    </div>

                    {/* Expanded student homework report */}
                    {isStudentExpanded && (
                      <div className="p-4 sm:p-5 bg-white border-t-2.5 border-black space-y-3.5 animate-in fade-in duration-100">
                        {/* Subheader with filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-black/10">
                          <div>
                            <div className="text-sm sm:text-base font-black uppercase tracking-wider text-black flex items-center gap-2">
                              <span>Raport zadań ucznia</span>
                              <span className="text-xs font-bold text-gray-700 normal-case">
                                ({completedCount} zaliczonych, {pendingCount} do zaliczenia)
                              </span>
                            </div>
                            {student.joined_at && (
                              <div className="text-xs text-gray-500 font-semibold mt-0.5">
                                Dołączył(a) do klasy:{" "}
                                {new Date(student.joined_at).toLocaleDateString("pl-PL")}
                              </div>
                            )}
                          </div>

                          {/* Filtr zadań */}
                          {totalAssignments > 0 && (
                            <div className="flex items-center gap-1.5 self-start sm:self-auto">
                              <button
                                type="button"
                                onClick={() =>
                                  setStudentFilter((prev) => ({
                                    ...prev,
                                    [studentKey]: "all",
                                  }))
                                }
                                className={`px-2.5 py-1 text-xs font-black rounded-lg border border-black shadow-[1px_1px_0px_#000] cursor-pointer transition-all ${
                                  currentFilter === "all"
                                    ? "bg-black text-white"
                                    : "bg-white text-black hover:bg-gray-100"
                                }`}
                              >
                                Wszystkie ({totalAssignments})
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setStudentFilter((prev) => ({
                                    ...prev,
                                    [studentKey]: "completed",
                                  }))
                                }
                                className={`px-2.5 py-1 text-xs font-black rounded-lg border border-black shadow-[1px_1px_0px_#000] cursor-pointer transition-all ${
                                  currentFilter === "completed"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-[#f0fdf4] text-emerald-900 hover:bg-emerald-100"
                                }`}
                              >
                                Zaliczone ({completedCount})
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setStudentFilter((prev) => ({
                                    ...prev,
                                    [studentKey]: "pending",
                                  }))
                                }
                                className={`px-2.5 py-1 text-xs font-black rounded-lg border border-black shadow-[1px_1px_0px_#000] cursor-pointer transition-all ${
                                  currentFilter === "pending"
                                    ? "bg-amber-500 text-black"
                                    : "bg-[#fffbeb] text-amber-950 hover:bg-amber-100"
                                }`}
                              >
                                Do zaliczenia ({pendingCount})
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Lista zadań ze statystykami */}
                        {filteredStatuses.length > 0 ? (
                          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-0.5">
                            {filteredStatuses.map((as) => {
                              const isOverdue =
                                !as.is_completed && as.due_date && new Date(as.due_date) < new Date();
                              const isDone = as.is_completed;

                              return (
                                <div
                                  key={as.assignment_id}
                                  className={`p-3.5 border-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#000] transition-all ${
                                    isDone
                                      ? "bg-[#f0fdf4] border-emerald-600 shadow-[2px_2px_0px_#059669]"
                                      : isOverdue
                                      ? "bg-rose-50 border-red-500 shadow-[2px_2px_0px_#b91c1c]"
                                      : "bg-[#fffbeb] border-amber-500 shadow-[2px_2px_0px_#d97706]"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate">
                                      {as.topic_name}{" "}
                                      {as.subtopic_name ? `- ${as.subtopic_name}` : ""}
                                    </div>
                                    <div className="text-base font-black text-black leading-snug">
                                      {as.task_group_name}
                                    </div>
                                    {as.due_date && (
                                      <div
                                        className={`text-xs font-bold flex items-center gap-1.5 ${
                                          isOverdue
                                            ? "text-red-700 font-black"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        <span>
                                          Termin: {new Date(as.due_date).toLocaleDateString("pl-PL")}{" "}
                                          {isOverdue ? "(Po terminie!)" : ""}
                                        </span>
                                      </div>
                                    )}

                                    {/* Statystyki prób testu */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      <span className="px-2 py-0.5 bg-white border border-black rounded-md text-[11px] font-black shadow-[1px_1px_0px_#000] text-black">
                                        Próby: <b>{as.attempts_count ?? 0}</b>
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 border border-black rounded-md text-[11px] font-black shadow-[1px_1px_0px_#000] ${
                                          (as.success_count ?? 0) > 0
                                            ? "bg-[var(--neo-green)] text-black"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        ✓ Zdane: <b>{as.success_count ?? 0}</b>
                                      </span>
                                      {(as.failed_count ?? 0) > 0 && (
                                        <span className="px-2 py-0.5 border border-black rounded-md text-[11px] font-black shadow-[1px_1px_0px_#000] bg-red-100 text-red-900">
                                          ✕ Niezdane: <b>{as.failed_count}</b>
                                        </span>
                                      )}
                                      {as.best_score !== undefined && as.best_score !== null && (
                                        <span className="px-2 py-0.5 bg-[var(--neo-yellow)] text-black border border-black rounded-md text-[11px] font-black shadow-[1px_1px_0px_#000]">
                                          Najlepszy wynik: <b>{as.best_score}%</b>
                                        </span>
                                      )}
                                      {(as.attempts_count ?? 0) === 0 && (
                                        <span className="text-[11px] text-gray-600 font-bold italic bg-white/80 px-2 py-0.5 rounded border border-black/30">
                                          Brak podejść do testu
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Badge */}
                                  <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                                    {isDone ? (
                                      <>
                                        <span className="px-3 py-1.5 bg-[var(--neo-green)] text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
                                          ZALICZONE
                                        </span>
                                        {as.completed_at && (
                                          <span className="text-[11px] text-emerald-900 font-bold">
                                            {new Date(as.completed_at).toLocaleDateString("pl-PL", {
                                              day: "2-digit",
                                              month: "2-digit",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        )}
                                      </>
                                    ) : isOverdue ? (
                                      <span className="px-3 py-1.5 bg-red-200 text-red-950 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
                                        PO TERMINIE
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1.5 bg-white text-amber-950 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
                                        DO ZALICZENIA
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-xs sm:text-sm text-gray-600 italic font-medium bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                            Brak zadań w wybranej kategorii (
                            {currentFilter === "completed"
                              ? "zaliczone"
                              : currentFilter === "pending"
                              ? "do zaliczenia"
                              : "wszystkie"}
                            ).
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-5 text-sm sm:text-base text-gray-600 italic font-bold">
                Żaden uczeń jeszcze nie dołączył do tej klasy.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
