import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-hand)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial'],
        hand: ['var(--font-hand)'],
        title: ['var(--font-title)'],
      },
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.4' }],
        sm: ['1rem', { lineHeight: '1.5' }],
        base: ['1.0625rem', { lineHeight: '1.6' }],
        md: ['1.125rem', { lineHeight: '1.55' }],
        lg: ['1.25rem', { lineHeight: '1.5' }],
        xl: ['1.5rem', { lineHeight: '1.3' }],
        '2xl': ['1.75rem', { lineHeight: '1.25' }],
      },
    },
  },
  darkMode: 'class',
}
export default config
