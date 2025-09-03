/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { 
    extend: {
      colors: {
        'nushu': {
          'terracotta': '#AF5F54',
          'sage': '#3B4E3D',
          'cream': '#FAF9F7',
          'warm-white': '#FEFDFB'
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'Times New Roman', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
      }
    }
  },
  plugins: [],
}
