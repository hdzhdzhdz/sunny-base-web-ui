<script setup lang="ts">
import { ref } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { SunnyResourceTree } from '@sunny-base-web/ui';
import { findMenuAll, getMenu, delMenu, moveMenuOrder, findMenuTreeFuzzy } from '../../api/resource'

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

const treeData = ref<ResourceNode[]>(JSON.parse(import.meta.env.VITE_APP_SYSTEM));

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

const isRootNode = (node: ResourceNode) => node.id === 0;

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

const appendChildToNode = (
  nodes: ResourceNode[],
  targetId: number,
  child: ResourceNode
): boolean => {
  for (const node of nodes) {
    if (node.id === targetId) {
      node.children = [...(node.children ?? []), child];
      return true;
    }

    if (node.children?.length) {
      const appended = appendChildToNode(node.children, targetId, child);
      if (appended) {
        return true;
      }
    }
  }

  return false;
};

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

const removeRelatedStateById = (targetId: number) => {
  const shouldKeep = (id: string | number) => {
    const idText = String(id);
    return !(idText === String(targetId) || idText.startsWith(`${targetId}-`));
  };

  selectedKeys.value = selectedKeys.value.filter(shouldKeep);
  expandedKeys.value = expandedKeys.value.filter(shouldKeep);
};

const loadMore = async (node: ResourceNode) => {
  const children = await fetchChildren(node);
  node.children = children;
  treeData.value = [...treeData.value];
};

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

const editResource = (node: ResourceNode) => {
  // 远程获取menu信息
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

  // Message.success(`已刷新节点 ${node.cModname} 下的子节点`);
};

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
    handler: (node: ResourceNode) => menuPathEditor?.value.openEditor(node),
  },
  {
    key: 'refresh',
    label: '刷新列表',
    handler: (node: ResourceNode) => refreshNodeChildren(node),
  },
];

// 树节点移动排序
const allowDrop = (options: { dropNode: ResourceNode; dropPosition: -1 | 0 | 1;}) => {
  return options.dropPosition === -1 // 只允许同层级移动
}

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
    // console.log('同一层级的所有节点数据:', siblings);
    // console.log('排序后的节点ID数组:', sortedIds);
    
    moveMenuOrder({ 'idList': sortedIds }).then(res => {
      Message.success({
        closable: true,
        content: res.message
      })
    })
  });
}

const updateTree = (parentId: number) => {
  const node = findNodeById(treeData.value, parentId);
  if (node) {
    refreshNodeChildren(node);
  }
}

const refreshNodes = ({ nodeIds }: { nodeIds: (string | number)[] }) => {
  nodeIds.forEach(nodeId => {
    const node = findNodeById(treeData.value, Number(nodeId));
    if (node) {
      refreshNodeChildren(node);
    }
  });
}

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
      @drop="onDrop"
      @drag-end="onDropEnd"
    />

    <ModuleEditor ref="moduleEditor" @save="updateTree" />
    <UrlEditor ref="urlEditor" />
    <MenuPathEditor ref="menuPathEditor" @refresh-nodes="refreshNodes" />
  </div>
</template>
