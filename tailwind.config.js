export default {
    plugins: [require('tailwindcss-primeui')],
    theme: {
        extend: {
            colors: {
                'background': '#23272f', // main background
                'surface': '#2d3340',    // cards/surfaces
                'text-main': '#e0e6ed',  // main text
                'text-muted': '#cfd8dc', // muted text
                'accent': '#ff9900',     // orange accent
                'accent-dark': '#cc7a00',
            },
            fontFamily: {
                'sans': ['Inter', 'Nunito Sans', 'Roboto', 'sans-serif'],
            },
        },
    },
}