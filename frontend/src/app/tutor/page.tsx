"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, UserProfile, getApiUrl, getAuthToken } from "@/utils/auth";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";

interface StudentAssignmentStatus {
  assignment_id: string;
  task_group_id: string;
  task_group_name: string;
  topic_name?: string;
  subtopic_name?: string;
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
}

interface StudentMember {
  id: string;
  name: string;
  email?: string;
  joined_at?: string;
  completed_assignments_count?: number;
  total_assignments_count?: number;
  assignments_status?: StudentAssignmentStatus[];
}

interface ClassAssignment {
  id: string;
  task_group_id: string;
  task_group_name: string;
  subtopic_name?: string;
  topic_name?: string;
  chapter_name?: string;
  task_count: number;
  due_date?: string;
  note?: string;
  created_at?: string;
  completed_count?: number;
  total_students?: number;
}

interface Classroom {
  id: string;
  name: string;
  description?: string;
  schedule?: string;
  meet_link?: string;
  join_code: string;
  created_at?: string;
  members_count: number;
  students: StudentMember[];
  assignments?: ClassAssignment[];
}

interface AvailableTaskGroup {
  id: string;
  name: string;
  subtopic_id: string;
  subtopic_name: string;
  topic_id: string;
  topic_name: string;
  chapter_id: string;
  chapter_name: string;
  task_count: number;
}

