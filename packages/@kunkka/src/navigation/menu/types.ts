import type { Component, Ref } from "vue";

interface MenuProps {
  /**
   * 是否开启手风琴模式
   * @default true
   */
  accordion?: boolean;
  /**
   * 菜单是否折叠
   * @default false
   */
  collapse?: boolean;

  /**
   * 菜单折叠时是否显示菜单名称
   * @default false
   */
  collapseShowTitle?: boolean;

  /**
   * 默认激活的菜单
   */
  defaultActive?: string;

  /**
   * 默认展开的菜单
   */
  defaultOpeneds?: string[];

  /**
   * 菜单模式
   * @default vertical
   */
  mode?: "horizontal" | "vertical";

  /**
   * 是否圆润风格
   * @default true
   */
  rounded?: boolean;

  /**
   * 是否自动滚动到激活的菜单项
   * @default false
   */
  scrollToActive?: boolean;

  /**
   * 菜单主题
   * @default light
   */
  theme?: "auto" | "dark" | "light";
}

interface MenuRecordBadgeRaw {
  /**
   * 徽标
   */
  badge?: string;
  /**
   * 徽标类型
   */
  badgeType?: "dot" | "normal";
  /**
   * 徽标颜色
   */
  badgeVariants?: "destructive" | "primary" | string;
}

interface MenuItemRegistered {
  active: boolean;
  parentPaths: string[];
  path: string;
}

interface MenuProvider {
  activePath?: string;
  addMenuItem: (item: MenuItemRegistered) => void;

  addSubMenu: (item: MenuItemRegistered) => void;
  closeMenu: (path: string, parentLinks: string[]) => void;
  handleMenuItemClick: (item: MenuItemClicked) => void;
  handleSubMenuClick: (subMenu: MenuItemRegistered) => void;
  isMenuPopup: boolean;
  items: Record<string, MenuItemRegistered>;

  openedMenus: string[];
  openMenu: (path: string, parentLinks: string[]) => void;
  props: MenuProps;
  removeMenuItem: (item: MenuItemRegistered) => void;
  removeSubMenu: (item: MenuItemRegistered) => void;
  subMenus: Record<string, MenuItemRegistered>;
  theme: string;
}

interface MenuItemClicked {
  parentPaths: string[];
  path: string;
}

interface SubMenuProps extends MenuRecordBadgeRaw {
  /**
   * @zh_CN 激活图标
   */
  activeIcon?: string;
  /**
   * @zh_CN 是否禁用
   */
  disabled?: boolean;
  /**
   * @zh_CN 图标
   */
  icon?: Component | string;
  /**
   * submenu 名称
   */
  path: string;
}

interface SubMenuProvider {
  addSubMenu: (item: MenuItemRegistered) => void;
  handleMouseleave?: (deepDispatch?: boolean) => void;
  level: number;
  mouseInChild: Ref<boolean>;
  removeSubMenu: (item: MenuItemRegistered) => void;
}

/**
 * 菜单原始对象
 */
interface MenuRecordRaw extends MenuRecordBadgeRaw {
  /**
   * 激活时的图标名
   */
  activeIcon?: string;
  /**
   * 子菜单
   */
  children?: MenuRecordRaw[];
  /**
   * 是否禁用菜单
   * @default false
   */
  disabled?: boolean;
  /**
   * 图标名
   */
  icon?: Component | string;
  /**
   * 菜单名
   */
  name: string;
  /**
   * 排序号
   */
  order?: number;
  /**
   * 父级路径
   */
  parent?: string;
  /**
   * 所有父级路径
   */
  parents?: string[];
  /**
   * 菜单路径，唯一，可当作key
   */
  path: string;
  /**
   * 是否显示菜单
   * @default true
   */
  show?: boolean;
}

type ClassType = Array<object | string> | object | string;

interface MenuItemProps extends MenuRecordBadgeRaw {
  /**
   * @zh_CN 图标
   */
  activeIcon?: string;
  /**
   * @zh_CN 是否禁用
   */
  disabled?: boolean;
  /**
   * @zh_CN 图标
   */
  icon?: Component | string;
  /**
   * @zh_CN menuitem 名称
   */
  path: string;
}

export type {
  ClassType,
  MenuItemRegistered,
  MenuProps,
  MenuProvider,
  MenuRecordBadgeRaw,
  MenuRecordRaw,
  SubMenuProps,
  SubMenuProvider,
  MenuItemClicked,
  MenuItemProps
};
