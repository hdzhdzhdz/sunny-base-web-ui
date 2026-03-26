<script setup lang="ts">
import { ref, nextTick, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useSunnyForm, Modal } from '@sunny-base-web/ui'
import { Tree, Checkbox as ACheckbox } from '@arco-design/web-vue'
import { requestClient } from '../../../api/request'
import { getRoleConfig } from './config'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const visible = ref(false)
const type = ref<'add' | 'edit'>('add')
const modalRef = ref()
const treeRef = ref()
const isEditingInit = ref(false);
const emit = defineEmits<{
  success: []
}>()

const treeData = reactive({
  treeData: [],
  defaultChecked: [],
  expandedKeys: []
})

const props = {
  label: 'label',
  children: 'children'
}

const getResourceTree = async (cSystem: string) => {
  const res = await requestClient.post('/core/authResource/getResourceTreeMenu', {
    authResMenu: {
      cSystem: cSystem
    }
  })
  if (res.code === 200) {
    const rawData = res.result
    treeData.treeData = processTreeData(rawData)
    initButtonChecked(treeData.treeData)
  }
}

const initButtonChecked = (nodes: any[]) => {
  nodes.forEach(node => {
    if (node.buttonList && node.buttonList.length) {
      node.buttonList.forEach((btn: any) => {
        btn.checked = treeData.defaultChecked.includes(String(btn.id))
      })
    }
    if (node.children) {
      initButtonChecked(node.children)
    }
  })
}

// 递归获取所有子节点（包括子节点的按钮）
const getAllChildrenKeys = (node: any): string[] => {
  let keys: string[] = [];
  
  // 添加当前节点的按钮
  if (node.buttonList && node.buttonList.length) {
    keys = keys.concat(node.buttonList.map((btn: any) => btn.id));
  }
  
  // 递归处理子节点
  if (node.children && node.children.length) {
    node.children.forEach((child: any) => {
      keys.push(child.id);
      keys = keys.concat(getAllChildrenKeys(child));
    });
  }
  
  return keys;
};

// 递归查找节点的所有父节点
const getAllParentKeys = (targetId: string): string[] => {
  const keys: string[] = [];

  const findParent = (nodes: any[], targetId: string, ancestors: string[] = []): boolean => {
    for (const node of nodes) {
      if (node.id === targetId) {
        // 找到目标节点，将祖先路径加入结果集
        keys.push(...ancestors);
        return true;
      }
      if (node.children) {
        // 递归查找子节点，将当前节点加入祖先路径
        if (findParent(node.children, targetId, [...ancestors, node.id])) {
          return true;
        }
      }
    }
    return false;
  };

  findParent(treeData.treeData, targetId);
  return keys;
};

const checkClick = (checkedKeys: any, info: any) => {
  const node = info.node;
  const isChecked = info.checked;
  
  // 创建新的选中键数组
  const newCheckedKeys = [...checkedKeys];
  
  if (isChecked) {
    // 勾选节点时：勾选所有父级、下级和下级的按钮
    
    // 1. 添加所有父级节点
    const parentKeys = getAllParentKeys(node.id);
    parentKeys.forEach(key => {
      if (!newCheckedKeys.includes(key)) {
        newCheckedKeys.push(key);
      }
    });
    
    // 2. 添加当前节点的按钮
    if (node.buttonList && node.buttonList.length) {
      node.buttonList.forEach((btn: any) => {
        if (!newCheckedKeys.includes(btn.id)) {
          newCheckedKeys.push(btn.id);
        }
        btn.checked = true;
      });
    }
    
    // 3. 添加所有下级节点和按钮
    const childKeys = getAllChildrenKeys(node);
    childKeys.forEach(key => {
      if (!newCheckedKeys.includes(key)) {
        newCheckedKeys.push(key);
      }
    });
    
    // 更新下级按钮的 checked 状态
    const updateChildButtonsChecked = (nodes: any[], checked: boolean) => {
      nodes.forEach(childNode => {
        if (childNode.buttonList && childNode.buttonList.length) {
          childNode.buttonList.forEach((btn: any) => {
            btn.checked = checked;
          });
        }
        if (childNode.children) {
          updateChildButtonsChecked(childNode.children, checked);
        }
      });
    };
    
    if (node.children) {
      updateChildButtonsChecked(node.children, true);
    }
    
  } else {
    // 取消勾选节点时：取消所有下级和下级的按钮
    
    // 1. 移除当前节点的按钮
    if (node.buttonList && node.buttonList.length) {
      node.buttonList.forEach((btn: any) => {
        const index = newCheckedKeys.indexOf(btn.id);
        if (index !== -1) {
          newCheckedKeys.splice(index, 1);
        }
        btn.checked = false;
      });
    }
    
    // 2. 移除所有下级节点和按钮
    const childKeys = getAllChildrenKeys(node);
    childKeys.forEach(key => {
      const index = newCheckedKeys.indexOf(key);
      if (index !== -1) {
        newCheckedKeys.splice(index, 1);
      }
    });
    
    // 更新下级按钮的 checked 状态
    const updateChildButtonsChecked = (nodes: any[], checked: boolean) => {
      nodes.forEach(childNode => {
        if (childNode.buttonList && childNode.buttonList.length) {
          childNode.buttonList.forEach((btn: any) => {
            btn.checked = checked;
          });
        }
        if (childNode.children) {
          updateChildButtonsChecked(childNode.children, checked);
        }
      });
    };
    
    if (node.children) {
      updateChildButtonsChecked(node.children, false);
    }
  }
  
  // 更新 treeData.defaultChecked
  treeData.defaultChecked = newCheckedKeys;
};

