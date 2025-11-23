/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                surface: '#0f172a', // slate-900
                primary: '#f8fafc', // slate-50
                secondary: '#94a3b8', // slate-400
                'accent-cyan': '#06b6d4', // cyan-500
                'accent-green': '#10b981', // emerald-500
                'accent-yellow': '#eab308', // yellow-500
                glass: 'rgba(15, 23, 42, 0.7)',
                glassBorder: 'rgba(255, 255, 255, 0.1)',
                panel: '#1e293b', // slate-800
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                shimmer: 'shimmer 1.5s infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                }
            }
        },
    },
    plugins: [],
}
