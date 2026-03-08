/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bharat-saffron': '#FF9933',
                'bharat-green': '#10B981',
                'bharat-blue': '#0070F3',
                'bg-charcoal': '#0E0E11',
            },
            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
