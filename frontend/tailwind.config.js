/**
 * tailwind.config.js — Big Shawerma brand color system.
 *
 * Tailwind CSS v3.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        brand: {
          yellow: '#FFB800',
          'yellow-dark': '#E8A000',
          red: '#CC1F1F',
          'red-bright': '#E63030',
          black: '#1A1A1A',
          orange: '#FF6B00',
        },
        bg: {
          dark: '#111111',
          card: '#1E1E1E',
          light: '#FFF8E7',
          'card-light': '#F9F4E8',
        },
        status: {
          active: '#22C55E',
          redeemed: '#9CA3AF',
          expired: '#EF4444',
        },
        prize: {
          meal: '#CC1F1F',
          discount: '#FFB800',
          delivery: '#3B82F6',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease both',
        'count-up': 'countUp 0.6s ease both',
        'pulse-green': 'pulse-green 2s infinite',
        shake: 'shake 0.5s ease',
        'scale-in': 'scaleIn 0.25s ease both',
        'confetti-fall': 'confettiFall 1.5s linear forwards',
        'draw-check': 'drawCheck 0.6s ease forwards',
      },
    },
  },
  plugins: [],
};
