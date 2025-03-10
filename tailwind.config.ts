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
        '2xl': '1400px'
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
        cosmic: {
          DEFAULT: 'hsl(var(--cosmic))',
          dark: 'hsl(var(--cosmic-dark))',
          light: 'hsl(var(--cosmic-light))',
          accent: 'hsl(var(--cosmic-accent))',
          muted: 'hsl(var(--cosmic-muted))',
          nebula: 'hsl(var(--cosmic-nebula))',
          supernova: 'hsl(var(--cosmic-supernova))',
          void: 'hsl(var(--cosmic-void))',
          stardust: 'hsl(var(--cosmic-stardust))'
        },
        galaxy: {
          core: 'hsl(var(--galaxy-core))',
          spiral: 'hsl(var(--galaxy-spiral))',
          dust: 'hsl(var(--galaxy-dust))',
          star: 'hsl(var(--galaxy-star))',
          nova: 'hsl(var(--galaxy-nova))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
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
        'star-pulse': 'star-pulse 4s ease-in-out infinite'
      },
      backgroundImage: {
        'galaxy-gradient': 'radial-gradient(ellipse at center, hsl(var(--galaxy-core)), hsl(var(--cosmic-dark)))',
        'nebula-gradient': 'linear-gradient(135deg, hsl(var(--cosmic-nebula)/0.8), hsl(var(--cosmic-void)/0.9))',
        'stardust-pattern': 'radial-gradient(circle, transparent 20%, hsl(var(--cosmic-stardust)/0.1) 70%)',
        'cosmic-glow': 'conic-gradient(from 0deg, hsl(var(--cosmic-light)/0.2), hsl(var(--cosmic-supernova)/0.3), hsl(var(--cosmic-light)/0.2))'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
