/** @type {import('tailwindcss').Config} */
import tailwindAnimate from 'tailwindcss-animate';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can define your custom animations here if you want them
      // to be accessible via standard Tailwind classes (e.g., animate-bloom)
      keyframes: {
        archiveBloom: {
          '0%, 100%': { textShadow: '0 0 0px transparent', color: '#1a1a1a' },
          '50%': { textShadow: '0 0 10px rgba(147, 197, 253, 0.9)', color: '#2563eb' },
        },
        slideOutLeft: {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(-100vw)', opacity: '0' },
        },
        slideInRight: {
          from: { transform: 'translateX(100vw)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        bloom: 'archiveBloom 3s ease-in-out infinite',
        'flip-next': 'slideOutLeft 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'flip-in': 'slideInRight 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
    },
  },
  plugins: [
    tailwindAnimate,
  ],
}