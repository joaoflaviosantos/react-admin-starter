import type { ThemeConfig } from 'antd';

/** Light-mode tokens adapted from the admin dashboard template (Ant Design 5). */
export const customThemeTokenConfig: ThemeConfig['token'] = {
  colorSuccess: '#22C55E',
  colorWarning: '#FAC858',
  colorError: '#FF5630',
  colorInfo: '#00B8D9',
  colorPrimary: '#0078D4',
  wireframe: false,
  fontFamily: '"Dm Sans", sans-serif, "Apple Color Emoji"',
  borderRadiusSM: 4,
  borderRadius: 6,
  borderRadiusLG: 8,
  colorBgLayout: '#E4E4E7',
  colorBgContainer: '#F4F4F5',
  colorBgElevated: '#F4F4F5',
  colorBorderSecondary: '#E4E4E7',
};

export const customComponentConfig: ThemeConfig['components'] = {
  Breadcrumb: {
    fontSize: 12,
    separatorMargin: 4,
  },
  Menu: {
    fontSize: 14,
    colorFillAlter: 'transparent',
    itemColor: '#757577',
    itemSelectedBg: '#EFEFEF',
    itemActiveBg: '#EFEFEF',
  },
  Modal: {
    colorBgMask: 'rgba(0, 0, 0, 0.67)',
    headerBg: '#E4E4E7',
    contentBg: '#F4F4F5',
    footerBg: '#E4E4E7',
    wireframe: true,
  },
  Card: {
    colorBorderSecondary: '#d4d4d8',
  },
  Table: {
    headerBg: '#e8ecef',
    headerBorderRadius: 4,
    headerSplitColor: '#bcbcbc',
    fontSize: 12.5,
    borderColor: '#D4D4D8',
  },
  Button: {
    primaryShadow: '0px 2px 3px rgba(0, 0, 0, 0.15)',
  },
};
