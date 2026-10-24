"use client";

import { useState } from "react";
import { getApiUrl, getAuthToken } from "@/utils/auth";

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export default function JoinClassModal({
  isOpen,
  onClose,
  onSuccess,
}: JoinClassModalProps) {
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [joiningClass, setJoiningClass] = useState(false);

  if (!isOpen) return null;

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      setJoinError("Wprowadź kod klasy.");
      return;
    }

    try {
      setJoiningClass(true);
      setJoinError("");
      setJoinSuccess("");

      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/student/classes/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.detail || "Nie udało się dołączyć do klasy.");
        return;
      }

      setJoinSuccess(data.message || "Pomyślnie dołączono do klasy!");
      setJoinCodeInput("");
      await onSuccess();
      setTimeout(() => {
        onClose();
        setJoinSuccess("");
      }, 1400);
    } catch (err: any) {
      setJoinError(err.message || "Błąd połączenia z serwerem.");
    } finally {
      setJoiningClass(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !joiningClass) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          border: '3px solid #000000',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '8px 8px 0px 0px #000000',
          position: 'relative',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--neo-yellow)',
                border: '2px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
              }}
            >
              🏫
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, textTransform: 'uppercase', color: '#000000', margin: 0 }}>
                Dołącz do klasy
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: 0, fontWeight: 600 }}>
                Wpisz unikalny kod od korepetytora
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !joiningClass && onClose()}
            style={{
              width: '28px',
              height: '28px',
              border: '2px solid #000',
              borderRadius: '6px',
              background: '#f3f4f6',
              cursor: 'pointer',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleJoinClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', color: '#111827' }}>
              Kod klasy
            </label>
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => {
                setJoinCodeInput(e.target.value.toUpperCase());
                setJoinError("");
              }}
              placeholder="np. MATH89XY"
              maxLength={10}
              autoFocus
              disabled={joiningClass}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textAlign: 'center',
                border: '2.5px solid #000000',
                borderRadius: '10px',
                background: 'var(--bg-deep)',
                boxShadow: '3px 3px 0px 0px #000000',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {joinError && (
            <div
              style={{
                padding: '8px 10px',
                background: '#fee2e2',
                border: '2px solid #b91c1c',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '0.75rem',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {joinError}
            </div>
          )}

          {joinSuccess && (
            <div
              style={{
                padding: '8px 10px',
                background: '#dcfce7',
                border: '2px solid #15803d',
                borderRadius: '8px',
                color: '#166534',
                fontSize: '0.75rem',
                fontWeight: 800,
                textAlign: 'center',
              }}
            >
              ✓ {joinSuccess}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={joiningClass}
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid #000000',
                borderRadius: '9px',
                background: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px 0px #000',
              }}
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={joiningClass || !joinCodeInput.trim()}
              style={{
                flex: 1.5,
                padding: '10px',
                border: '2px solid #000000',
                borderRadius: '9px',
                background: joiningClass ? '#d1d5db' : 'var(--neo-green)',
                fontWeight: 900,
                fontSize: '0.82rem',
                cursor: joiningClass || !joinCodeInput.trim() ? 'not-allowed' : 'pointer',
                boxShadow: '3px 3px 0px 0px #000',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                transition: 'all 0.15s ease',
              }}
            >
              {joiningClass ? 'Dołączanie...' : 'Dołącz do klasy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
