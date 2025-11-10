// tailwind.config.ts
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
    },
  },
  darkMode: 'class',
}
export default config
