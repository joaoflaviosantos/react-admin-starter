import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '480px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1600px',
    },
    extend: {
      colors: {
        black: '#000000',
        green: '#00A76F',
        hover: '#63738114',

        success: '#22c55e',
        warning: '#ff7849',
        error: '#ff5630',
        info: '#00b8d9',

        code: '#d63384',

        gray: {
          DEFAULT: '#637381',
          100: '#F9FAFB',
          200: '#F4F6F8',
          300: '#DFE3E8',
          400: '#C4CDD5',
          500: '#F9FAFB',
          600: '#637381',
          700: '#454F5B',
          800: '#212B36',
          900: '#161C24',
        },

        'ant-bg-layout': 'var(--ant-color-bg-layout)',
        'ant-bg-container': 'var(--ant-color-bg-container)',
        'ant-bg-elevated': 'var(--ant-color-bg-elevated)',
        'ant-bg-mask': 'var(--ant-color-bg-mask)',
        'ant-bg-modal-header': 'var(--ant-color-bg-modal-header)',
        'ant-bg-modal-content': 'var(--ant-color-bg-modal-content)',
        'ant-bg-modal-footer': 'var(--ant-color-bg-modal-footer)',
        'ant-bg-menu-selected': 'var(--ant-color-bg-menu-selected)',
        'ant-bg-menu-active': 'var(--ant-color-bg-menu-active)',
        'ant-bg-table-header': 'var(--ant-color-bg-table-header)',
        'ant-border-secondary': 'var(--ant-color-border-secondary)',
        'ant-border-table': 'var(--ant-color-border-table)',
        'ant-border-table-split': 'var(--ant-color-border-table-split)',
        'ant-border-card': 'var(--ant-color-border-card)',
        'ant-border-tabs': 'var(--ant-color-border-tabs)',
        'ant-text-menu': 'var(--ant-color-text-menu)',
        'ant-shadow-button': 'var(--ant-color-shadow-button)',

        'ant-primary-default': 'var(--ant-color-primary-default)',
        'ant-primary-green': 'var(--ant-color-primary-green)',
        'ant-primary-cyan': 'var(--ant-color-primary-cyan)',
        'ant-primary-pink': 'var(--ant-color-pink)',
        'ant-primary-purple': 'var(--ant-color-primary-purple)',
        'ant-primary-blue': 'var(--ant-color-primary-blue)',
        'ant-primary-orange': 'var(--ant-color-primary-orange)',
        'ant-primary-red': 'var(--ant-color-primary-red)',

        'ant-success': 'var(--ant-color-success)',
        'ant-warning': 'var(--ant-color-warning)',
        'ant-error': 'var(--ant-color-error)',
        'ant-info': 'var(--ant-color-info)',
      },
      transitionProperty: {
        height: 'height',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  corePlugins: {
    // Avoid fighting Ant Design reset (antd/dist/reset.css). Custom base lives in src/theme/base.css.
    preflight: false,
  },
  plugins: [tailwindcssAnimate],
};
