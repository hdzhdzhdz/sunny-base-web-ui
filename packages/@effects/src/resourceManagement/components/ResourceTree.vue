<script setup lang="ts">
import { ref } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { SunnyResourceTree } from '@sunny-base-web/ui';
import { findMenuAll, getMenu, delMenu, moveMenuOrder, findMenuTreeFuzzy } from '../../api/resource'

// @ts-ignore
import { find } from 'lodash-es';
// @ts-ignore
import ModuleEditor from './module/ModuleEditor.vue'
// @ts-ignore
import UrlEditor from './module/UrlEditor.vue'
// @ts-ignore
import MenuPathEditor from './module/MenuPathEditor.vue'

type ResourceNode = {
  id: number;
  cModname: string;
  cModnumb: string;
  cSystem?: string;
  nLevel?: number;
  isLeaf?: boolean;
  children?: ResourceNode[];
  locked?: boolean;
  loading?: boolean;
};

const selectedKeys = ref<Array<string | number>>([]);
const expandedKeys = ref<Array<string | number>>([]);
const moduleEditor = ref();
const urlEditor = ref();
const menuPathEditor = ref();
const emit = defineEmits(['currentChange']);

const appSystem = import.meta.env.VITE_APP_SYSTEM ? JSON.parse(import.meta.env.VITE_APP_SYSTEM) : [];
const treeData = ref<ResourceNode[]>(appSystem);

/**
 * 判断节点是否为根节点
 * @param node 要判断的节点
 * @returns 是否为根节点(id为0)
 */
const isRootNode = (node: ResourceNode) => find(appSystem, ['id', node.id]);

/**
 * 右键菜单操作配置
 */
const contextMenuActions = [
  {
    key: 'create',
    label: '新增下级资源',
    handler: (node: ResourceNode) => createResource(node),
  },
  {
    key: 'edit',
    label: '编辑资源',
    visible: (node: ResourceNode) => !isRootNode(node),
    disabled: (node: ResourceNode) => node.cModname === 'EVERYONE',
    handler: (node: ResourceNode) => editResource(node),
  },
  {
    key: 'delete',
    label: '删除资源',
    visible: (node: ResourceNode) => !isRootNode(node),
    disabled: (node: ResourceNode) => node.cModname === 'EVERYONE',
    handler: (node: ResourceNode) => deleteNodeWithConfirm(node),
  },
  {
    key: 'ModUrl',
    label: '模块URL绑定',
    visible: (node: ResourceNode) => !isRootNode(node),
    handler: (node: ResourceNode) => urlEditor.value.openEditor(node.id)
  },
  {
    key: 'PathChange',
    label: '菜单路径变更',
    visible: (node: ResourceNode) => !isRootNode(node),
    disabled: (node: ResourceNode) => node.cModname === 'EVERYONE',
    handler: (node: ResourceNode) => menuPathEditor?.value.openEditor(node),
  },
  {
    key: 'refresh',
    label: '刷新列表',
    handler: (node: ResourceNode) => refreshNodeChildren(node),
  },
];

/**
 * 异步获取节点的子节点数据
 * @param node 当前需要加载子节点的资源节点
 * @returns 返回子节点数组,每个节点包含资源信息和状态标志
 */
const fetchChildren = async (node: ResourceNode) => {
  const { id, cSystem } = node
  const payload = {
    authResMenu: {
      cType: '-1,0,1,4,5,6', // 1.菜单 4超链接  5：弹窗  -1:everyone资源 6打开新窗口的外链
      nParkeyid: id,
      cSystem
    }
  }
  const res = await findMenuAll(payload)
  const children = res.result.map((it: ResourceNode) => {
    return {
      ...it,
      isLeaf: false,
      loading: false // 预设一个loading
    }
  })

  return children;
};

/**
 * 异步加载更多子节点数据
 * @param node 需要加载子节点的节点
 */
const loadMore = async (node: ResourceNode) => {
  const children = await fetchChildren(node);
  node.children = children;
  treeData.value = [...treeData.value];
};

/**
 * 打开资源创建对话框
 * @param node 父节点,新创建的资源将作为该节点的子节点
 */
