/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // El verde exacto de la lata neón
        neon: "#00FF00",
      },
      boxShadow: {
        // El resplandor que ves en los botones de la foto
        'neon': '0 0 5px #00FF00, 0 0 20px rgba(0, 255, 0, 0.3)',
      },
      dropShadow: {
        // Para que el texto "brille"
        'neon': '0 0 8px #00FF00',
      }
    },
  },
  plugins: [],
}