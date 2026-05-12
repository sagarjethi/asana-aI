import type { Config } from 'tailwindcss'

const config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            fontFamily: {
                display: ['var(--font-display)', 'serif'],
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
            },
            colors: {
                cream: {
                    50: '#FFFBF4',
                    100: '#FBF4E8',
                    200: '#F5E9D4',
                    300: '#EFDDBE',
                },
                sun: {
                    300: '#FFD27A',
                    400: '#FCBF49',
                    500: '#F9A03F',
                    600: '#F77F00',
                    700: '#E25822',
                },
                ember: {
                    500: '#FF6B35',
                    600: '#E25822',
                    700: '#B73E1E',
                },
                sage: {
                    300: '#BCD0B6',
                    400: '#9CBA94',
                    500: '#7A9A7E',
                    600: '#5C8A60',
                    700: '#3F6A45',
                },
                ink: {
                    700: '#3B2E2A',
                    800: '#241914',
                    900: '#15100C',
                },
            },
            backgroundImage: {
                'sun-orb':
                    'radial-gradient(60% 60% at 50% 40%, rgba(252,191,73,0.7) 0%, rgba(247,127,0,0.45) 35%, rgba(226,88,34,0.15) 60%, rgba(255,251,244,0) 75%)',
                'sun-cta':
                    'linear-gradient(135deg, #FCBF49 0%, #F77F00 45%, #E25822 100%)',
                'cream-fade':
                    'linear-gradient(180deg, #FFFBF4 0%, #FBF4E8 60%, #F5E9D4 100%)',
            },
            boxShadow: {
                warm: '0 24px 60px -24px rgba(226, 88, 34, 0.25)',
                soft: '0 8px 24px -12px rgba(59, 46, 42, 0.18)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'sun-pulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.95' },
                    '50%': { transform: 'scale(1.04)', opacity: '1' },
                },
                'float-y': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'sun-pulse': 'sun-pulse 8s ease-in-out infinite',
                'float-y': 'float-y 6s ease-in-out infinite',
            },
        },
    },
    plugins: [require('tailwindcss-animated'), require('daisyui')],
} satisfies Config

export default config
