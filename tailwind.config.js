/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        arcade: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        arcade: {
          dark: '#0f172a',
          card: '#1e293b',
          primary: '#6366f1',
          accent: '#8b5cf6',
          success: '#22c55e',
          danger: '#ef4444',
          neon: '#00f3ff'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}