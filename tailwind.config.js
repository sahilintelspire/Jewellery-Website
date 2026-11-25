/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F4ECE4',
          300: '#EDE2D6',
          400: '#DFD0C0',
          500: '#CDB9A5',
        },
        rosequartz: {
          50: '#FCF8F7',
          100: '#F9EEEB',
          200: '#F3DAD5',
          300: '#ECC3BC',
          400: '#DF9F95',
          500: '#D27F73',
        },
        gold: {
          50: '#FDFCF7',
          100: '#FAF6EA',
          200: '#F3E8C9',
          300: '#E9D69F',
          400: '#DEC272',
          500: '#D4AF37',
          600: '#B89326',
          700: '#94741B',
          800: '#6E5513',
          900: '#4D3B0B',
        },
        pearl: '#FAF9F6',
        obsidian: '#151413',
        espresso: '#2C2724',
        silk: '#F5ECE3',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(212, 175, 55, 0.15)',
        'soft-glow': '0 0 35px rgba(212, 175, 55, 0.25)',
        'card-lift': '0 25px 50px -12px rgba(44, 39, 36, 0.08)',
        'rose-glow': '0 0 40px rgba(243, 218, 213, 0.4)',
      },
      animation: {
        'float-slow': 'floating 6s ease-in-out infinite',
        'shimmer': 'shimmer 8s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        floating: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