const [Form, formApi] = useSunnyForm({
  layout: 'horizontal',
  size: 'small',
  labelWidth: 100,
  showDefaultActions: false,
  scrollToFirstError: true,
  schema: [],
})

const { addEditFormSchema } = getRoleConfig({ t, formApi })

const handleSystemChange = async (value: string) => {
  if (value) {
    await getResourceTree(value)
    treeData.defaultChecked = []
  } else {
    treeData.treeData = []
    treeData.defaultChecked = []
  }
}

formApi.setState({
  handleValuesChange: (changedValues: any, allValues: any) => {
    if ('cSystem' in changedValues && !isEditingInit.value) {
      handleSystemChange(changedValues.cSystem)
    }
  }
})

const processTreeData = (nodes: any[]): any[] => {
  return nodes.map(node => {
    const label = node.label || node.name || node.text || node.cName || node.id;
    const newNode = { ...node, label, expanded: false };

    if (newNode.children && newNode.children.length) {
      const buttonList: any[] = [];
      const otherChildren: any[] = [];
      newNode.children.forEach((child: any) => {
        if (child.cType === '2') {
          const btnLabel = child.label || child.name || child.text || child.cName || child.id;
          // 确保 checked 状态正确设置
          buttonList.push({ ...child, label: btnLabel, checked: treeData.defaultChecked.includes(String(child.id)) });
        } else {
          otherChildren.push(processTreeData([child])[0]);
        }
      });
      newNode.buttonList = buttonList;
      newNode.children = otherChildren.length ? otherChildren : undefined;
    }
    return newNode;
  });
};

// 查找包含指定按钮的节点
const findNodeByButtonId = (nodes: any[], buttonId: string): any => {
  for (const node of nodes) {
    if (node.buttonList && node.buttonList.some((btn: any) => btn.id === buttonId)) {
      return node;
    }
    if (node.children) {
      const found = findNodeByButtonId(node.children, buttonId);
      if (found) return found;
    }
  }
  return null;
};

const changeCheck = (data: any) => {
  if (data.checked) {
    if (!treeData.defaultChecked.includes(data.id)) {
      treeData.defaultChecked.push(data.id);
    }
    
    // 找到按钮所属的节点
    const node = findNodeByButtonId(treeData.treeData, data.id);
    if (node) {
      // 勾选节点
      if (!treeData.defaultChecked.includes(node.id)) {
        treeData.defaultChecked.push(node.id);
      }
      
      // 勾选节点的所有父级（需要在树结构中查找父级）
      const findParentNodes = (targetNode: any, allNodes: any[]): string[] => {
        let parentKeys: string[] = [];
        
        const findParentRecursive = (nodes: any[], targetId: string): any => {
          for (const node of nodes) {
            if (node.children) {
              if (node.children.some(child => child.id === targetId)) {
                return node;
              }
              const found = findParentRecursive(node.children, targetId);
              if (found) {
                parentKeys.push(node.id);
                return found;
              }
            }
          }
          return null;
        };
        
        let current = targetNode;
        while (current) {
          const parent = findParentRecursive(allNodes, current.id);
          if (parent) {
            parentKeys.push(parent.id);
            current = parent;
          } else {
            break;
          }
        }
        
        return parentKeys;
      };
      
      const parentKeys = findParentNodes(node, treeData.treeData);
      parentKeys.forEach(key => {
        if (!treeData.defaultChecked.includes(key)) {
          treeData.defaultChecked.push(key);
        }
      });
    }
    
  } else {
    const idx = treeData.defaultChecked.indexOf(data.id);
    if (idx !== -1) {
      treeData.defaultChecked.splice(idx, 1);
    }
  }
};

