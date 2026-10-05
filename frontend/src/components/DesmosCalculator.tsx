"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        element: HTMLElement,
        options?: Record<string, any>
      ) => {
        destroy: () => void;
        resize: () => void;
        [key: string]: any;
      };
    };
  }
}

interface DesmosCalculatorProps {
  isVisible?: boolean;
}

export default function DesmosCalculator({ isVisible = true }: DesmosCalculatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calculatorInstanceRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Check if Desmos was already loaded (e.g. from previous navigation or cached script)
  useEffect(() => {
    if (typeof window !== "undefined" && window.Desmos) {
      setScriptLoaded(true);
    }
  }, []);

  // Initialize Desmos calculator instance once script is ready and DOM ref is attached
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || calculatorInstanceRef.current) {
      return;
    }

    if (window.Desmos?.GraphingCalculator) {
      calculatorInstanceRef.current = window.Desmos.GraphingCalculator(
        containerRef.current,
        {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
        }
      );
    }

    // Proper cleanup on unmount: destroy calculator instance to free resources
    return () => {
      if (calculatorInstanceRef.current) {
        calculatorInstanceRef.current.destroy();
        calculatorInstanceRef.current = null;
      }
    };
  }, [scriptLoaded]);

  // Observe container size changes (drawer opening, maximizing, screen resize)
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      calculatorInstanceRef.current?.resize();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [scriptLoaded]);

  // When drawer becomes visible, notify Desmos to resize and recalculate canvas coordinates
  useEffect(() => {
    if (isVisible && calculatorInstanceRef.current) {
      const timer = setTimeout(() => {
        calculatorInstanceRef.current?.resize();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div className="relative w-full h-full flex flex-col flex-1 min-h-0 bg-white">
      <Script
        src="https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      {!scriptLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-card)] text-[var(--text-subtle)] gap-3 z-10">
          <div className="w-8 h-8 border-3 border-[var(--accent-main)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Inicjalizacja kalkulatora graficznego</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full flex-1 min-h-0"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
