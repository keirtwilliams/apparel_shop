/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF9F7',
        surface: '#F2F1EE',
        'surface-subtle': '#EAE9E5',
        primary: '#1C1C1B',
        muted: '#575654',
        border: '#E5E4E0',
        success: '#2E5A44',
        'success-light': '#E9F1EC',
        danger: '#9E3B33',
        'danger-light': '#F8ECEB',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        tight: '6px',
        card: '8px',
        input: '4px',
      },
      aspectRatio: {
        '4/5': '4 / 5',
      }
    },
  },
  plugins: [],
}
