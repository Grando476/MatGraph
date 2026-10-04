import Link from "next/link";

interface LogoProps {
  size?: "md" | "lg" | "xl";
  href?: string;
  showSubtitle?: boolean;
  className?: string;
}

export default function Logo({
  size = "lg",
  href = "/",
  showSubtitle = false,
  className = "",
}: LogoProps) {
  // Dimension definitions for drastic enlargement
  const config = {
    md: {
      iconBox: "w-10 h-10 text-xl rounded-xl",
      text: "text-2xl",
      gap: "gap-2.5",
      subtitle: "text-[9px] tracking-[0.2em]",
    },
    lg: {
      iconBox: "w-13 h-13 min-w-[52px] min-h-[52px] text-2xl rounded-2xl",
      text: "text-3xl sm:text-[2rem]",
      gap: "gap-3.5",
      subtitle: "text-[10px] tracking-[0.25em]",
    },
    xl: {
      iconBox: "w-16 h-16 min-w-[64px] min-h-[64px] text-3xl rounded-2xl",
      text: "text-4xl sm:text-[2.6rem]",
      gap: "gap-4",
      subtitle: "text-xs tracking-[0.3em]",
    },
  }[size];

  return (
    <Link
      href={href}
      className={`inline-flex items-center ${config.gap} group select-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${className}`}
      title="EduMath — Powrót do strony głównej"
    >
      {/* Drastically enlarged glowing mathematical Sigma Badge */}
      <div
        className={`${config.iconBox} flex items-center justify-center font-serif font-black relative overflow-hidden transition-all duration-300 group-hover:border-[var(--accent-hover)]`}
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)",
          border: "2px solid var(--accent-main)",
          boxShadow: "0 0 22px rgba(56, 189, 248, 0.4), inset 0 0 14px rgba(56, 189, 248, 0.15)",
        }}
      >
        {/* Subtle cyber background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-main)]/15 via-transparent to-[var(--node-yellow)]/10 opacity-70 pointer-events-none" />

        {/* Sigma character */}
        <span
          className="relative z-10 text-[var(--accent-main)] transition-colors duration-300 group-hover:text-[var(--text-main)]"
          style={{
            textShadow: "0 0 10px rgba(56, 189, 248, 0.7)",
            lineHeight: 1,
            display: "inline-block",
            transform: "translateY(-1px)",
          }}
        >
          ∑
        </span>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`${config.text} font-black tracking-tight text-[var(--text-main)] font-sans drop-shadow-sm flex items-center`}
        >
          <span>Edu</span>
          <span
            className="text-[var(--accent-main)] transition-colors duration-300 group-hover:text-[var(--accent-hover)]"
            style={{
              textShadow: "0 0 18px rgba(56, 189, 248, 0.5)",
            }}
          >
            Math
          </span>
        </span>
        {showSubtitle && (
          <span
            className={`${config.subtitle} font-mono uppercase text-[var(--text-muted)] font-semibold mt-1 transition-colors group-hover:text-[var(--text-subtle)]`}
          >
            Graf Wiedzy
          </span>
        )}
      </div>
    </Link>
  );
}
