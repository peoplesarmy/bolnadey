/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-unbounded)', 'sans-serif'],
        body: ['var(--font-outfit)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      colors: {
        bg: { DEFAULT: '#04040A', 2: '#08080F', 3: '#0E0E18', 4: '#14141F', 5: '#1C1C28' },
        brand: { red: '#FF0A16', pink: '#FF4D88', cyan: '#00F0FF', yellow: '#FFD60A', purple: '#C77DFF', green: '#00E676', orange: '#FF6D00' },
      },
      animation: {
        shimmer: 'shimmer 8s linear infinite',
        float: 'float 4s ease-in-out infinite',
        pulse2: 'pulse2 1.4s ease-in-out infinite',
        ticker: 'ticker 25s linear infinite',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '200% center' }, '100%': { backgroundPosition: '-200% center' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulse2: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
        ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
};
