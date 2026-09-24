import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const AZUL_PVL = { 50: '#EAF8FF', 100: '#D2F0FF', 200: '#A8E3FF', 300: '#6FD2FF', 400: '#33BFFF', 500: '#0AAEFF', 600: '#008FE0', 700: '#0072B5', 800: '#005A8F', 900: '#064A73', 950: '#042F4A' }

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Identidade PVL CRM: tudo que era roxo ou rosa virou azul-claro saturado.
        // As escalas abaixo substituem as do Tailwind com o mesmo nome, entao toda
        // classe purple-/violet-/fuchsia-/pink- ja sai azul sem mexer nos componentes.
        // (blue continua sendo a escala padrao, ver o comentario de accent.)
        purple: AZUL_PVL,
        violet: AZUL_PVL,
        fuchsia: AZUL_PVL,
        pink: AZUL_PVL,
        // accent era '#3B82F6' e não tinha nenhum uso real no projeto (confirmado via
        // grep) — reaproveitada pra virar o azul da marca nova. NÃO declarar uma chave
        // `blue` aqui: 50+ arquivos usam a escala padrão do Tailwind (bg-blue-600 etc)
        // e sobrescrever `blue` quebraria todos eles silenciosamente (merge raso).
        accent: {
          DEFAULT: 'var(--blue)',
          2: 'var(--blue-2)',
          line: 'var(--blue-line)',
        },
        void: 'var(--void)',
        panel: {
          DEFAULT: 'var(--panel)',
          2: 'var(--panel-2)',
        },
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        // Rampa de cinzas do design system (definida em globals.css). Nome
        // `graphite` de propósito, NÃO `gray`: a escala `gray` padrão do
        // Tailwind é usada em dezenas de arquivos e nos overrides `.dark
        // .bg-gray-*` do globals.css — sobrescrevê-la quebraria tudo isso em
        // silêncio (o merge do theme.extend é raso), mesmo caso já anotado
        // acima pra `blue`.
        graphite: {
          0: 'var(--g-0)',
          1: 'var(--g-1)',
          2: 'var(--g-2)',
          3: 'var(--g-3)',
          4: 'var(--g-4)',
          5: 'var(--g-5)',
          6: 'var(--g-6)',
          7: 'var(--g-7)',
          8: 'var(--g-8)',
          9: 'var(--g-9)',
        },
        glass: {
          edge: 'var(--glass-edge)',
          'edge-strong': 'var(--glass-edge-strong)',
        },
      },
      backgroundImage: {
        'grad-app': 'var(--grad-app)',
        'grad-panel': 'var(--grad-panel)',
        'grad-raised': 'var(--grad-raised)',
        'grad-sunken': 'var(--grad-sunken)',
        'grad-rail': 'var(--grad-rail)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Syne"', 'system-ui', 'sans-serif'],
        neuehaas: ['"Neue Haas Grotesk Display Pro"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(242,199,68,.35)',
        glass: 'var(--glass-lift)',
        'glass-lg': 'var(--glass-lift-lg)',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
export default config
