import React from 'react';
import { Layout } from '@core/ui';
import { useAppSelector } from '../store';
import { CodeSandboxOutlined } from '@ant-design/icons';

/**
 * AppLayout Component
 * Wraps the core Layout component and connects it to the Redux store
 * to pass the theme configuration.
 */
const AppLayout: React.FC = () => {
  // Get theme from Redux store
  const { theme, sider, menu } = useAppSelector((state) => state.settings);

  return (
    <Layout 
      themeMode={theme}
      logo={<CodeSandboxOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
      title="舜宇智能开发平台"
      siderWidth={sider?.width ?? 224}
      siderCollapsedWidth={sider?.collapsedWidth ?? 50}
      siderHeaderHeight={sider?.headerHeight ?? 50}
      siderFooterHeight={sider?.footerHeight ?? 32}
      menuConfig={menu}
    />
  );
};

export default AppLayout;
