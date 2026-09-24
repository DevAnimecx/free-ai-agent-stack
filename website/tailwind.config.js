/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  // FR-W-12: dark mode follows the OS setting. There is no toggle in MVP, which
  // is why this is `media` and not `class` — a toggle would need a cookie.
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        // Trust colours for the verified badge (PRD §10.3).
        trust: {
          fresh: "#16a34a",
          aging: "#d97706",
          stale: "#dc2626",
        },
      },
      maxWidth: { prose: "68ch" },
    },
  },
  plugins: [],
};
