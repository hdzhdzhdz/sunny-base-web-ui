import React from 'react';

interface SiderHeaderProps {
  height: number;
  logo?: React.ReactNode;
  title?: React.ReactNode;
  collapsed: boolean;
  themeMode: 'light' | 'dark';
  textColor: string;
}

export const SiderHeader: React.FC<SiderHeaderProps> = ({
  height,
  logo,
  title,
  collapsed,
  themeMode,
  textColor,
}) => {
  return (
    <div
      style={{ height }}
      className="flex-shrink-0 overflow-hidden flex items-center justify-center px-2 transition-all duration-300"
    >
      <div className="flex items-center gap-2 truncate">
        {logo || (
          <div className="h-8 w-8 bg-[rgba(255,255,255,0.2)] rounded flex-shrink-0" />
        )}
        {!collapsed && (
          <span
            className={`text-lg font-bold truncate transition-opacity duration-300 ${
              collapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}
            style={{ color: themeMode === 'dark' ? '#fff' : textColor }}
          >
            {title || 'System'}
          </span>
        )}
      </div>
    </div>
  );
};
