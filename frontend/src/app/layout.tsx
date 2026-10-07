import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const nodeFont = Outfit({
  subsets: ["latin"],
  variable: "--font-node",
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MatGraph — Interaktywna Mapa do Matury | Graf Wiedzy",
  description: "Platforma wizualizacji zależności między pojęciami matematycznymi, analizy luk wiedzy i interaktywnej edukacji maturalnej.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${plusJakartaSans.variable} ${nodeFont.variable}`}>
      <body className={`${plusJakartaSans.className} font-sans bg-[var(--bg-main)] text-[var(--text-main)] antialiased min-h-screen selection:bg-[var(--neo-yellow)] selection:text-[var(--text-main)]`}>
        {children}
      </body>
    </html>
  );
}
