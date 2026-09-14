/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        win: {
          bg: '#f3f3f3',
          card: '#ffffff',
          border: '#e5e5e5',
          hover: '#e8e8e8',
          active: '#0078d4',
          darkBg: '#1e1e1e',
          darkCard: '#252526',
          darkBorder: '#333333',
          darkHover: '#2a2d2e',
        },
        finder: {
          sidebar: '#f6f6f6',
          column: '#ffffff',
          darkSidebar: '#212224',
          darkColumn: '#1e1e1e',
          selection: '#0062d2',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
