const plugin = require('tailwindcss/plugin')

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {    
      zIndex: {
        '-1': '-1'
      }
    },

  },
  variants: {
    extend: {
      appearance: ['inner-spin-button'],
      boxShadow: ['active']
    },
  },
  plugins: [
    plugin(({ addVariant, e }) => {
      addVariant('inner-spin-button', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`inner-spin-button${separator}${className}`)}::-webkit-inner-spin-button`;
        });
      });
      addVariant('before', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`before${separator}${className}`)}::before`;
        });
      });
      addVariant('after', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`after${separator}${className}`)}::after`;
        });
      });
    }),
    plugin(({ addUtilities }) => {
      const contentUtilities = {
        '.content': {
          content: 'attr(data-content)',
        },
        '.content-before': {
          content: 'attr(data-before)',
        },
        '.content-after': {
          content: 'attr(data-after)',
        },
      };

      addUtilities(contentUtilities, ['before', 'after']);
    })
  ]
}
