"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, UserProfile, getApiUrl, getAuthToken } from "@/utils/auth";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import { Classroom, AvailableTaskGroup } from "./types";
import CreateClassModal from "./components/CreateClassModal";
import EditClassModal from "./components/EditClassModal";
import AssignHomeworkModal from "./components/AssignHomeworkModal";
import ClassCard from "./components/ClassCard";

export default function TutorPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [assignModalClass, setAssignModalClass] = useState<Classroom | null>(null);
  const [availableTaskGroups, setAvailableTaskGroups] = useState<AvailableTaskGroup[]>([]);
  const [loadingTaskGroups, setLoadingTaskGroups] = useState(false);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);

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
      console.error("Błąd podczas pobierania klas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTaskGroups = async () => {
    try {
      setLoadingTaskGroups(true);
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/tutor/available-task-groups`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableTaskGroups(data.task_groups || []);
      }
    } catch (err) {
      console.error("Błąd pobierania grup zadań:", err);
    } finally {
      setLoadingTaskGroups(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }
        if (user.role !== "tutor" && user.role !== "admin") {
          router.push("/graph");
          return;
        }
        setCurrentUser(user);
        await fetchClasses();
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
      }
    };
    init();
  }, [router]);

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const openAssignModal = (cls: Classroom) => {
    setAssignModalClass(cls);
    if (availableTaskGroups.length === 0) {
      fetchAvailableTaskGroups();
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to zadanie z klasy?")) return;

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
      console.error("Błąd usuwania zadania:", err);
    } finally {
      setDeletingAssignmentId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b-3 border-black bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_4px_0_0_#000]">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden sm:inline-block bg-[var(--neo-yellow)] border-2 border-black text-xs font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_#000]">
            Panel Korepetytora
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-deep)] border-2 border-black rounded-xl text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-[var(--neo-green)] border border-black inline-block animate-pulse"></span>
              <span className="truncate max-w-[150px]">
                {currentUser.firstName || currentUser.lastName
                  ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
                  : currentUser.email}
              </span>
            </div>
          )}

          <Link
            href="/graph"
            className="px-3.5 py-2 bg-white hover:bg-[var(--neo-yellow)] text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all no-underline flex items-center gap-1.5"
          >
            <span>Mapa wiedzy</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1540px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            onClick={() => setIsCreateModalOpen(true)}
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
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-[var(--neo-yellow)] text-black font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-yellow-300 transition-all cursor-pointer"
              >
                + Utwórz pierwszą klasę
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onEdit={(c) => setEditingClass(c)}
                onAssign={(c) => openAssignModal(c)}
                onDeleteAssignment={handleDeleteAssignment}
                deletingAssignmentId={deletingAssignmentId}
                copiedCode={copiedCode}
                onCopyCode={copyToClipboard}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal: Tworzenie nowej klasy */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchClasses}
      />

      {/* Modal: Edycja klasy */}
      <EditClassModal
        editingClass={editingClass}
        onClose={() => setEditingClass(null)}
        onSuccess={fetchClasses}
      />

      {/* Modal: Zadawanie zadań klasie */}
      <AssignHomeworkModal
        assignModalClass={assignModalClass}
        availableTaskGroups={availableTaskGroups}
        loadingTaskGroups={loadingTaskGroups}
        onClose={() => setAssignModalClass(null)}
        onSuccess={fetchClasses}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
