/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          700: '#374151',
          800: '#1f2937',
        },
        success: { 100: '#dcfce7', 500: '#16a34a', 700: '#15803d' },
        warning: { 100: '#fef9c3', 500: '#eab308', 700: '#b45309' },
        danger: { 100: '#fee2e2', 500: '#ef4444', 700: '#b91c1c' },
        purple: { 100: '#ede9fe', 500: '#8b5cf6', 700: '#6d28d9' },
        indigo: { 100: '#e0e7ff' },
        /* Semantic status colors (single shade: 500) for simple usage */
           new : '#374151',
       newLight :"#9ba2ab",
waiting : '#815420',
waitingLight : '#fef08a',
approved : '#1d5b35',
approvedLight : '#bbf7d0',
 inreview : '#312e81',
 inreviewLight : '#c7d2fe',
preparing : '#6c3698',
preparingLight : '#e9d5ff',
paid : '#1d5b35',
paidLight : '#bbf7d0',
rejected : '#8a2c2c',
rejectedLight : '#fecaca',
      },
    },
  },
  plugins: [],
}