const createResource = (node: ResourceNode) => {
  moduleEditor.value?.openEditor({
    type: 0,
    data: {
      nParkeyid: Number(node.id),
      cSystem: node.cSystem,
      cShow: '0'
    }
  });
};

/**
 * 打开资源编辑对话框,并从远程加载资源信息
 * @param node 要编辑的节点
 */
const editResource = (node: ResourceNode) => {
  const payload = { authResMenu: { id: node.id }}
  getMenu(payload).then((res) => {
    if (res.success) {
      moduleEditor.value?.openEditor({
        type: 1,
        data: res.result
      });
    } else {
      Message.error({
        closable: true,
        content: `error:${res.message}`
      })
    }
  })
}

/**
 * 递归删除指定ID的节点
 * @param nodes 节点数组
 * @param targetId 目标节点ID
 * @returns 是否成功删除
 */
const removeNodeById = (nodes: ResourceNode[], targetId: number): boolean => {
  const index = nodes.findIndex((item) => item.id === targetId);
  if (index > -1) {
    nodes.splice(index, 1);
    return true;
  }

  for (const node of nodes) {
    if (node.children?.length) {
      const removed = removeNodeById(node.children, targetId);
      if (removed) {
        return true;
      }
    }
  }

  return false;
};

/**
 * 移除与指定节点相关的状态(选中状态和展开状态)
 * @param targetId 目标节点ID,同时移除该节点ID开头的所有相关状态
 */
const removeRelatedStateById = (targetId: number) => {
  const shouldKeep = (id: string | number) => {
    const idText = String(id);
    return !(idText === String(targetId) || idText.startsWith(`${targetId}-`));
  };

  selectedKeys.value = selectedKeys.value.filter(shouldKeep);
  expandedKeys.value = expandedKeys.value.filter(shouldKeep);
};

/**
 * 带确认提示的节点删除操作
 * @param node 要删除的节点
 */
const deleteNodeWithConfirm = (node: ResourceNode) => {
  const targetId = Number(node.id);

  Modal.confirm({
    title: '确认删除',
    content: `确定删除节点「${node.cModname}」吗？删除后不可恢复。`,
    okText: '确认删除',
    cancelText: '取消',
    onBeforeOk: async() => {
      const payload = { authResMenu: { id: node.id }}
      await delMenu(payload).then((res) => {
        if (res.success) {
          // ui中执行删除节点
          const removed = removeNodeById(treeData.value, targetId);
          if (!removed) {
            Message.error('删除失败，未找到目标节点');
            return;
          }
          treeData.value = [...treeData.value];
          removeRelatedStateById(targetId);

          Message.success(`${node.cModname}删除成功`);
          return true;
        } else {
          Message.error({
            closable: true,
            content: `error:${res.message}`,
          })
          return false;
        }
      })
    },
  });
};

/**
 * 刷新指定节点的子节点数据
 * @param node 要刷新的节点
 */
const refreshNodeChildren = async (node: ResourceNode) => {
  const targetId = Number(node.id);
  const children = await fetchChildren(node);

  const updated = replaceNodeChildren(treeData.value, targetId, children);
  if (!updated) {
    Message.error('刷新失败，未找到目标节点');
    return;
  }

  treeData.value = [...treeData.value];

  if (!expandedKeys.value.includes(targetId)) {
    expandedKeys.value = [...expandedKeys.value, targetId];
  }
};

/**
 * 递归替换指定节点的子节点
 * @param nodes 节点数组
 * @param targetId 目标节点ID
 * @param children 新的子节点数组
 * @returns 是否成功替换
 */
const replaceNodeChildren = (
  nodes: ResourceNode[],
  targetId: number,
  children: ResourceNode[]
): boolean => {
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.id === targetId) {
      node.children = children;
      return true;
    }

    if (node.children?.length) {
      const replaced = replaceNodeChildren(node.children, targetId, children);
      if (replaced) {
        return true;
      }
    }
  }

  return false;
};

/**
 * 判断是否允许拖放节点
 * @param options 拖放配置选项
 * @returns 是否允许拖放,目前只允许同层级移动
 */
