/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  corePlugins: {
    preflight: false, // Disable Tailwind's CSS reset
  },
  theme: {
    extend: {},
  },
  plugins: [],
};