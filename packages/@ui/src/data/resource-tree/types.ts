import type { TreeNodeData } from '@arco-design/web-vue';

export type ResourceTreeNode = TreeNodeData & Record<string, any>;

export type ResourceTreeActionFlag = boolean | ((node: ResourceTreeNode) => boolean);

export interface ResourceTreeContextMenuAction {
  key: string;
  label: string;
  danger?: boolean;
  visible?: ResourceTreeActionFlag;
  disabled?: ResourceTreeActionFlag;
  handler?: (node: ResourceTreeNode) => void | Promise<void>;
}

export interface SunnyResourceTreeProps {
  contextMenuActions?: ResourceTreeContextMenuAction[];
  /**
   * 兼容旧命名，建议使用 contextMenuActions
   */
  actions?: ResourceTreeContextMenuAction[];
  enableRootContextMenu?: boolean;
}

export interface SunnyResourceTreeEmits {
  (
    e: 'action',
    payload: {
      key: string;
      action: ResourceTreeContextMenuAction;
      node: ResourceTreeNode;
    }
  ): void;
}

export interface SunnyResourceTreeExpose {
  getTree: () => any;
  toggleCheck: (key: string | number, e?: Event) => any;
  scrollIntoView: (options: any) => any;
  getSelectedNodes: () => ResourceTreeNode[] | undefined;
  getCheckedNodes: (options?: any) => ResourceTreeNode[] | undefined;
  getHalfCheckedNodes: () => ResourceTreeNode[] | undefined;
  getExpandedNodes: () => ResourceTreeNode[] | undefined;
  checkAll: (checked?: boolean) => any;
  checkNode: (
    key: string | number | Array<string | number>,
    checked?: boolean,
    onlyCheckLeaf?: boolean
  ) => any;
  selectAll: (selected?: boolean) => any;
  selectNode: (key: string | number | Array<string | number>, selected?: boolean) => any;
  expandAll: (expanded?: boolean) => any;
  expandNode: (key: string | number | Array<string | number>, expanded?: boolean) => any;
}
