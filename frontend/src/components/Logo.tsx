"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  href?: string;
  className?: string;
  showSubtitle?: boolean;
}

export default function Logo({
  size = "lg",
  href = "/",
  className = "",
}: LogoProps) {
  // Configured dimensions preserving the original 283:336 aspect ratio
  const config = {
    sm: { width: 75, height: 88, classH: "h-[88px]" },
    md: { width: 98, height: 116, classH: "h-[116px]" },
    lg: { width: 126, height: 150, classH: "h-[150px]" },
    xl: { width: 165, height: 195, classH: "h-[195px]" },
    "2xl": { width: 220, height: 260, classH: "h-[260px]" },
  }[size];

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center group select-none transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98] ${className}`}
      title="MatGraph — Twoja interaktywna mapa do matury"
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient reactive neon glow aura */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-[#38bdf8]/25 via-[#4cd39b]/30 to-[#facc15]/15 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />

        {/* The MatGraph Logo Image */}
        <Image
          src="/logo_transparent.png"
          alt="MatGraph — Twoja interaktywna mapa do matury"
          width={config.width}
          height={config.height}
          priority
          className={`${config.classH} w-auto object-contain drop-shadow-[0_4px_20px_rgba(76,211,155,0.4)] transition-all duration-300 group-hover:drop-shadow-[0_6px_28px_rgba(56,189,248,0.65)]`}
        />
      </div>
    </Link>
  );
}
