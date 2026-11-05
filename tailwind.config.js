/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121212',
          surface: '#18181b',
          card: '#1e1e24',
          border: '#27272a',
          hover: '#2f2f36',
          muted: '#71717a',
          text: '#f4f4f5',
          subtext: '#a1a1aa'
        },
        meal: {
          breakfast: {
            bg: 'rgba(249, 115, 22, 0.15)',
            text: '#fb923c',
            border: 'rgba(249, 115, 22, 0.35)',
            solid: '#f97316'
          },
          lunch: {
            bg: 'rgba(59, 130, 246, 0.15)',
            text: '#60a5fa',
            border: 'rgba(59, 130, 246, 0.35)',
            solid: '#3b82f6'
          },
          dinner: {
            bg: 'rgba(34, 197, 94, 0.15)',
            text: '#4ade80',
            border: 'rgba(34, 197, 94, 0.35)',
            solid: '#22c55e'
          }
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
