/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bordeaux: '#6B0F1A',
        'deep-rose': '#8B1A2B',
        'sexy-fuchsia': '#E879F9',
        'electric-blue': '#3B82F6',
        'deep-purple': '#8B5CF6',
        'fire-red': '#EF4444',
        'hot-cyan': '#22D3EE',
        'warm-pink': '#B42850',
      },
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeSlideIn 0.6s ease-out forwards',
        'breath-pulse': 'breathPulse 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
        'particle-float': 'particleFloat 6s ease-in-out infinite',
        'fade-in-slow': 'fadeSlideIn 1.2s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        breathPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(180,40,80,0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(180,40,80,0.6)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.15)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.1)' },
        },
        particleFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.3' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)', opacity: '0.7' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
}
