import { computed, type SetupContext } from 'vue';
import type {
  ResourceTreeActionFlag,
  ResourceTreeContextMenuAction,
  ResourceTreeNode,
  SunnyResourceTreeProps,
} from './types';

interface UseSunnyResourceTreeOptions {
  props: SunnyResourceTreeProps;
  emit: SetupContext['emit'];
  attrs: Record<string, any>;
}

export function useSunnyResourceTree(options: UseSunnyResourceTreeOptions) {
  const { props, emit, attrs } = options;

  const mergedActions = computed<ResourceTreeContextMenuAction[]>(() => {
    return props.contextMenuActions || props.actions || [];
  });

  const fieldNames = computed(() => {
    const fromKebab = attrs['field-names'] as Record<string, string> | undefined;
    const fromCamel = attrs.fieldNames as Record<string, string> | undefined;

    return {
      key: 'key',
      title: 'title',
      children: 'children',
      ...(fromKebab || fromCamel || {}),
    };
  });

  const getNodeKey = (node: ResourceTreeNode): string | number | undefined => {
    const keyField = fieldNames.value.key || 'key';
    return node[keyField] ?? node.key;
  };

  const getTreeData = (): ResourceTreeNode[] => {
    return (attrs.data as ResourceTreeNode[]) || [];
  };

  const isRootNode = (node: ResourceTreeNode): boolean => {
    const key = getNodeKey(node);
    if (key === undefined || key === null) {
      return false;
    }

    return getTreeData().some((item) => getNodeKey(item) === key || item === node);
  };

  const resolveActionFlag = (
    flag: ResourceTreeActionFlag | undefined,
    node: ResourceTreeNode,
    fallback: boolean
  ): boolean => {
    if (typeof flag === 'boolean') {
      return flag;
    }

    if (typeof flag === 'function') {
      return flag(node);
    }

    return fallback;
  };

  const getNodeActions = (node: ResourceTreeNode): ResourceTreeContextMenuAction[] => {
    if (!node) {
      return [];
    }

    if (!props.enableRootContextMenu && isRootNode(node)) {
      return [];
    }

    return mergedActions.value.filter((action) =>
      resolveActionFlag(action.visible, node, true)
    );
  };

  const isActionDisabled = (
    action: ResourceTreeContextMenuAction,
    node: ResourceTreeNode
  ): boolean => {
    return resolveActionFlag(action.disabled, node, false);
  };

  const canShowContextMenu = (node: ResourceTreeNode): boolean => {
    return getNodeActions(node).length > 0;
  };

  const getNodeTitle = (node: ResourceTreeNode): string => {
    const titleField = fieldNames.value.title || 'title';
    const key = getNodeKey(node);

    return String(node?.[titleField] ?? node?.title ?? key ?? '');
  };

  const handleActionClick = async (value: string | number, node: ResourceTreeNode) => {
    const action = getNodeActions(node).find((item) => item.key === String(value));
    if (!action) {
      return;
    }

    if (isActionDisabled(action, node)) {
      return;
    }

    if (action.handler) {
      await action.handler(node);
    }

    emit('action', {
      key: action.key,
      action,
      node,
    });
  };

  return {
    canShowContextMenu,
    getNodeActions,
    isActionDisabled,
    getNodeTitle,
    handleActionClick,
  };
}
