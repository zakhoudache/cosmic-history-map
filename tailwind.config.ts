
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        galaxy: {
          core: 'hsl(var(--galaxy-core))',
          arm: 'hsl(var(--galaxy-arm))',
          dust: 'hsl(var(--galaxy-dust))',
          star: 'hsl(var(--galaxy-star))',
          'bright-star': 'hsl(var(--galaxy-bright-star))',
          nova: 'hsl(var(--galaxy-nova))',
          nebula: 'hsl(var(--galaxy-nebula))',
          void: 'hsl(var(--galaxy-void))',
          stardust: 'hsl(var(--galaxy-stardust))',
          'blue-giant': 'hsl(var(--galaxy-blue-giant))',
          'red-giant': 'hsl(var(--galaxy-red-giant))',
          'cosmic-ray': 'hsl(var(--galaxy-cosmic-ray))',
          wormhole: 'hsl(var(--galaxy-wormhole))'
        },
        aurora: {
          green: 'hsl(var(--aurora-green))',
          blue: 'hsl(var(--aurora-blue))',
          purple: 'hsl(var(--aurora-purple))',
          pink: 'hsl(var(--aurora-pink))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' }
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' }
        },
        'twinkle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' }
        },
        'twinkle-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' }
        },
        'twinkle-medium': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' }
        },
        'nebula-shift': {
          '0%': { transform: 'rotate(0) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' }
        },
        'galaxy-spin': {
          from: { transform: 'rotate(0) scale(1)' },
          to: { transform: 'rotate(360deg) scale(1.02)' }
        },
        'star-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px 2px rgba(255, 255, 255, 0.5)' },
          '50%': { opacity: '0.6', boxShadow: '0 0 10px 1px rgba(255, 255, 255, 0.3)' }
        },
        'cosmic-glow': {
          '0%, 100%': { boxShadow: '0 0 15px 2px hsla(var(--galaxy-nova), 0.4)' },
          '50%': { boxShadow: '0 0 25px 5px hsla(var(--galaxy-nova), 0.6)' }
        },
        'wormhole': {
          '0%': { transform: 'rotate(0) scale(1)' },
          '100%': { transform: 'rotate(360deg) scale(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'twinkle-medium': 'twinkle-medium 4s ease-in-out infinite',
        'twinkle-slow': 'twinkle-slow 6s ease-in-out infinite',
        'nebula-shift': 'nebula-shift 120s infinite alternate',
        'galaxy-spin': 'galaxy-spin 180s linear infinite',
        'star-pulse': 'star-pulse 4s ease-in-out infinite',
        'cosmic-glow': 'cosmic-glow 3s ease-in-out infinite',
        'wormhole': 'wormhole 10s cubic-bezier(0.65, 0, 0.35, 1) infinite'
      },
      backgroundImage: {
        'galaxy-spiral-gradient': 'radial-gradient(ellipse at center, hsl(var(--galaxy-core)), transparent 70%), conic-gradient(from 0deg, hsl(var(--galaxy-arm)/0.3), hsl(var(--galaxy-dust)/0.3), hsl(var(--galaxy-arm)/0.3))',
        'nebula-glow': 'radial-gradient(ellipse at center, hsl(var(--galaxy-nebula)/0.6), transparent 70%)',
        'stars-pattern': 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px), radial-gradient(circle at 40% 80%, white 1px, transparent 1px)',
        'stardust-pattern': 'radial-gradient(circle, transparent 20%, hsl(var(--galaxy-stardust)/0.05) 80%)',
        'cosmic-ray-gradient': 'linear-gradient(45deg, hsl(var(--galaxy-cosmic-ray)/0.1), transparent 70%)',
        'wormhole-gradient': 'radial-gradient(circle, hsl(var(--galaxy-wormhole)) 0%, transparent 70%)',
        'aurora-flow': 'linear-gradient(to right, hsl(var(--aurora-green)/0.3), hsl(var(--aurora-blue)/0.3), hsl(var(--aurora-purple)/0.3), hsl(var(--aurora-pink)/0.3))'
      },
      boxShadow: {
        'cosmic': '0 0 20px 5px rgba(130, 100, 255, 0.2)',
        'nebula': '0 0 30px 8px rgba(180, 120, 255, 0.25)',
        'star': '0 0 10px 2px rgba(255, 255, 255, 0.7)',
        'nova': '0 0 40px 10px rgba(255, 120, 200, 0.3)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
