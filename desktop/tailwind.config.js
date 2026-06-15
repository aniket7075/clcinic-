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
          50: '#F0F4F8',   // Lightest (Backgrounds/hovers)
          100: '#D9E2EC',
          200: '#BCCCDC',  // Light silver blue
          300: '#9FB3C8',  
          400: '#8F9EAB',  // Q DENT Silver Gray
          500: '#2A3F5F',  // Lighter Navy
          600: '#0F203C',  // Q DENT Navy Blue (Primary brand/action)
          700: '#0B182D',  
          800: '#07101E',  // Darker shade for deeper contrasts
          900: '#04080F',
        },
        // Also override indigo to map to our silver/navy tones
        indigo: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#8F9EAB',  // Q DENT Silver Gray
          500: '#486581',
          600: '#334E68',
          700: '#243B53',
          800: '#102A43',
          900: '#0F203C',  // Q DENT Navy Blue
        }
      }
    },
  },
  plugins: [],
}
