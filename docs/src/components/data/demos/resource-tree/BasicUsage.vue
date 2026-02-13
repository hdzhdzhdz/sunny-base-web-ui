<script setup lang="ts">
import { ref } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { SunnyResourceTree } from '@sunny-base-web/ui';

type DemoNode = {
  key: string;
  title: string;
  isLeaf?: boolean;
  children?: DemoNode[];
  status?: '启用' | '停用';
  locked?: boolean;
  updatedAt?: number;
};

const selectedKeys = ref<Array<string | number>>([]);
const expandedKeys = ref<Array<string | number>>([]);

const treeData = ref<DemoNode[]>([
  { key: 'a', title: 'a' },
  { key: 'b', title: 'b' },
  { key: 'c', title: 'c' },
]);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomStatus = (): '启用' | '停用' => (Math.random() > 0.5 ? '启用' : '停用');

const buildChildren = (parentKey: string): DemoNode[] => {
  return Array.from({ length: 3 }).map((_, index) => {
    const key = `${parentKey}-${index + 1}`;

    return {
      key,
      title: key,
      isLeaf: false,
      status: randomStatus(),
      // locked: index === 0 && key.split('-').length >= 3,
      updatedAt: Date.now(),
    };
  });
};

const fetchChildren = async (parentKey: string) => {
  await wait(300);
  const children = buildChildren(parentKey);

  console.log('[ResourceTree Demo] 即将加载子节点：', {
    parentKey,
    children,
  });

  return children;
};

const replaceNodeChildren = (
  nodes: DemoNode[],
  targetKey: string,
  children: DemoNode[]
): boolean => {
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.key === targetKey) {
      node.children = children;
      return true;
    }

    if (node.children?.length) {
      const replaced = replaceNodeChildren(node.children, targetKey, children);
      if (replaced) {
        return true;
      }
    }
  }

  return false;
};

const removeNodeByKey = (nodes: DemoNode[], targetKey: string): boolean => {
  const index = nodes.findIndex((item) => item.key === targetKey);
  if (index > -1) {
    nodes.splice(index, 1);
    return true;
  }

  for (const node of nodes) {
    if (node.children?.length) {
      const removed = removeNodeByKey(node.children, targetKey);
      if (removed) {
        return true;
      }
    }
  }

  return false;
};

const removeRelatedStateByKey = (targetKey: string) => {
  const shouldKeep = (key: string | number) => {
    const keyText = String(key);
    return !(keyText === targetKey || keyText.startsWith(`${targetKey}-`));
  };

  selectedKeys.value = selectedKeys.value.filter(shouldKeep);
  expandedKeys.value = expandedKeys.value.filter(shouldKeep);
};

const loadMore = async (node: Record<string, any>) => {
  const parentKey = String(node.key);
  const children = await fetchChildren(parentKey);

  // 官方 load-more 用法：直接写 node.children
  node.children = children;

  // 同步示例数据，确保后续刷新/删除可基于最新树结构工作
  replaceNodeChildren(treeData.value, parentKey, children);
  treeData.value = [...treeData.value];
};

const deleteNodeWithConfirm = (node: DemoNode) => {
  const targetKey = String(node.key);

  Modal.confirm({
    title: '确认删除',
    content: `确定删除节点「${node.title}」吗？删除后不可恢复。`,
    okText: '确认删除',
    cancelText: '取消',
    onOk: async () => {
      await wait(200);

      const removed = removeNodeByKey(treeData.value, targetKey);
      if (!removed) {
        Message.error('删除失败，未找到目标节点');
        return;
      }

      treeData.value = [...treeData.value];
      removeRelatedStateByKey(targetKey);
      Message.success(`删除成功：${node.title}`);
    },
  });
};

const refreshNodeChildren = async (node: DemoNode) => {
  const targetKey = String(node.key);
  const children = await fetchChildren(targetKey);

  const updated = replaceNodeChildren(treeData.value, targetKey, children);
  if (!updated) {
    Message.error('刷新失败，未找到目标节点');
    return;
  }

  treeData.value = [...treeData.value];

  if (!expandedKeys.value.includes(targetKey)) {
    expandedKeys.value = [...expandedKeys.value, targetKey];
  }

  Message.success(`已刷新节点 ${node.title} 下的子节点`);
};

const contextMenuActions = [
  {
    key: 'create',
    label: '新增',
    handler: (node: DemoNode) => Message.info(`新增子节点：${node.title}`),
  },
  {
    key: 'edit',
    label: '修改',
    disabled: (node: DemoNode) => Boolean(node.locked),
    handler: (node: DemoNode) => Message.success(`修改节点：${node.title}`),
  },
  {
    key: 'delete',
    label: '删除',
    danger: true,
    disabled: (node: DemoNode) => Boolean(node.locked),
    handler: (node: DemoNode) => deleteNodeWithConfirm(node),
  },
  {
    key: 'refresh',
    label: '刷新',
    handler: (node: DemoNode) => refreshNodeChildren(node),
  },
];
</script>

<template>
  <div class="space-y-3">
    <div class="text-xs text-gray-500">
      加载规则：每次展开固定加载 3 个子节点，例如 `a -> a-1/a-2/a-3`，`a-1 -> a-1-1/a-1-2/a-1-3`。
    </div>

    <div class="text-xs text-gray-500">
      已选节点：{{ selectedKeys }}
    </div>

    <div class="h-[420px] overflow-auto rounded border border-gray-200 p-2">
      <SunnyResourceTree
        v-model:selected-keys="selectedKeys"
        v-model:expanded-keys="expandedKeys"
        :data="treeData"
        :load-more="loadMore"
        :context-menu-actions="contextMenuActions"
      />
    </div>
  </div>
</template>
