import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': 'var(--bg-dark)',
        'card-bg': 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        'surface-bg': 'var(--bg-surface)',
        'deep-bg': 'var(--bg-deep)',
        'border-dark': 'var(--border-dark)',
        'border-subtle': 'var(--border-subtle)',
        'text-main': 'var(--text-main)',
        'text-subtle': 'var(--text-subtle)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
        'accent-main': 'var(--accent-main)',
        'accent-hover': 'var(--accent-hover)',
        'accent-dark': 'var(--accent-dark)',
        'accent-yellow': 'var(--accent-yellow)',
        'node-green': 'var(--node-green)',
        'node-yellow': 'var(--node-yellow)',
        'edge-emerald': 'var(--edge-emerald)',
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
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