export default function TutorPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal tworzenia klasy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState("");
  const [classDescInput, setClassDescInput] = useState("");
  const [classScheduleInput, setClassScheduleInput] = useState("");
  const [classMeetInput, setClassMeetInput] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Modal edycji klasy
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [editNameInput, setEditNameInput] = useState("");
  const [editDescInput, setEditDescInput] = useState("");
  const [editScheduleInput, setEditScheduleInput] = useState("");
  const [editMeetInput, setEditMeetInput] = useState("");
  const [editError, setEditError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Modal zadawania zadań klasie
  const [assignModalClass, setAssignModalClass] = useState<Classroom | null>(null);
  const [availableTaskGroups, setAvailableTaskGroups] = useState<AvailableTaskGroup[]>([]);
  const [loadingTaskGroups, setLoadingTaskGroups] = useState(false);
  const [selectedTaskGroupId, setSelectedTaskGroupId] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [taskGroupSearch, setTaskGroupSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);

  // Podgląd listy uczniów w klasie
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  // Rozwinięty raport zadań konkretnego ucznia (klucz: `${classId}-${studentId}`)
  const [expandedStudentKey, setExpandedStudentKey] = useState<string | null>(null);
  // Odkrywanie linku Meet w danej karcie
  const [revealedMeetId, setRevealedMeetId] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/tutor/classes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error("Błąd podczas pobierania klas korepetytora:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);
      await fetchClasses();
    }
    loadData();
  }, [router]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = classNameInput.trim();
    if (!name) {
      setCreateError("Podaj nazwę klasy.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/tutor/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          description: classDescInput.trim() || undefined,
          schedule: classScheduleInput.trim() || undefined,
          meet_link: classMeetInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.detail || "Nie udało się utworzyć klasy.");
        return;
      }

      setClassNameInput("");
      setClassDescInput("");
      setClassScheduleInput("");
      setClassMeetInput("");
      setIsModalOpen(false);
      await fetchClasses();
    } catch (err: any) {
      setCreateError(err.message || "Błąd połączenia z serwerem.");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (cls: Classroom) => {
    setEditingClass(cls);
    setEditNameInput(cls.name);
    setEditDescInput(cls.description || "");
    setEditScheduleInput(cls.schedule || "");
    setEditMeetInput(cls.meet_link || "");
    setEditError("");
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const name = editNameInput.trim();
    if (!name) {
      setEditError("Podaj nazwę klasy.");
      return;
    }

    try {
      setUpdating(true);
      setEditError("");
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/tutor/classes/${editingClass.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          description: editDescInput.trim() || undefined,
          schedule: editScheduleInput.trim() || undefined,
          meet_link: editMeetInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.detail || "Nie udało się zaktualizować klasy.");
        return;
      }

      setEditingClass(null);
      await fetchClasses();
    } catch (err: any) {
      setEditError(err.message || "Błąd połączenia z serwerem.");
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const fetchAvailableTaskGroups = async () => {
    try {
      setLoadingTaskGroups(true);
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/tutor/task-groups`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableTaskGroups(data.task_groups || []);
      }
    } catch (err) {
      console.error("Błąd podczas pobierania grup zadań:", err);
    } finally {
      setLoadingTaskGroups(false);
    }
  };

  const openAssignModal = (cls: Classroom) => {
    setAssignModalClass(cls);
    setSelectedTaskGroupId("");
    setAssignmentDueDate("");
    setAssignmentNote("");
    setAssignError("");
    setTaskGroupSearch("");
    if (availableTaskGroups.length === 0) {
      fetchAvailableTaskGroups();
    }
  };

  const handleAssignTaskGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalClass) return;
    if (!selectedTaskGroupId) {
      setAssignError("Wybierz grupę zadań z listy.");
      return;
    }

    try {
      setAssigning(true);
      setAssignError("");
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/tutor/classes/${assignModalClass.id}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          task_group_id: selectedTaskGroupId,
          due_date: assignmentDueDate || undefined,
          note: assignmentNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAssignError(data.detail || "Nie udało się przypisać zadań do klasy.");
        return;
      }

      await fetchClasses();
      setAssignModalClass(null);
    } catch (err: any) {
      setAssignError(err.message || "Błąd połączenia z serwerem.");
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę grupę zadań z klasy?")) return;
    try {
      setDeletingAssignmentId(assignmentId);
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/tutor/assignments/${assignmentId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        await fetchClasses();
      } else {
        const data = await res.json();
        alert(data.detail || "Nie udało się usunąć zadania.");
      }
    } catch (err) {
      console.error("Błąd podczas usuwania zadania:", err);
    } finally {
      setDeletingAssignmentId(null);
    }
  };

  const filteredTaskGroups = availableTaskGroups.filter((g) => {
    if (!taskGroupSearch.trim()) return true;
    const q = taskGroupSearch.toLowerCase();
    return (
      (g.name && g.name.toLowerCase().includes(q)) ||
      (g.topic_name && g.topic_name.toLowerCase().includes(q)) ||
      (g.subtopic_name && g.subtopic_name.toLowerCase().includes(q)) ||
      (g.chapter_name && g.chapter_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between selection:bg-[var(--neo-yellow)]">
      {/* Header (Styl z LessonView) */}
      <header className="border-b-2.5 border-[var(--border-dark)] bg-[var(--bg-card)] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" href="/graph" />
            <span className="hidden sm:inline-block bg-[var(--neo-yellow)] text-black border-2 border-black rounded-md px-2.5 py-0.5 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
              Panel Korepetytora
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section with Create Class action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2.5">
              <span>Moje Klasy</span>
              <span className="text-sm font-black bg-[var(--neo-yellow)] border-2 border-black px-2.5 py-0.5 rounded-lg shadow-[2px_2px_0px_0px_#000]">
                {classes.length}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-700 font-semibold mt-1">
              Zarządzaj swoimi klasami, terminami lekcji, linkami do spotkań oraz kodami dołączenia.
            </p>
          </div>

          <button
            onClick={() => {
              setCreateError("");
              setIsModalOpen(true);
            }}
            className="px-5 py-3 bg-[var(--neo-green)] hover:bg-[#72e89f] text-black font-black text-xs uppercase tracking-wider rounded-xl border-2.5 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="text-base font-black">+</span>
            <span>Utwórz nową klasę</span>
          </button>
        </div>

        {/* Classes List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="bg-white border-3 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-black text-sm uppercase tracking-wider">Wczytywanie Twoich klas...</span>
            </div>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white border-3 border-black rounded-2xl p-10 text-center max-w-xl mx-auto shadow-[6px_6px_0px_0px_#000] space-y-4">
            <div className="w-16 h-16 mx-auto bg-[var(--neo-yellow)] border-2 border-black rounded-2xl flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#000]">
              🏫
            </div>
            <h2 className="text-xl font-black text-black uppercase">Nie masz jeszcze żadnych klas</h2>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold max-w-md mx-auto">
              Utwórz swoją pierwszą klasę, określ godziny spotkań oraz link do Google Meet, aby wygenerować kod dla uczniów.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setCreateError("");
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-yellow-300 transition-all cursor-pointer"
              >
                + Utwórz pierwszą klasę
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {classes.map((cls) => {
              const isExpanded = expandedClassId === cls.id;
              const isMeetRevealed = revealedMeetId === cls.id;
              return (
                <div
                  key={cls.id}
                  className="bg-white border-3 border-black rounded-2xl p-6 sm:p-7 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between transition-all"
                >
                  <div className="space-y-4">
                    {/* Top Row: Title + Edit Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-black leading-snug">
                          {cls.name}
                        </h3>
                        {cls.description && (
                          <p className="text-sm text-gray-700 font-semibold mt-1.5 leading-relaxed">
                            {cls.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => openEditModal(cls)}
                        className="px-3.5 py-1.5 bg-white hover:bg-[var(--neo-yellow)] border-2 border-black rounded-xl text-xs sm:text-sm font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer shrink-0"
                        title="Edytuj klasę, godziny i link do spotkań"
                      >
                        ✏️ Edytuj
                      </button>
                    </div>

                    {/* Godziny lekcji (Na pierwszym planie) */}
                    <div className="bg-[var(--neo-yellow)] border-2.5 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000] flex items-center gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-black uppercase text-black/80 tracking-wider mb-0.5">
                          Godziny lekcji
                        </div>
                        <div className="text-sm sm:text-base font-black text-black break-words">
                          {cls.schedule || "Brak ustalonego harmonogramu"}
                        </div>
                      </div>
                    </div>

                    {/* Google Meet Link (Ukryty z opcją podglądu / bezpośredniego dołączenia) */}
                    <div className="bg-[var(--bg-deep)] border-2.5 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000] space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                            Google Meet
                          </span>
                        </div>
                        {cls.meet_link ? (
                          <button
                            type="button"
                            onClick={() => setRevealedMeetId(isMeetRevealed ? null : cls.id)}
                            className="text-xs font-black uppercase px-2.5 py-1 bg-white border-1.5 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] hover:bg-gray-100 cursor-pointer"
                          >
                            {isMeetRevealed ? "Ukryj link" : "Pokaż link"}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-gray-500 italic">
                            Brak linku
                          </span>
                        )}
                      </div>

                      {cls.meet_link && (
                        <div>
                          {isMeetRevealed && (
                            <div className="p-2.5 mb-2.5 bg-white border-1.5 border-black rounded-xl text-xs font-mono font-bold text-blue-700 break-all select-all">
                              {cls.meet_link}
                            </div>
                          )}
                          <a
                            href={cls.meet_link.startsWith('http') ? cls.meet_link : `https://${cls.meet_link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 bg-white hover:bg-[var(--neo-blue)] text-black border-2 border-black rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-2 no-underline"
                          >
                            <span>Otwórz Google Meet</span>
                            <span className="text-sm">↗</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Join Code Box */}
                    <div className="bg-[var(--bg-deep)] border-2.5 border-black rounded-xl p-4 flex items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000]">
                      <div>
                        <div className="text-xs font-black uppercase text-gray-700 tracking-wider mb-0.5">
                          Kod dołączenia dla uczniów:
                        </div>
                        <div className="font-mono text-xl sm:text-2xl font-black tracking-widest text-black">
                          {cls.join_code}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(cls.join_code)}
                        className="px-4 py-2 bg-white hover:bg-[var(--neo-yellow)] border-2 border-black rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                        title="Skopiuj kod do schowka"
                      >
                        {copiedCode === cls.join_code ? "✓ Skopiowano" : "Kopiuj"}
                      </button>
                    </div>

                    {/* Przydzielone zadania (Assignments) */}
                    <div className="bg-[var(--bg-deep)] border-2.5 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000] space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                            Przydzielone zadania
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openAssignModal(cls)}
                          className="px-3.5 py-1.5 bg-[var(--neo-green)] hover:bg-[#72e89f] text-black border-2 border-black rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span className="font-black">+</span>
                          <span>Przydziel zadania</span>
                        </button>
                      </div>

                      {cls.assignments && cls.assignments.length > 0 ? (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {cls.assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="p-3.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate">
                                    {assignment.topic_name} - {assignment.subtopic_name}
                                  </div>
                                  <div className="text-sm sm:text-base font-black text-black leading-snug truncate">
                                    {assignment.task_group_name}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {cls.students && cls.students.length > 0 && (
                                    <span
                                      className={`text-xs font-black px-2.5 py-1 rounded-lg border-1.5 border-black shadow-[1px_1px_0px_#000] ${
                                        assignment.completed_count === cls.students.length
                                          ? "bg-[var(--neo-green)] text-black"
                                          : (assignment.completed_count ?? 0) > 0
                                          ? "bg-[var(--neo-yellow)] text-black"
                                          : "bg-white text-gray-700"
                                      }`}
                                      title={`Oddano: ${assignment.completed_count ?? 0} z ${cls.students.length} uczniów`}
                                    >
                                      Oddano: {assignment.completed_count ?? 0}/{cls.students.length}
                                    </span>
                                  )}
                                  <span className="bg-[var(--neo-yellow)] text-black border-1.5 border-black text-xs font-black px-2.5 py-1 rounded-lg shadow-[1.5px_1.5px_0px_#000]">
                                    {assignment.task_count} {assignment.task_count === 1 ? 'zadanie' : assignment.task_count < 5 ? 'zadania' : 'zadań'}
                                  </span>
                                </div>
                              </div>

                              {(assignment.due_date || assignment.note) && (
                                <div className="text-xs space-y-1 pt-1.5 border-t border-black/10">
                                  {assignment.due_date && (
                                    <div className="font-bold text-red-700 flex items-center gap-1.5">
                                      <span>📅</span>
                                      <span>Termin: {new Date(assignment.due_date).toLocaleDateString("pl-PL")}</span>
                                    </div>
                                  )}
                                  {assignment.note && (
                                    <div className="text-gray-700 font-medium italic leading-relaxed">
                                      „{assignment.note}”
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-1.5 gap-2 border-t border-black/10">
                                <Link
                                  href={`/exercise/${assignment.task_group_id}`}
                                  target="_blank"
                                  className="text-xs sm:text-sm font-black text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                                >
                                  <span>Podgląd zadań</span>
                                  <span>↗</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  disabled={deletingAssignmentId === assignment.id}
                                  className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  {deletingAssignmentId === assignment.id ? "Usuwanie..." : "Usuń zadanie"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3.5 px-3 bg-white/70 border-1.5 border-black/20 rounded-xl">
                          <p className="text-xs sm:text-sm text-gray-700 font-bold">
                            Brak przypisanych zadań dla tej klasy.
                          </p>
                          <button
                            type="button"
                            onClick={() => openAssignModal(cls)}
                            className="mt-1.5 text-xs sm:text-sm font-black text-black underline hover:text-[var(--neo-green)] cursor-pointer"
                          >
                            Kliknij tutaj, aby zadać materiał
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stats pill */}
                    <div className="flex items-center justify-between text-sm sm:text-base font-bold pt-1 text-gray-700">
                      <span className="flex items-center gap-2">
                        <span>👥 Uczniowie:</span>
                        <strong className="text-black font-black text-base sm:text-lg">{cls.members_count}</strong>
                      </span>
                      {cls.created_at && (
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(cls.created_at).toLocaleDateString("pl-PL")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle students view */}
                  <div className="mt-5 pt-3.5 border-t-2 border-black/10">
                    <button
                      onClick={() => setExpandedClassId(isExpanded ? null : cls.id)}
                      className="w-full py-3 bg-gray-50 hover:bg-gray-100 border-2 border-black rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? "Ukryj listę uczniów" : "Pokaż uczniów"}</span>
                      <span>{isExpanded ? "▲" : "▼"}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-3.5 pt-2 space-y-2.5 max-h-96 overflow-y-auto">
                        {cls.students && cls.students.length > 0 ? (
                          cls.students.map((student) => {
                            const studentKey = `${cls.id}-${student.id}`;
                            const isStudentExpanded = expandedStudentKey === studentKey;
                            const totalAssignments = cls.assignments?.length || 0;
                            const completedCount = student.completed_assignments_count ?? 0;
                            const allCompleted = totalAssignments > 0 && completedCount === totalAssignments;
                            const someCompleted = completedCount > 0 && completedCount < totalAssignments;

                            return (
                              <div
                                key={student.id}
                                className="bg-[var(--bg-deep)] border-2 border-black rounded-xl overflow-hidden transition-all shadow-[2px_2px_0px_0px_#000]"
                              >
                                {/* Student row header (klikalny) */}
                                <div
                                  onClick={() => setExpandedStudentKey(isStudentExpanded ? null : studentKey)}
                                  className="p-3 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-yellow-50/70 transition-colors select-none"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-black text-black leading-snug truncate">
                                      {student.name}
                                    </div>
                                    {student.email && (
                                      <div className="text-xs text-gray-600 truncate font-semibold mt-0.5">
                                        {student.email}
                                      </div>
                                    )}
                                  </div>

                                  {/* Right side: Homework progress badge & expand icon */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    {totalAssignments > 0 ? (
                                      <span
                                        className={`text-xs font-black px-2.5 py-1 rounded-lg border-1.5 border-black shadow-[1px_1px_0px_#000] ${
                                          allCompleted
                                            ? "bg-[var(--neo-green)] text-black"
                                            : someCompleted
                                            ? "bg-[var(--neo-yellow)] text-black"
                                            : "bg-red-100 text-red-900"
                                        }`}
                                        title={`Uczeń oddał ${completedCount} z ${totalAssignments} zadań`}
                                      >
                                        Zadania: {completedCount}/{totalAssignments}
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-bold text-gray-500 italic">
                                        Brak zadań
                                      </span>
                                    )}

                                    <div
                                      className="w-6 h-6 rounded-md border border-black bg-white flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_#000]"
                                      title={isStudentExpanded ? "Ukryj szczegóły" : "Zobacz szczegóły zadań"}
                                    >
                                      {isStudentExpanded ? "▲" : "▼"}
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded student homework mini-report */}
                                {isStudentExpanded && (
                                  <div className="p-3 bg-white border-t-2 border-black space-y-2 animate-in fade-in duration-100">
                                    <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-black/10">
                                      <div>
                                        <div className="text-xs font-black uppercase tracking-wider text-black">
                                          📋 Zadania domowe
                                        </div>
                                        <div className="text-[11px] font-bold text-gray-600 mt-0.5">
                                          {completedCount}/{totalAssignments} ukończonych
                                        </div>
                                      </div>
                                      {student.joined_at && (
                                        <span className="text-[11px] text-gray-500 font-semibold shrink-0">
                                          W klasie od: {new Date(student.joined_at).toLocaleDateString("pl-PL")}
                                        </span>
                                      )}
                                    </div>

                                    {student.assignments_status && student.assignments_status.length > 0 ? (
                                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                                        {student.assignments_status.map((as) => {
                                          const isOverdue = !as.is_completed && as.due_date && new Date(as.due_date) < new Date();
                                          return (
                                            <div
                                              key={as.assignment_id}
                                              className="p-2.5 bg-[var(--bg-deep)] border-1.5 border-black rounded-lg flex items-center justify-between gap-2.5"
                                            >
                                              <div className="min-w-0 flex-1">
                                                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider truncate">
                                                  {as.topic_name} - {as.subtopic_name}
                                                </div>
                                                <div className="text-xs font-black text-black truncate">
                                                  {as.task_group_name}
                                                </div>
                                                {as.due_date && (
                                                  <div className="text-[10px] text-gray-600 font-semibold mt-0.5 flex items-center gap-1">
                                                    <span>📅</span>
                                                    <span>Termin: {new Date(as.due_date).toLocaleDateString("pl-PL")}</span>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="shrink-0 flex flex-col items-end">
                                                {as.is_completed ? (
                                                  <>
                                                    <span className="px-2 py-0.5 bg-[var(--neo-green)] text-black border border-black rounded text-[10px] font-black shadow-[1px_1px_0px_#000]">
                                                      ✓ Ukończono
                                                    </span>
                                                    {as.completed_at && (
                                                      <span className="text-[9px] text-gray-500 font-medium mt-0.5">
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
                                                  <span className="px-2 py-0.5 bg-red-200 text-red-900 border border-black rounded text-[10px] font-black shadow-[1px_1px_0px_#000]">
                                                    ✕ Po terminie
                                                  </span>
                                                ) : (
                                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 border border-black rounded text-[10px] font-bold shadow-[1px_1px_0px_#000]">
                                                    ⏳ Do zrobienia
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="text-center py-2 text-xs text-gray-500 italic font-medium">
                                        Brak przydzielonych zadań w tej klasie.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-sm text-gray-600 italic font-bold">
                            Żaden uczeń jeszcze nie dołączył do tej klasy.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal: Tworzenie nowej klasy */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creating) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white border-3 border-black rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-[8px_8px_0px_0px_#000] relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-[var(--neo-yellow)] border-2 border-black rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
                  ➕
                </div>
                <div>
                  <h2 className="text-lg font-black text-black uppercase tracking-tight">
                    Utwórz nową klasę
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold">
                    Ustal harmonogram, spotkanie i wygeneruj kod
                  </p>
                </div>
              </div>
              <button
                onClick={() => !creating && setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg border-2 border-black bg-gray-100 hover:bg-gray-200 font-black text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Nazwa klasy / grupy *
                </label>
                <input
                  type="text"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="np. Matura Podstawowa 2026 – Grupa A"
                  required
                  autoFocus
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-bold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Godziny lekcji (Harmonogram)
                </label>
                <input
                  type="text"
                  value={classScheduleInput}
                  onChange={(e) => setClassScheduleInput(e.target.value)}
                  placeholder="np. Wtorki i Czwartki 17:00 – 18:30"
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-bold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Link do Google Meet
                </label>
                <input
                  type="url"
                  value={classMeetInput}
                  onChange={(e) => setClassMeetInput(e.target.value)}
                  placeholder="np. https://meet.google.com/abc-defg-hij"
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-bold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  value={classDescInput}
                  onChange={(e) => setClassDescInput(e.target.value)}
                  placeholder="np. Przygotowanie do egzaminu maturalnego z matematyki..."
                  rows={2}
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-semibold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>

              {createError && (
                <div className="p-3 bg-red-100 border-2 border-red-600 rounded-xl text-xs font-bold text-red-800 text-center">
                  {createError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={creating}
                  className="flex-1 py-2.5 bg-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={creating || !classNameInput.trim()}
                  className="flex-1.5 py-2.5 bg-[var(--neo-green)] text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:bg-[#72e89f] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {creating ? "Tworzenie..." : "Utwórz klasę"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edycja klasy */}
      {editingClass && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !updating) {
              setEditingClass(null);
            }
          }}
        >
          <div className="bg-white border-3 border-black rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-[8px_8px_0px_0px_#000] relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-[var(--neo-yellow)] border-2 border-black rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
                  ✏️
                </div>
                <div>
                  <h2 className="text-lg font-black text-black uppercase tracking-tight">
                    Edytuj klasę
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold">
                    Zmień nazwę, godziny lekcji lub link do Meet
                  </p>
                </div>
              </div>
              <button
                onClick={() => !updating && setEditingClass(null)}
                className="w-8 h-8 rounded-lg border-2 border-black bg-gray-100 hover:bg-gray-200 font-black text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Nazwa klasy / grupy *
                </label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  required
                  disabled={updating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-bold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Godziny lekcji (Harmonogram)
                </label>
                <input
                  type="text"
                  value={editScheduleInput}
                  onChange={(e) => setEditScheduleInput(e.target.value)}
                  placeholder="np. Wtorki i Czwartki 17:00 – 18:30"
                  disabled={updating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-bold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Link do Google Meet
                </label>
                <input
                  type="url"
                  value={editMeetInput}
                  onChange={(e) => setEditMeetInput(e.target.value)}
                  placeholder="np. https://meet.google.com/abc-defg-hij"
                  disabled={updating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-bold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  value={editDescInput}
                  onChange={(e) => setEditDescInput(e.target.value)}
                  rows={2}
                  disabled={updating}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-semibold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>

              {editError && (
                <div className="p-3 bg-red-100 border-2 border-red-600 rounded-xl text-xs font-bold text-red-800 text-center">
                  {editError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  disabled={updating}
                  className="flex-1 py-2.5 bg-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={updating || !editNameInput.trim()}
                  className="flex-1.5 py-2.5 bg-[var(--neo-green)] text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:bg-[#72e89f] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {updating ? "Zapisywanie..." : "Zapisz zmiany"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Zadawanie zadań klasie */}
      {assignModalClass && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-3 border-black rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-[8px_8px_0px_0px_#000] relative animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-4">
              <div className="flex items-center gap-2.5">
                <div>
                  <h2 className="text-lg font-black text-black uppercase tracking-tight">
                    Przydziel zadania domowe
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold truncate max-w-xs sm:max-w-sm">
                    Klasa: <strong className="text-black">{assignModalClass.name}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAssignTaskGroup} className="space-y-4">
              {/* Task Group Selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Wybierz grupę zadań
                </label>

                {/* Filter search input */}
                <input
                  type="text"
                  value={taskGroupSearch}
                  onChange={(e) => setTaskGroupSearch(e.target.value)}
                  placeholder="🔍 Szukaj po temacie, dziale lub nazwie..."
                  className="w-full px-3 py-2 mb-2 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-xs font-bold placeholder-gray-500 shadow-[2px_2px_0px_0px_#000] focus:bg-white focus:outline-none transition-all"
                />

                {loadingTaskGroups ? (
                  <div className="text-center py-6 text-xs text-gray-600 font-bold flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-[var(--neo-yellow)] rounded-full animate-spin" />
                    Wczytywanie dostępnych grup zadań
                  </div>
                ) : filteredTaskGroups.length === 0 ? (
                  <div className="p-4 text-center text-xs font-semibold text-gray-500 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                    {availableTaskGroups.length === 0
                      ? "Brak dostępnych grup zadań w bazie."
                      : "Nie znaleziono grup zadań pasujących do wyszukiwania."}
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 border-2 border-black rounded-xl p-2 bg-[var(--bg-deep)]">
                    {filteredTaskGroups.map((tg) => {
                      const isSelected = selectedTaskGroupId === tg.id;
                      return (
                        <div
                          key={tg.id}
                          onClick={() => setSelectedTaskGroupId(tg.id)}
                          className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between gap-2 ${isSelected
                            ? "bg-[var(--neo-yellow)] border-black shadow-[2px_2px_0px_0px_#000]"
                            : "bg-white border-black/20 hover:border-black hover:bg-yellow-50/50"
                            }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider truncate">
                              {tg.topic_name ? `${tg.topic_name} - ${tg.subtopic_name}` : tg.subtopic_name}
                            </div>
                            <div className="text-xs font-black text-black truncate">
                              {tg.name}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold bg-white/80 border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                              {tg.task_count} {tg.task_count === 1 ? 'zadanie' : tg.task_count < 5 ? 'zadania' : 'zadań'}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${isSelected ? "bg-black" : "bg-white"
                                }`}
                            >
                              {isSelected && <span className="text-white text-[9px] font-black">✓</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Termin oddania (opcjonalnie)
                </label>
                <input
                  type="date"
                  value={assignmentDueDate}
                  onChange={(e) => setAssignmentDueDate(e.target.value)}
                  disabled={assigning}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all text-xs"
                />
              </div>

              {/* Note / Instructions */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Wskazówki dla uczniów (opcjonalnie)
                </label>
                <textarea
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  placeholder="np. Przeróbcie przynajmniej 3 zadania z tej grupy przed następną lekcją..."
                  rows={2}
                  disabled={assigning}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-black font-semibold placeholder-gray-400 shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white focus:outline-none transition-all resize-none text-xs"
                />
              </div>

              {assignError && (
                <div className="p-3 bg-red-100 border-2 border-red-600 rounded-xl text-xs font-bold text-red-800 text-center">
                  {assignError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalClass(null)}
                  disabled={assigning}
                  className="flex-1 py-2.5 bg-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={assigning || !selectedTaskGroupId}
                  className="flex-1.5 py-2.5 bg-[var(--neo-green)] text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:bg-[#72e89f] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {assigning ? "Przypisywanie..." : "Przydziel klasie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
