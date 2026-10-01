import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduMath — Graf Wiedzy i Relacji Matematycznych",
  description: "Platforma wizualizacji zależności między pojęciami matematycznymi, analizy luk wiedzy i interaktywnej edukacji akademickiej.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} font-sans bg-[var(--bg-dark)] text-[var(--text-main)] antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

