"use client";

import { useEffect, useRef, useState } from "react";

interface MathInputProps {
  value: string;
  onChange: (latex: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function MathInput({
  value,
  onChange,
  placeholder = "Wpisz odpowiedź...",
  disabled = false,
  className = "",
}: MathInputProps) {
  const mfRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // Dynamically load MathLive only on the client side (SSR-safe)
  useEffect(() => {
    let cancelled = false;
    import("mathlive").then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Configure the math-field once it's mounted and MathLive is loaded
  useEffect(() => {
    const mf = mfRef.current;
    if (!ready || !mf) return;

    // Desmos-like behavior: smart fences auto-size parentheses,
    // smart mode switches between math and text automatically
    mf.smartFence = true;
    mf.smartMode = true;

    // Virtual keyboard only on touch devices
    mf.virtualKeyboardMode = "manual";
  }, [ready]);

  // Sync external value changes into the field (e.g. reset)
  useEffect(() => {
    const mf = mfRef.current;
    if (!mf || !ready) return;
    if (mf.value !== value) {
      mf.setValue(value, { suppressChangeNotifications: true });
    }
  }, [value, ready]);

  // Handle read-only / disabled state
  useEffect(() => {
    const mf = mfRef.current;
    if (!mf || !ready) return;
    mf.readOnly = !!disabled;
  }, [disabled, ready]);

  return (
    <math-field
      ref={mfRef}
      onInput={(e: any) => {
        if (!disabled) {
          onChange(e.target.value);
        }
      }}
      style={{
        display: "block",
        width: "100%",
        padding: "0.75rem 1rem",
        fontSize: "1.125rem",
        fontWeight: 700,
        borderRadius: "0.75rem",
        border: "2px solid black",
        backgroundColor: disabled ? "#f3f4f6" : "white",
        boxShadow: "2px 2px 0px 0px #000",
        outline: "none",
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? "not-allowed" : "text",
        minHeight: "3rem",
      }}
      className={className}
    >
      {value}
    </math-field>
  );
}

