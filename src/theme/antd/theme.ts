import { ThemeConfig } from 'antd';
import Color from 'color';

import { ThemeColorPresets } from '#/enum';

const customThemeTokenConfig: ThemeConfig['token'] = {
  colorSuccess: '#22C55E',
  colorWarning: '#FAC858',
  colorError: '#FF5630',
  colorInfo: '#00B8D9',
  wireframe: false,
  fontFamily: '"Dm Sans", sans-serif, "Apple Color Emoji"',
  borderRadiusSM: 4,
  borderRadius: 6,
  borderRadiusLG: 8,
};

const customComponentConfig: ThemeConfig['components'] = {
  Breadcrumb: {
    fontSize: 12,
    separatorMargin: 4,
  },
  Menu: {
    fontSize: 14,
    colorFillAlter: 'transparent',
  },
};

const colorPrimarys: Record<ThemeColorPresets, string> = {
  default: '#0078D4',
  green: '#00A76F',
  cyan: '#078DEE',
  pink: '#FD018E',
  purple: '#943CF2',
  blue: '#2065D1',
  orange: '#FDA92D',
  red: '#FF2651',
};

const themeModeToken: Record<'dark' | 'light', ThemeConfig> = {
  dark: {
    token: {
      colorBgLayout: '#000000',
      colorBgContainer: '#18181B',
      colorBgElevated: '#18181B',
      colorBorderSecondary: '#50525b',
    },
    components: {
      Modal: {
        colorBgMask: 'rgba(0, 0, 0, 0.67)',
        headerBg: '#18181B',
        contentBg: '#27272A',
        footerBg: '#18181B',
        wireframe: true,
      },
      Menu: {
        itemColor: '#cecece',
        itemSelectedBg: '#27272A',
        itemActiveBg: '#353849',
      },
      Card: {
        colorBorderSecondary: '#323235',
      },
      Table: {
        headerBg: '#27272A',
        headerBorderRadius: 4,
        fontSize: 12.5,
      },
      Button: {
        primaryShadow: '0px 2px 3px rgba(0, 0, 0, 0.10)',
      },
      Tabs: {
        colorBorderSecondary: Color(colorPrimarys.default).alpha(0.4).toString(),
        colorBorder: Color(colorPrimarys.default).alpha(0.4).toString(),
      },
      Descriptions: {
        labelBg: '#3D3D3F',
      },
    },
  },
  light: {
    token: {
      colorBgLayout: '#E4E4E7',
      colorBgContainer: '#F4F4F5',
      colorBgElevated: '#F4F4F5',
      colorBorderSecondary: '#E4E4E7',
    },
    components: {
      Modal: {
        colorBgMask: 'rgba(0, 0, 0, 0.67)',
        headerBg: '#E4E4E7',
        contentBg: '#F4F4F5',
        footerBg: '#E4E4E7',
        wireframe: true,
      },
      Menu: {
        itemColor: '#757577',
        itemSelectedBg: '#EFEFEF',
        itemActiveBg: '#EFEFEF',
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
      Tabs: {
        colorBorderSecondary: Color(colorPrimarys.default).alpha(0.6).toString(),
        colorBorder: Color(colorPrimarys.default).alpha(0.6).toString(),
      },
      Descriptions: {
        labelBg: '#E8E8E8',
      },
    },
  },
};

export { customThemeTokenConfig, customComponentConfig, colorPrimarys, themeModeToken };
