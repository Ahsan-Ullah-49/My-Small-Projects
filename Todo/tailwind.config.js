/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { head: ['Syne','sans-serif'], body: ['DM Sans','sans-serif'] },
      colors: {
        app: {
          body: 'var(--bg-body)',
          card: 'var(--bg-card)',
          inner: 'var(--bg-inner)',
          hover: 'var(--bg-hover)',
          border: 'var(--border-std)',
          bhover: 'var(--border-hover)',
          main: 'var(--text-main)',
          sec: 'var(--text-sec)',
          muted: 'var(--text-muted)'
        }
      }
    },
  },
  plugins: [],
}
