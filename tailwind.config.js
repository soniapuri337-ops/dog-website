/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        paper: '#FCFAF6',   // warm white, the page ground
        cream: '#F6F1E8',   // soft cream, used sparingly
        sage: '#E8F0E6',    // pale green ground
        blush: '#FAEDF0',   // pale pink ground
        moss: {
          DEFAULT: '#2C6E4B', // primary green
          soft: '#5B9B77',
          deep: '#1F5238',
        },
        rose: {
          DEFAULT: '#D4708A', // decorative pink
          ink: '#A8415F',     // text safe pink
          soft: '#F2CBD6',
        },
        ink: {
          DEFAULT: '#24352C', // deep green charcoal, never pure black
          soft: '#5A6B60',
          faint: '#8A968E',
        },
      },
      fontFamily: {
        // The metric-matched fallback faces sit directly after the webfont, so
        // the swap from fallback to real font barely moves a line.
        display: ['Fraunces', 'Fraunces Fallback', 'Iowan Old Style', 'Georgia', 'Cambria', 'serif'],
        sans: [
          '"Nunito Sans"',
          'Nunito Fallback',
          'ui-sans-serif',
          'system-ui',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        base: ['1.0625rem', { lineHeight: '1.7' }],
        lg: ['1.1875rem', { lineHeight: '1.68' }],
        xl: ['1.3125rem', { lineHeight: '1.6' }],
      },
      borderRadius: { xl2: '1.75rem', xl3: '2.25rem' },
      boxShadow: {
        soft: '0 2px 4px rgba(36,53,44,.03), 0 12px 28px -12px rgba(36,53,44,.10)',
        lift: '0 6px 12px rgba(36,53,44,.05), 0 28px 56px -24px rgba(36,53,44,.20)',
        pill: '0 4px 24px rgba(36,53,44,.14)',
      },
      maxWidth: { measure: '62ch' },
    },
  },
  plugins: [],
};
