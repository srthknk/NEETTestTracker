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
        bg: '#ffffff',
        'bg-secondary': '#f9f9f9',
        'bg-tertiary': '#f0f0f0',
        text: '#000000',
        'text-secondary': '#666666',
        'text-tertiary': '#999999',
        border: '#e5e5e5',
        'border-dark': '#cccccc',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
export default config