const allowDrop = (options: { dropNode: ResourceNode; dropPosition: -1 | 0 | 1;}) => {
  return options.dropPosition === -1
}

/**
 * 处理节点拖放事件,更新树结构
 * @param dragNode 被拖动的节点
 * @param dropNode 目标节点
 * @param dropPosition 放置位置:-1(前),0(内),1(后)
 */
const onDrop = ({ dragNode, dropNode, dropPosition }: { dragNode: ResourceNode; dropNode: ResourceNode; dropPosition: number }) => {
  const data = treeData.value;
  const loop = (data: ResourceNode[], id: number, callback: (item: ResourceNode, index: number, arr: ResourceNode[]) => void) => {
    data.some((item, index, arr) => {
      if (item.id === id) {
        callback(item, index, arr);
        return true;
      }
      if (item.children) {
        return loop(item.children, id, callback);
      }
      return false;
    });
  };

  loop(data, dragNode.id, (_, index, arr) => {
    arr.splice(index, 1);
  });

  if (dropPosition === 0) {
    loop(data, dropNode.id, (item) => {
      item.children = item.children || [];
      item.children.push(dragNode);
    });
  } else {
    loop(data, dropNode.id, (_, index, arr) => {
      arr.splice(dropPosition < 0 ? index : index + 1, 0, dragNode);
    });
  }
}

/**
 * 拖放结束后的处理,同步节点排序到后端
 * @param ev 拖放事件对象
 * @param node 被拖动的节点
 */
const onDropEnd = (ev: DragEvent, node: any) => {
  const findSiblings = (data: ResourceNode[], targetId: number, callback: (siblings: ResourceNode[]) => void): boolean => {
    for (const item of data) {
      if (item.id === targetId) {
        callback(data);
        return true;
      }
      if (item.children) {
        const found = findSiblings(item.children, targetId, callback);
        if (found) return true;
      }
    }
    return false;
  };

  findSiblings(treeData.value, node.id, (siblings) => {
    const sortedIds = siblings.map(item => item.id);
    
    moveMenuOrder({ 'idList': sortedIds }).then(res => {
      Message.success({
        closable: true,
        content: res.message
      })
    })
  });
}

/**
 * 更新指定父节点下的子树数据
 * @param parentId 父节点ID
 */
const updateTree = (parentId: number) => {
  const node = findNodeById(treeData.value, parentId);
  if (node) {
    refreshNodeChildren(node);
  }
}

/**
 * 刷新多个指定节点的子节点数据
 * @param nodeIds 要刷新的节点ID数组
 */
const refreshNodes = ({ nodeIds }: { nodeIds: (string | number)[] }) => {
  nodeIds.forEach(nodeId => {
    const node = findNodeById(treeData.value, Number(nodeId));
    if (node) {
      refreshNodeChildren(node);
    }
  });
}

/**
 * 递归查找指定ID的节点
 * @param data 节点数组
 * @param targetId 目标节点ID
 * @returns 找到的节点对象,未找到返回null
 */
const findNodeById = (data: ResourceNode[], targetId: number): ResourceNode | null => {
  for (const item of data) {
    if (item.id === targetId) {
      return item;
    }
    if (item.children) {
      const found = findNodeById(item.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

const onSelect = (selectedKeys: number[], node: ResourceNode) => {
  emit('currentChange', selectedKeys, node)
}
</script>

<template>
  <div class="h-full overflow-auto">
    <SunnyResourceTree
      v-model:selected-keys="selectedKeys"
      v-model:expanded-keys="expandedKeys"
      :data="treeData"
      :fieldNames="{
        key: 'id',
        title: 'cModname',
        children: 'children',
      }"
      :load-more="loadMore"
      :context-menu-actions="contextMenuActions"
      blockNode
      :enable-root-context-menu="true"
      draggable
      :allow-drop="allowDrop"
      size="small"
      @drop="onDrop"
      @drag-end="onDropEnd"
      @select="onSelect"
    />

    <ModuleEditor ref="moduleEditor" @save="updateTree" />
    <UrlEditor ref="urlEditor" />
    <MenuPathEditor ref="menuPathEditor" @refresh-nodes="refreshNodes" />
  </div>
</template>
