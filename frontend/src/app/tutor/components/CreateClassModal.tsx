"use client";

import { useState } from "react";
import { getApiUrl, getAuthToken } from "@/utils/auth";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export default function CreateClassModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateClassModalProps) {
  const [classNameInput, setClassNameInput] = useState("");
  const [classScheduleInput, setClassScheduleInput] = useState("");
  const [classMeetInput, setClassMeetInput] = useState("");
  const [classDescInput, setClassDescInput] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
      onClose();
      await onSuccess();
    } catch (err: any) {
      setCreateError(err.message || "Błąd połączenia z serwerem.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !creating) {
          onClose();
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
            onClick={() => !creating && onClose()}
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
              onClick={onClose}
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
  );
}
