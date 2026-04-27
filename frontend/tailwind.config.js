/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      boxShadow: {
        'glow-indigo': '0 0 24px rgba(99,102,241,0.35), 0 0 48px rgba(99,102,241,0.12)',
        'glow-blue':   '0 0 24px rgba(59,130,246,0.35)',
        'glow-green':  '0 0 16px rgba(34,197,94,0.3)',
      },
      animation: {
        'fade-in':    'fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'blob':       'floatBlob 12s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}
