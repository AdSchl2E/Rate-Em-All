const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Pas d'extension des couleurs pour éviter les problèmes
      scale: {
        '115': '1.15',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'confetti-1': 'confetti 5s ease-in-out infinite',
        'confetti-2': 'confetti 7s ease-in-out infinite 0.5s',
        'confetti-3': 'confetti 4s ease-in-out infinite 1s',
        'confetti-4': 'confetti 6s ease-in-out infinite 1.5s',
        'confetti-5': 'confetti 8s ease-in-out infinite 2s',
        'confetti-6': 'confetti 5.5s ease-in-out infinite 2.5s',
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 0 },
          '10%': { transform: 'translateY(-25px) rotate(45deg)', opacity: 1 },
          '50%': { transform: 'translateY(-100px) translateX(100px) rotate(90deg)', opacity: 0.5 },
          '100%': { transform: 'translateY(-200px) translateX(-100px) rotate(180deg)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}