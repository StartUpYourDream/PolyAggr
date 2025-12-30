/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主背景色
        dark: {
          900: '#0a0b0d',
          800: '#12141a',
          700: '#1a1d24',
          600: '#22262f',
        },
        // 主色调 - 浅绿色
        primary: {
          DEFAULT: '#00d395',
          50: '#e6fff7',
          100: '#b3ffe6',
          200: '#80ffd4',
          300: '#4dffc3',
          400: '#1affb1',
          500: '#00d395',
          600: '#00a676',
          700: '#007a57',
          800: '#004d38',
          900: '#002119',
        },
        // 红色 - 用于下跌/卖出
        danger: {
          DEFAULT: '#ff4757',
          light: '#ff6b7a',
        },
        // 绿色 - 用于上涨/买入
        success: {
          DEFAULT: '#00d395',
          light: '#00e6a4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
