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
  href = "/graph",
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
      className={`inline-flex items-center justify-center group select-none transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0.5 ${className}`}
      title="MatGraph — Twoja interaktywna mapa do matury"
    >
      <div className="relative flex items-center justify-center">
        {/* Neobrutalist sticker badge effect */}
        <div
          className="absolute inset-0 bg-[var(--neo-yellow)] rounded-2xl -rotate-2 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-105 pointer-events-none -z-10 border-2 border-[var(--border-dark)] shadow-[3px_3px_0px_0px_#000]"
        />

        {/* The MatGraph Logo Image */}
        <Image
          src="/logo_transparent.png"
          alt="MatGraph — Twoja interaktywna mapa do matury"
          width={config.width}
          height={config.height}
          priority
          className={`${config.classH} w-auto object-contain filter drop-shadow-[3px_3px_0px_#000] transition-all duration-200 group-hover:scale-[1.03]`}
        />
      </div>
    </Link>
  );
}
