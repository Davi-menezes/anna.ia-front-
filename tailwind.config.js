/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./index.tsx",
    "./src/**/*.{html,ts,tsx,css}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'futuristic-bg': '#f0f4f8',
        'futuristic-primary': '#4f46e5',
        'futuristic-secondary': '#7c3aed',
        'futuristic-text': '#0f172a',
        'futuristic-subtext': '#64748b',
        'dark-bg': '#0f172a',
        'dark-text': '#f1f5f9',
        'dark-subtext': '#94a3b8',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'progress-indefinite': 'progress-indefinite 2s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: 0.7 },
          '50%': { opacity: 1 },
        },
        'progress-indefinite': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [],
}
