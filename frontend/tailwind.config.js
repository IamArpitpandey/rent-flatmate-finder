/** @type {import('tailwindcss').Config} */
/*
 * FlatMatch — Premium Editorial Glassmorphism (Tailwind Config)
 * -------------------------------------------------------------
 * ✅ Aapke ORIGINAL tokens (ink, paper, jade, violet, brass, slate, coral)
 *    bilkul same rakhe gaye hain — koi value change nahi.
 * ➕ Glass-specific tokens + gradients + glow shadows ADD kiye gaye hain
 *    taaki glassmorphism aapke light editorial brand ke saath kaam kare.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ===== Original FlatMatch tokens (UNCHANGED) ===== */
        ink: '#0B0E14',
        paper: '#FAFAF8',
        paperdim: '#F0F0EC',

        jade: {
          DEFAULT: '#0F9D74',
          light: '#DCF5EA',
          dark: '#0A7259',
        },
        violet: {
          DEFAULT: '#6D5DFC',
          light: '#EDEAFF',
          dark: '#4B3DC7',
        },
        brass: {
          DEFAULT: '#C08A2E',
          light: '#FBEFDA',
          dark: '#8F661E',
        },
        slate: {
          DEFAULT: '#667085',
          light: '#98A2B3',
        },
        coral: {
          DEFAULT: '#E1493F',
          light: '#FCE8E6',
          dark: '#B8322A',
        },

        /* ➕ Glass helper (translucent overlays) */
        glass: {
          DEFAULT: 'rgba(255,255,255,0.62)',
          strong: 'rgba(255,255,255,0.78)',
          soft:   'rgba(255,255,255,0.45)',
        },
      },

      /* ===== Fonts (UNCHANGED) ===== */
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      borderRadius: {
        xl2: '1.25rem',           /* UNCHANGED */
        xl3: '1.75rem',           /* ➕ for larger glass cards */
      },

      opacity: {
        3: '0.03', 4: '0.04', 6: '0.06', 8: '0.08', 15: '0.15',
      },

      /* ===== Gradients (➕ brand + soft pastel aurora) ===== */
      backgroundImage: {
        'grad-jade':   'linear-gradient(135deg, #0F9D74 0%, #0A7259 100%)',
        'grad-violet': 'linear-gradient(135deg, #6D5DFC 0%, #4B3DC7 100%)',
        'grad-brass':  'linear-gradient(135deg, #C08A2E 0%, #8F661E 100%)',
        'grad-brand':  'linear-gradient(135deg, #0F9D74 0%, #6D5DFC 100%)',
        'grad-aurora': 'linear-gradient(120deg, #DCF5EA 0%, #EDEAFF 50%, #FBEFDA 100%)',
      },

      boxShadow: {
        /* UNCHANGED originals */
        card:      '0 1px 2px rgba(11,14,20,0.04), 0 8px 24px -12px rgba(11,14,20,0.12)',
        cardHover: '0 4px 12px rgba(11,14,20,0.06), 0 20px 40px -16px rgba(11,14,20,0.20)',
        glowViolet:'0 8px 30px -8px rgba(109,93,252,0.45)',
        glowJade:  '0 8px 30px -8px rgba(15,157,116,0.4)',

        /* ➕ Glass shadows */
        glass:      '0 1px 1px rgba(255,255,255,0.6) inset, 0 8px 32px -8px rgba(11,14,20,0.12)',
        'glass-lg': '0 1px 1px rgba(255,255,255,0.7) inset, 0 24px 60px -16px rgba(11,14,20,0.22)',
        glowBrass:  '0 8px 30px -8px rgba(192,138,46,0.45)',
      },

      keyframes: {
        /* ===== UNCHANGED originals ===== */
        ringGrow: {
          '0%': { strokeDashoffset: 'var(--ring-full)' },
          '100%': { strokeDashoffset: 'var(--ring-offset)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        blobMove: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(24px, -32px) scale(1.08)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        /* ➕ extra */
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        shimmerSweep: {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
      },

      animation: {
        /* UNCHANGED */
        ringGrow: 'ringGrow 1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        fadeUp:   'fadeUp 0.6s ease forwards',
        float:    'float 4s ease-in-out infinite',
        blobMove: 'blobMove 9s ease-in-out infinite',
        shimmer:  'shimmer 3.5s ease-in-out infinite',
        /* ➕ extra */
        fadeIn:        'fadeIn 0.4s ease both',
        shimmerSweep:  'shimmerSweep 0.9s ease',
      },
    },
  },
  plugins: [],
};
