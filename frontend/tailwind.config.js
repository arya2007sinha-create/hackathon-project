/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        card: '#FFFFFF',
        primary: {
          DEFAULT: '#17202A',
          subtle: '#2D3748',
        },
        secondary: '#667085',
        border: '#E5E7EB',
        accent: {
          DEFAULT: '#4338CA', // Indigo
          hover: '#3730A3',
          light: '#EEF2FF',
        },
        status: {
          healthy: '#10B981', // Muted green
          healthyBg: '#ECFDF5',
          healthyBorder: '#A7F3D0',
          attention: '#F59E0B', // Muted orange
          attentionBg: '#FFFBEB',
          attentionBorder: '#FDE68A',
          critical: '#EF4444', // Muted red
          criticalBg: '#FEF2F2',
          criticalBorder: '#FECACA',
          info: '#3B82F6', // Muted blue
          infoBg: '#EFF6FF',
          infoBorder: '#BFDBFE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
      },
      transitionDuration: {
        'default': '200ms',
      }
    },
  },
  plugins: [],
}