const handleNodeExpand = (keys: string[], node: any, event: Event) => {
  treeData.expandedKeys = keys;
}

const addInit = async() => {
  visible.value = true
  type.value = 'add'
  formApi.setState({ schema: addEditFormSchema })
  formApi.resetForm()
  
  treeData.treeData = []
  treeData.defaultChecked = []
  treeData.treeData = []
  
  await nextTick()
  if (modalRef.value) {
    modalRef.value.toggleMaximize()
  }
}

const editInit = async (record: any) => {
  isEditingInit.value = true; // 开始初始化
  visible.value = true;
  type.value = 'edit';
  formApi.setState({ schema: addEditFormSchema });
  formApi.resetForm();

  const res = await requestClient.post<any>('/core/authRole/update_init', { authRole: { id: record.id } });
  if (res.code === 200) {
    formApi.setValues(res.result.role, false);
    formApi.updateSchema([{
      fieldName: 'cRolenumb',
      componentProps: { disabled: true }
    }]);

    treeData.defaultChecked = (res.result.resourceidList || []).map(String);
    const rawTreeList = res.result.treeList || [];
    treeData.treeData = processTreeData(rawTreeList);
    initButtonChecked(treeData.treeData);
    treeData.expandedKeys = []
    
    await nextTick();
  }

  await nextTick();
  if (modalRef.value) {
    modalRef.value.toggleMaximize();
  }

  isEditingInit.value = false; // 结束初始化
};

const detailInit = (record: any) => {
  editInit(record)
}

defineExpose({
  addInit,
  editInit,
  detailInit
})

// 提交表单
const handleSubmit = async() => {
  const { valid } = await formApi.validate()
  if (!valid) return false
  const values = await formApi.getValues()

  const params = {
    authRole: values,
    idList: treeData.defaultChecked
  }
  const res = await requestClient.post<any>(type.value === 'add' ? '/core/authRole/saveRole' : '/core/authRole/saveUpdateRole', params)
    
  if (res.code === 200) {
    Message.success(res.message)
    visible.value = false
    emit('success')
    return true
  } else {
    Message.error(res.message)
    return false
  }
}

// 取消
function handleClose() {
  visible.value = false
}
</script>

<template>
  <Modal
    ref="modalRef"
    :model-value="visible"
    :title="type === 'add' ? t('role.addTitle') : t('role.editTitle')"
    :on-before-ok="handleSubmit"
    @close="handleClose"
  >
    <div class="h-full flex flex-col">
      <Form />
      <div class="mt-5 flex-1 overflow-hidden">
        <h4 class="mb-3 text-sm font-medium">{{ t('role.resourceConfig') }}</h4>
        <div class="h-[calc(100%-36px)] overflow-auto">
        <Tree
          ref="treeRef"
          :data="treeData.treeData"
          node-key="id"
          :checkable="true"
          :check-strictly="true"
          :checked-keys="treeData.defaultChecked"
          :expanded-keys="treeData.expandedKeys"
          :field-names="{ key: 'id', title: 'label', children: 'children', disabled: 'disabled' }"
          :default-expand-all="false"
          @expand="handleNodeExpand"
          @check="checkClick"
        >
          <template #extra="nodeData">
            <div
              class="extra-container ml-[250px] mr-auto"
              style="flex-shrink: 0; max-width: 70%; overflow-x: auto;"
            >
              <div
                v-if="nodeData?.buttonList && nodeData.buttonList.length"
                class="flex flex-nowrap gap-3"
                style="width: max-content;"
              >
                <ACheckbox
                  v-for="item in nodeData.buttonList"
                  :key="item.id"
                  v-model="item.checked"
                  :disabled="item.disabled"
                  class="flex-shrink-0 whitespace-nowrap"
                  @change="changeCheck(item)"
                >
                  {{ item.label }}
                </ACheckbox>
              </div>
            </div>
          </template>
        </Tree>
        </div>
      </div>
    </div>
  </Modal>
</template>