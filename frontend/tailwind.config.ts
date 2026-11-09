import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas-bg)",
        surface: {
          DEFAULT: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          elevated: "var(--surface-elevated)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: {
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        atelier: {
          obsidian: "#101D19",
          "deep-forest": "#173E35",
          deepForest: "#173E35",
          forest: "#1D5948",
          citron: "#D9EF71",
          porcelain: "#F4F3ED",
          sage: "#B6D8C8",
          slate: "#65736B",
          terracotta: "#C68B68",
          mist: "#DCE2DA",
        },
        brand: {
          action: "var(--action-primary)",
          "action-hover": "var(--action-primary-hover)",
          forest: "var(--brand-forest)",
          citron: "var(--brand-citron)",
          sage: "var(--brand-sage)",
          terracotta: "var(--brand-terracotta)",
          navy: "var(--brand-forest)", // Backward-compatible alias
          "navy-light": "var(--action-primary-hover)",
        },
        teal: {
          intelligence: "var(--brand-forest)",
          "intelligence-light": "var(--surface-secondary)",
        },
        gold: {
          DEFAULT: "var(--brand-citron)",
          light: "var(--surface-secondary)",
        },
        sidebar: {
          bg: "var(--sidebar-bg)",
          surface: "var(--sidebar-surface)",
          text: "var(--sidebar-text)",
          muted: "var(--sidebar-muted)",
        },
        status: {
          critical: "var(--status-critical)",
          "critical-bg": "var(--status-critical-bg)",
          warning: "var(--status-warning)",
          "warning-bg": "var(--status-warning-bg)",
          success: "var(--status-success)",
          "success-bg": "var(--status-success-bg)",
          info: "var(--status-info)",
          "info-bg": "var(--status-info-bg)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "BubbledotICG-FinePos", "Geist Pixel Circle", "monospace"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        mono: ["var(--font-ibm-plex-mono)", "Menlo", "Courier New", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(16, 29, 25, 0.04), 0 1px 2px 0 rgba(16, 29, 25, 0.02)",
        elevated: "0 10px 25px -3px rgba(16, 29, 25, 0.08), 0 4px 6px -2px rgba(16, 29, 25, 0.03)",
        card: "0 0 0 1px var(--border-subtle), 0 2px 8px 0 rgba(16, 29, 25, 0.03)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
