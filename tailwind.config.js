/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg:      '#07071a',
          surface: '#0d0d2b',
          blue:    '#0078d4',
          accent:  '#00a8ff',
          gold:    '#f0a500',
        },
      },
      fontFamily: {
        ps: ['\'Noto Sans Arabic\'', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'slide-up':   'slideUp 0.4s ease-out',
        'fade-in':    'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px #0078d4, 0 0 10px #0078d4' },
          '100%': { boxShadow: '0 0 15px #00a8ff, 0 0 30px #00a8ff' },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
