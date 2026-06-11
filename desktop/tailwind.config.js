/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override the default blue palette with our custom teal palette
        blue: {
          50: '#D7EAEE',   // Lightest (Backgrounds/hovers)
          100: '#D7EAEE',
          200: '#9FD8E1',  // Light sky blue
          300: '#9CD1CE',  // Mint teal
          400: '#61BACA',  // Light medium teal
          500: '#3EAEB1',  // Medium teal (Primary action)
          600: '#1D837F',  // Dark teal (Primary brand/dark accents)
          700: '#1D837F',
          800: '#11504E',  // Darker shade for deeper contrasts
          900: '#11504E',
        },
        // Also override indigo to map to our teal tones so gradients (blue-to-indigo) work nicely
        indigo: {
          50: '#D7EAEE',
          100: '#9CD1CE',
          200: '#9FD8E1',
          300: '#61BACA',
          400: '#3EAEB1',
          500: '#3EAEB1',
          600: '#1D837F',
          700: '#1D837F',
          800: '#11504E',
          900: '#11504E',
        }
      }
    },
  },
  plugins: [],
}
