/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366F1', light: '#818CF8', dark: '#4F46E5' },
        accent: { DEFAULT: '#10B981', light: '#34D399', dark: '#059669' },
      },
    },
  },
  plugins: [],
}
