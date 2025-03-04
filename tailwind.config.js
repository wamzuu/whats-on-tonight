module.exports = {
  content: ['./*.html', './src/**/*.js'],
  theme: {
    extend: {
      animation: {
        'fade': 'fade 0.8s ease-out',
      },
      keyframes: {
        fade: {
          'from': { opacity: 0 },
          'to': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
