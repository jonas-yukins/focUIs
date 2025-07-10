module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      // Enable all features
      features: {
        'nesting': true,
        'custom-media-queries': true,
        'media-query-ranges': true,
        'custom-properties': true,
        'is-pseudo-class': true,
        'focus-visible-pseudo-class': true,
        'focus-within-pseudo-class': true,
        'color-functional-notation': true,
      },
    },
  },
};
