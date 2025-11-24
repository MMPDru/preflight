/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Minute Marketing Brand Colors
                primary: {
                    DEFAULT: '#2D7E6B', // Minute Marketing Teal Green
                    50: '#E6F2EF',
                    100: '#CCE5DF',
                    200: '#99CCBF',
                    300: '#66B29F',
                    400: '#33997F',
                    500: '#2D7E6B',
                    600: '#246556',
                    700: '#1B4C41',
                    800: '#12322B',
                    900: '#091916',
                },
                secondary: {
                    DEFAULT: '#F68321', // Minute Marketing Orange
                    50: '#FEF3E9',
                    100: '#FDE7D3',
                    200: '#FBCFA7',
                    300: '#F9B77B',
                    400: '#F79F4F',
                    500: '#F68321',
                    600: '#D46D0D',
                    700: '#A0520A',
                    800: '#6C3707',
                    900: '#381C03',
                },
                // UI Colors
                accent: '#FF8C42', // Lighter orange for highlights
                background: '#0F1419', // Dark background
                surface: '#1A1F26', // Card/panel background
                border: '#2A3038', // Borders
                text: '#E5E7EB', // Primary text
                muted: '#9CA3AF', // Secondary text
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                info: '#3B82F6',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
