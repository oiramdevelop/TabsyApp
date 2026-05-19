/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./pages/**/*.html",
    "./assets/js/**/*.js",
  ],
  theme: {
    extend: {
      // ── Colores de marca Tabsy ──────────────────────────────
      colors: {
        navy:  {
          DEFAULT: '#0f2240',
          50:  '#e8edf4',
          100: '#c5d0e3',
          200: '#9eb0cc',
          300: '#7690b5',
          400: '#5577a4',
          500: '#3a5e93',
          600: '#2e4f80',
          700: '#213d6a',
          800: '#152b53',
          900: '#0f2240',
        },
        steel: {
          DEFAULT: '#4a6fa5',
          light:   '#6b8fc4',
          dark:    '#2e5080',
        },
        sand: {
          DEFAULT: '#c9a96e',
          light:   '#e0c898',
          dark:    '#a8834a',
          50:      '#fdf8f0',
          100:     '#f5ead6',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          dark:    '#ede7db',
        },
      },

      // ── Tipografía ──────────────────────────────────────────
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },

      // ── Espaciados y radios extras ──────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ── Sombras personalizadas ──────────────────────────────
      boxShadow: {
        'card':    '0 2px 16px rgba(15,34,64,0.08)',
        'card-lg': '0 8px 40px rgba(15,34,64,0.14)',
        'navy':    '0 8px 30px rgba(15,34,64,0.35)',
        'sand':    '0 4px 20px rgba(201,169,110,0.4)',
        'glow':    '0 0 30px rgba(74,111,165,0.25)',
      },

      // ── Animaciones personalizadas ──────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%':      { transform: 'translateY(-14px) rotate(3deg)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',    opacity: '1' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-up':         'fade-up 0.6s ease both',
        'fade-up-slow':    'fade-up 0.9s ease both',
        'fade-in':         'fade-in 0.4s ease both',
        'slide-right':     'slide-in-right 0.5s ease both',
        'float':           'float 5s ease-in-out infinite',
        'shimmer':         'shimmer 2.5s linear infinite',
        'pulse-ring':      'pulse-ring 1.5s ease-out infinite',
        'spin-slow':       'spin-slow 8s linear infinite',
        'bounce-soft':     'bounce-soft 2s ease-in-out infinite',

        // Con delays (para stagger)
        'fade-up-200':  'fade-up 0.6s 0.2s ease both',
        'fade-up-400':  'fade-up 0.6s 0.4s ease both',
        'fade-up-600':  'fade-up 0.6s 0.6s ease both',
      },

      // ── Backgrounds decorativos ─────────────────────────────
      backgroundImage: {
        'gradient-navy':   'linear-gradient(135deg, #0f2240 0%, #1e3d6e 60%, #0d1f3c 100%)',
        'gradient-sand':   'linear-gradient(135deg, #c9a96e 0%, #e0c898 50%, #a8834a 100%)',
        'gradient-cream':  'linear-gradient(160deg, #f5f0e8 0%, #ede7db 100%)',
        'gradient-steel':  'linear-gradient(135deg, #4a6fa5 0%, #2e5080 100%)',
        'shimmer-gold':    'linear-gradient(90deg, #c9a96e 0%, #e8c97e 40%, #c9a96e 60%, #a8834a 100%)',
        // Patrón azulejo gaditano
        'azulejo': `
          repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.015) 10px, rgba(255,255,255,0.015) 20px),
          repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(201,169,110,0.04) 10px, rgba(201,169,110,0.04) 20px),
          linear-gradient(135deg, #0f2240 0%, #1a3a6b 100%)
        `,
      },

      // ── Transiciones ────────────────────────────────────────
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':     'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),

    // Plugin custom: utilidades propias de Tabsy
    function({ addUtilities, addComponents, theme }) {

      // ── Utilidades ─────────────────────────────────────────
      addUtilities({
        // Noise texture overlay
        '.noise': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
            zIndex: '1',
          },
        },
        // Texto degradado
        '.text-gradient-sand': {
          background: 'linear-gradient(135deg, #c9a96e, #e0c898)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-navy': {
          background: 'linear-gradient(135deg, #0f2240, #4a6fa5)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        // Shimmer button effect
        '.bg-shimmer': {
          backgroundSize: '200% auto',
          animation: 'shimmer 2.5s linear infinite',
        },
        // Glass effect
        '.glass': {
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
        },
        '.glass-dark': {
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(15,34,64,0.7)',
          border: '1px solid rgba(201,169,110,0.15)',
        },
      });

      // ── Componentes reutilizables ───────────────────────────
      addComponents({
        // Inputs
        '.input-tabsy': {
          width: '100%',
          backgroundColor: theme('colors.white'),
          border: `1.5px solid rgba(15,34,64,0.1)`,
          borderRadius: theme('borderRadius.xl'),
          padding: '12px 16px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: theme('fontSize.sm')[0],
          color: theme('colors.navy.DEFAULT'),
          transition: 'all 0.2s',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.steel.DEFAULT'),
            boxShadow: `0 0 0 3px rgba(74,111,165,0.12)`,
          },
          '&::placeholder': {
            color: 'rgba(15,34,64,0.3)',
          },
        },

        // Botones
        '.btn-navy': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #0f2240, #1a3a6b)',
          color: 'white',
          border: 'none',
          borderRadius: theme('borderRadius.xl'),
          padding: '12px 24px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: theme('fontSize.sm')[0],
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.navy'),
          },
          '&:active': { transform: 'translateY(0)' },
        },
        '.btn-sand': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backgroundImage: 'linear-gradient(90deg, #c9a96e 0%, #e8c97e 40%, #c9a96e 60%, #a8834a 100%)',
          backgroundSize: '200% auto',
          animation: 'shimmer 2.5s linear infinite',
          color: 'white',
          border: 'none',
          borderRadius: theme('borderRadius.xl'),
          padding: '12px 24px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: theme('fontSize.sm')[0],
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.sand'),
          },
        },
        '.btn-ghost': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          color: theme('colors.navy.DEFAULT'),
          border: `1.5px solid rgba(15,34,64,0.15)`,
          borderRadius: theme('borderRadius.xl'),
          padding: '11px 22px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: theme('fontSize.sm')[0],
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            background: 'rgba(15,34,64,0.05)',
            borderColor: theme('colors.navy.DEFAULT'),
          },
        },

        // Cards
        '.card': {
          backgroundColor: 'white',
          borderRadius: theme('borderRadius.2xl'),
          border: '1px solid rgba(15,34,64,0.07)',
          boxShadow: theme('boxShadow.card'),
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme('boxShadow.card-lg'),
          },
        },

        // Badges de estado
        '.badge': {
          display: 'inline-block',
          fontSize: '0.68rem',
          fontWeight: '700',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '3px 10px',
          borderRadius: '999px',
        },
        '.badge-pendiente':  { backgroundColor: '#fef3c7', color: '#92400e' },
        '.badge-confirmada': { backgroundColor: '#d1fae5', color: '#065f46' },
        '.badge-cancelada':  { backgroundColor: '#f3f4f6', color: '#6b7280' },
        '.badge-rechazada':  { backgroundColor: '#fee2e2', color: '#991b1b' },
        '.badge-navy':       { backgroundColor: 'rgba(15,34,64,0.1)', color: '#0f2240' },
        '.badge-sand':       { background: 'linear-gradient(135deg,#c9a96e,#a8834a)', color: 'white' },
      });
    },
  ],
};
