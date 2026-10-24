"use client";

import { useState, useMemo } from "react";
import { Classroom, AvailableTaskGroup } from "../types";
import { getApiUrl, getAuthToken } from "@/utils/auth";

interface AssignHomeworkModalProps {
  assignModalClass: Classroom | null;
  availableTaskGroups: AvailableTaskGroup[];
  loadingTaskGroups: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export default function AssignHomeworkModal({
  assignModalClass,
  availableTaskGroups,
  loadingTaskGroups,
  onClose,
  onSuccess,
}: AssignHomeworkModalProps) {
  const [selectedTaskGroupId, setSelectedTaskGroupId] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [taskGroupSearch, setTaskGroupSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  const filteredTaskGroups = useMemo(() => {
    if (!taskGroupSearch.trim()) return availableTaskGroups;
    const q = taskGroupSearch.toLowerCase();
    return availableTaskGroups.filter(
      (tg) =>
        tg.name.toLowerCase().includes(q) ||
        (tg.topic_name && tg.topic_name.toLowerCase().includes(q)) ||
        (tg.subtopic_name && tg.subtopic_name.toLowerCase().includes(q)) ||
        (tg.chapter_name && tg.chapter_name.toLowerCase().includes(q))
    );
  }, [availableTaskGroups, taskGroupSearch]);

  if (!assignModalClass) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskGroupId) {
      setAssignError("Wybierz grupę zadań.");
      return;
    }

    try {
      setAssigning(true);
      setAssignError("");
      const token = await getAuthToken();
      const res = await fetch(
        `${getApiUrl()}/api/v1/tutor/classes/${assignModalClass.id}/assignments`,
        {
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
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setAssignError(data.detail || "Nie udało się przypisać zadania.");
        return;
      }

      setSelectedTaskGroupId("");
      setAssignmentDueDate("");
      setAssignmentNote("");
      setTaskGroupSearch("");
      onClose();
      await onSuccess();
    } catch (err: any) {
      setAssignError(err.message || "Błąd połączenia z serwerem.");
    } finally {
      setAssigning(false);
    }
  };

  return (
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
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border-2 border-black bg-gray-100 hover:bg-gray-200 font-black text-sm flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                      className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isSelected
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
                          {tg.task_count} {tg.task_count === 1 ? "zadanie" : tg.task_count < 5 ? "zadania" : "zadań"}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${
                            isSelected ? "bg-black" : "bg-white"
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
              onClick={onClose}
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
  );
}
