import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FCFBF9',
        'sky-blue': '#7FB3FF',
        turquoise: '#4FD1C5',
        lavender: '#C7B6FF',
        peach: '#FFD3B6',
        coral: '#FF9E80',
        ink: '#1A1B25',
        muted: '#6B6F80',
        'sky-light': '#EEF5FF',
        'turquoise-light': '#E6FAF8',
        'lavender-light': '#F3F0FF',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-sky': 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 100%)',
        'gradient-lavender': 'linear-gradient(135deg, #C7B6FF 0%, #FFD3B6 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, #EEF5FF 0px, transparent 50%), radial-gradient(at 80% 0%, #F3F0FF 0px, transparent 50%), radial-gradient(at 0% 50%, #E6FAF8 0px, transparent 50%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(127, 179, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
        'glass-lg': '0 20px 60px rgba(127, 179, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
        'card': '0 4px 24px rgba(26, 27, 37, 0.06)',
        'card-hover': '0 16px 48px rgba(26, 27, 37, 0.12)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'blob': {
          '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'fade-in': 'fade-in 0.4s ease forwards',
        'marquee': 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
