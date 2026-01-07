import React from 'react';
import { Button, Tooltip } from 'antd';
import { 
  ChevronsLeft,
  ChevronsRight,
  Pin,
  PinOff
} from 'lucide-react';

interface SiderFooterProps {
  height: number;
  collapsed: boolean;
  onCollapseToggle: () => void;
  fixed: boolean;
  onFixedToggle: () => void;
  themeMode: 'light' | 'dark';
  textColor: string;
}

export const SiderFooter: React.FC<SiderFooterProps> = ({
  height,
  collapsed,
  onCollapseToggle,
  fixed,
  onFixedToggle,
  themeMode,
  textColor,
}) => {
  return (
    <div
      style={{ height }}
      // 根据主题设置边框颜色
      className={`
        flex-shrink-0 overflow-hidden flex items-center justify-between px-2 transition-all duration-300
        ${themeMode === 'dark' ? 'border-[rgba(255,255,255,0.1)]' : 'border-gray-200'}
      `}
    >
      <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : 'justify-between w-full px-2'}`}>
        {/* 收起/展开按钮 */}
        <div 
          className={`
            cursor-pointer transition-all duration-300 rounded p-1 flex items-center justify-center
            hover:bg-black/10 dark:hover:bg-white/10
          `}
          onClick={onCollapseToggle}
          style={{ 
            color: themeMode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)',
          }}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </div>

        {/* 固定/不固定按钮 */}
        {!collapsed && (
          <Tooltip title={fixed ? "取消固定 (悬停展开)" : "固定侧边栏"}>
            <div 
              className={`
                cursor-pointer transition-all duration-300 rounded p-1 flex items-center justify-center
                hover:bg-black/10 dark:hover:bg-white/10
              `}
              onClick={onFixedToggle}
              style={{ 
                color: themeMode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)',
              }}
            >
              {fixed ? <Pin size={14} className="fill-current" /> : <PinOff size={14} />}
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
