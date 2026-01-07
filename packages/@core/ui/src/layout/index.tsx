import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, theme, ConfigProvider } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { SiderHeader } from './header';
import { SiderFooter } from './footer';
import { Scrollbar } from '../components/Scrollbar';

// 生成 50 个 1-4 级菜单的模拟数据
const generateMockMenuItems = () => {
  const items: any[] = [];
  let count = 0;
  
  const generate = (level: number): any[] => {
    if (level > 4) return [];
    const layerItems: any[] = [];
    // 每个节点随机生成 1-5 个子项
    const num = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < num; i++) {
      if (count >= 50) break;
      count++;
      
      const hasChildren = level < 4 && Math.random() > 0.3; // 70% 概率有子菜单
      const item: any = {
        key: `menu-${count}`,
        icon: level === 1 ? <UserOutlined /> : undefined,
        label: `Menu Item ${count} (L${level})`,
      };
      
      if (hasChildren) {
        const children = generate(level + 1);
        if (children.length > 0) {
          item.children = children;
        }
      }
      
      layerItems.push(item);
    }
    return layerItems;
  };

  while (count < 50) {
    const newItems = generate(1);
    items.push(...newItems);
  }
  
  return items;
};

const mockMenuItems = generateMockMenuItems();

const { Header, Sider, Content } = AntLayout;

export interface LayoutProps {
  themeMode?: 'light' | 'dark';
  /**
   * 系统 Logo
   */
  logo?: React.ReactNode;
  /**
   * 系统标题
   */
  title?: React.ReactNode;
  /**
   * 侧边栏头部高度
   * @default 50
   */
  siderHeaderHeight?: number;
  /**
   * 侧边栏底部内容
   */
  siderFooter?: React.ReactNode;
  /**
   * 侧边栏底部高度
   * @default 32
   */
  siderFooterHeight?: number;
  /**
   * 侧边栏折叠宽度
   * @default 50
   */
  siderCollapsedWidth?: number;
  /**
   * 侧边栏宽度
   * @default 224
   */
  siderWidth?: number;
  /**
   * 菜单配置
   */
  menuConfig?: {
    subMenuItemBg?: string;
    itemHoverBg?: string;
  };
  /**
   * 侧边栏内容组件
   */
  siderContent?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const { themeMode = 'light' } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [fixed, setFixed] = useState(true); // 默认固定
  
  // 根据传入的 themeMode 决定使用哪种算法
  const algorithm = themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return (
    <ConfigProvider theme={{ algorithm }}>
      <LayoutContent 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        fixed={fixed}
        setFixed={setFixed}
        themeMode={themeMode}
        {...props}
      />
    </ConfigProvider>
  );
};

interface LayoutContentProps extends LayoutProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  fixed: boolean;
  setFixed: (fixed: boolean) => void;
}

const LayoutContent: React.FC<LayoutContentProps> = ({ 
  collapsed, 
  setCollapsed, 
  fixed,
  setFixed,
  themeMode,
  logo,
  title,
  siderHeaderHeight = 50,
  siderFooterHeight = 32,
  siderWidth = 224,
  siderCollapsedWidth = 50,
  siderContent,
  menuConfig
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG, colorText },
  } = theme.useToken();

  // 处理鼠标移入移出逻辑
  const handleMouseEnter = () => {
    if (!fixed) {
      setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!fixed) {
      setCollapsed(true);
    }
  };

  // 当切换为不固定时，自动收起
  useEffect(() => {
    if (!fixed) {
      setCollapsed(true);
    }
  }, [fixed, setCollapsed]);

  return (
    <AntLayout className="h-screen w-screen overflow-hidden">
      <Sider 
        width={siderWidth}
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme={themeMode} 
        collapsedWidth={siderCollapsedWidth}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={themeMode === 'light' ? '!border-r !border-gray-200' : '!border-r !border-gray-800'}
        style={{ borderRightStyle: 'solid', borderRightWidth: 1 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SiderHeader 
            height={siderHeaderHeight}
            logo={logo}
            title={title}
            collapsed={collapsed}
            themeMode={themeMode}
            textColor={colorText}
          />
          
          {/* Content */}
          <Scrollbar className="flex-1" shadow shadowBottom shadowBorder viewportClassName="[&>div]:!block">
            {siderContent || (
              <ConfigProvider
                theme={{
                  components: {
                    Menu: {
                      subMenuItemBg: menuConfig?.subMenuItemBg,
                      itemHoverBg: menuConfig?.itemHoverBg,
                    },
                  },
                }}
              >
                <Menu
                  theme={themeMode}
                  mode="inline"
                  inlineCollapsed={collapsed}
                  defaultSelectedKeys={['menu-1']}
                  items={mockMenuItems}
                  style={{ width: '100%', minWidth: 0, border: 'none' }}
                />
              </ConfigProvider>
            )}
          </Scrollbar>

          {/* Footer */}
          <SiderFooter 
            height={siderFooterHeight}
            collapsed={collapsed}
            onCollapseToggle={() => setCollapsed(!collapsed)}
            fixed={fixed}
            onFixedToggle={() => setFixed(!fixed)}
            themeMode={themeMode!}
            textColor={colorText}
          />
        </div>
      </Sider>
      <AntLayout>
        <Header style={{ padding: 0, background: colorBgContainer }} className="flex items-center">
           {/* Header Content, previously had toggle button here */}
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ marginBottom: 16 }}>
             <h3>Scrollbar 测试区域</h3>
             <p>下面的区域应该显示顶部和底部的阴影（当内容溢出时）</p>
          </div>
          <Scrollbar 
            className="flex-1 relative" 
            shadow 
            shadowBottom 
            shadowTop
            shadowBorder
            style={{ height: 300 }} // 强制高度以触发滚动
          >
            <div className="p-4">
              {Array.from({ length: 50 }).map((_, index) => (
                <div key={index} className="p-2 border-b">
                  测试内容行 {index + 1} - 用于验证滚动阴影效果
                </div>
              ))}
            </div>
          </Scrollbar>
          <div className="mt-4">
             <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

