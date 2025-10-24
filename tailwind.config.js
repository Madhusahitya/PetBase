/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pet-blue': '#0052FF',
        'pet-green': '#00D4AA',
        'pet-purple': '#8B5CF6',
        'pet-pink': '#F59E0B',
      },
      fontFamily: {
        'pet': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
