import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, theme } from 'antd';
import type { ReactNode } from 'react';
import 'antd/dist/reset.css';

import { customComponentConfig, customThemeTokenConfig } from './tokens';

type AntdConfigProps = {
  children: ReactNode;
};

export default function AntdConfig({ children }: AntdConfigProps) {
  return (
    <ConfigProvider
      theme={{
        token: customThemeTokenConfig,
        components: customComponentConfig,
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <StyleProvider hashPriority="high">{children}</StyleProvider>
    </ConfigProvider>
  );
}
