"use client";

import { useState, useEffect } from "react";
import { Classroom } from "../types";
import { getApiUrl, getAuthToken } from "@/utils/auth";

interface EditClassModalProps {
  editingClass: Classroom | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export default function EditClassModal({
  editingClass,
  onClose,
  onSuccess,
}: EditClassModalProps) {
  const [editNameInput, setEditNameInput] = useState("");
  const [editScheduleInput, setEditScheduleInput] = useState("");
  const [editMeetInput, setEditMeetInput] = useState("");
  const [editDescInput, setEditDescInput] = useState("");
  const [editError, setEditError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (editingClass) {
      setEditNameInput(editingClass.name || "");
      setEditScheduleInput(editingClass.schedule || "");
      setEditMeetInput(editingClass.meet_link || "");
      setEditDescInput(editingClass.description || "");
      setEditError("");
    }
  }, [editingClass]);

  if (!editingClass) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      onClose();
      await onSuccess();
    } catch (err: any) {
      setEditError(err.message || "Błąd połączenia z serwerem.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !updating) {
          onClose();
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
            onClick={() => !updating && onClose()}
            className="w-8 h-8 rounded-lg border-2 border-black bg-gray-100 hover:bg-gray-200 font-black text-sm flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              onClick={onClose}
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
  );
}
