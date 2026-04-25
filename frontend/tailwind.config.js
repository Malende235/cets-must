/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6eef7',
          100: '#c0d4ec',
          200: '#96b8de',
          300: '#6b9cd0',
          400: '#4a86c5',
          500: '#2971ba',
          600: '#1f5ea0',
          700: '#154a84',
          800: '#0a3668',
          900: '#003366',
        },
        gold: {
          50:  '#fff9e6',
          100: '#ffedb8',
          200: '#ffe08a',
          300: '#ffd35c',
          400: '#ffc92e',
          500: '#FFB800',
          600: '#d99c00',
          700: '#b38000',
          800: '#8c6400',
          900: '#664800',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,51,102,0.08)',
        'card-hover': '0 8px 30px rgba(0,51,102,0.15)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
