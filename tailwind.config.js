/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        bp: {
          'bg-sidebar': '#0e1a10',
          'bg-main': '#0b1208',
          'bg-card': '#162118',
          'bg-card-hover': '#1d2e22',
          'bg-input': '#162118',
          'accent': '#e63946',
          'accent-light': '#f28b8b',
          'accent-dim': '#b5212d',
          'accent-pink': '#e88ca5',
          'accent-green': '#4a7a4f',
          'accent-green-light': '#6ba36e',
          'text-primary': '#f5ede8',
          'text-secondary': '#a8b5a0',
          'text-muted': '#6b7e65',
          'border': '#253328',
          'border-subtle': '#1a2a1d',
        },
      },
    },
  },
  plugins: [],
}
