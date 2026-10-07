import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        heading: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        node: ["var(--font-node)", "Outfit", "var(--font-jakarta)", "sans-serif"],
      },
      colors: {
        // Base backgrounds & surfaces
        'bg-main': 'var(--bg-main)',
        'dark-bg': 'var(--bg-dark)',
        'card-bg': 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        'surface-bg': 'var(--bg-surface)',
        'deep-bg': 'var(--bg-deep)',
        'border-dark': 'var(--border-dark)',
        'border-subtle': 'var(--border-subtle)',
        'border-main': 'var(--border-main)',

        // Typography
        'text-main': 'var(--text-main)',
        'text-subtle': 'var(--text-subtle)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
        'text-inverse': 'var(--text-inverse)',

        // Signature Neobrutalism palette
        'neo-yellow': 'var(--neo-yellow)',
        'neo-green': 'var(--neo-green)',
        'neo-blue': 'var(--neo-blue)',
        'neo-pink': 'var(--neo-pink)',
        'neo-purple': 'var(--neo-purple)',
        'neo-orange': 'var(--neo-orange)',
        'neo-cream': 'var(--neo-cream)',
        'neo-white': 'var(--neo-white)',
        'neo-black': 'var(--neo-black)',

        // Accent & graph mappings
        'accent-main': 'var(--accent-main)',
        'accent-hover': 'var(--accent-hover)',
        'accent-dark': 'var(--accent-dark)',
        'accent-yellow': 'var(--accent-yellow)',
        'node-green': 'var(--node-green)',
        'node-yellow': 'var(--node-yellow)',
        'edge-emerald': 'var(--edge-emerald)',
        'edge-color': 'var(--edge-color)',

        // Status states
        'success-bg': 'var(--success-bg)',
        'success-border': 'var(--success-border)',
        'success-text': 'var(--success-text)',
        'success-highlight': 'var(--success-highlight)',
        'error-bg': 'var(--error-bg)',
        'error-border': 'var(--error-border)',
        'error-text': 'var(--error-text)',
        'error-highlight': 'var(--error-highlight)',
        'selected-bg': 'var(--selected-bg)',
        'selected-text': 'var(--selected-text)',
        'disabled-bg': 'var(--disabled-bg)',
      },
      boxShadow: {
        'neo-xs': '1px 1px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo': '4px 4px 0px 0px #000000',
        'neo-md': '5px 5px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
        'neo-2xl': '12px 12px 0px 0px #000000',
      },
      borderWidth: {
        '2.5': '2.5px',
        '3': '3px',
      },
    },
  },
  plugins: [],
};

export default config;
