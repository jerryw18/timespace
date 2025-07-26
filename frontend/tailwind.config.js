/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base color: oklch(0.278 0.033 256.848)
        primary: {
          50: 'oklch(0.95 0.01 256.848)',   // Very light
          100: 'oklch(0.9 0.015 256.848)',  // Light
          200: 'oklch(0.8 0.02 256.848)',   // Light-medium
          300: 'oklch(0.7 0.025 256.848)',  // Medium-light
          400: 'oklch(0.6 0.03 256.848)',   // Medium
          500: 'oklch(0.5 0.035 256.848)',  // Medium-dark
          600: 'oklch(0.4 0.04 256.848)',   // Dark-medium
          700: 'oklch(0.35 0.045 256.848)', // Dark
          800: 'oklch(0.278 0.033 256.848)', // Base color (header/timeline)
          900: 'oklch(0.2 0.025 256.848)',  // Very dark
          950: 'oklch(0.1 0.015 256.848)',  // Darkest
        },
        // Accent colors - cyan family for highlights
        accent: {
          100: 'oklch(0.9 0.05 195)',      // Light cyan
          200: 'oklch(0.8 0.08 195)',      // Medium-light cyan
          300: 'oklch(0.7 0.12 195)',      // Medium cyan
          400: 'oklch(0.6 0.15 195)',      // Bright cyan (current cyan-400)
          500: 'oklch(0.5 0.18 195)',      // Dark cyan
          600: 'oklch(0.4 0.15 195)',      // Darker cyan
        },
        // Neutral grays that complement the primary
        neutral: {
          50: 'oklch(0.98 0.002 256.848)',
          100: 'oklch(0.95 0.003 256.848)',
          200: 'oklch(0.9 0.005 256.848)',
          300: 'oklch(0.8 0.008 256.848)',
          400: 'oklch(0.7 0.01 256.848)',
          500: 'oklch(0.6 0.012 256.848)',
          600: 'oklch(0.5 0.015 256.848)',
          700: 'oklch(0.4 0.018 256.848)',
          800: 'oklch(0.3 0.02 256.848)',
          900: 'oklch(0.2 0.015 256.848)',
          950: 'oklch(0.1 0.01 256.848)',
        }
      }
    },
  },
  plugins: [],
}