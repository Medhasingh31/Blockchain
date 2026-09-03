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
        // FeedChain premium palette
        beige: {
          50:  '#f5efe7',
          100: '#ede3d6',
          200: '#d6cbbf',
          300: '#c8b8a2',
          400: '#b8b0a5',
          500: '#c8a96a',  // warm gold
          600: '#a8894a',
        },
        ink: {
          900: '#0a0a0a',
          800: '#0f0f0f',
          700: '#111111',
          600: '#1a1a1a',
          500: '#2a2a2a',
          400: '#3a3a3a',
        },
      },
      boxShadow: {
        'glow-gold':  '0 0 20px rgba(200,169,106,0.15), 0 0 40px rgba(200,169,106,0.06)',
        'glow-beige': '0 0 20px rgba(214,203,191,0.12)',
        'glow-green': '0 0 14px rgba(34,197,94,0.18)',
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
