<template>
  <div class="sunny-resource-tree">
    <Tree ref="treeRef" v-bind="$attrs">
      <template #title="nodeData">
        <Dropdown
          v-if="canShowContextMenu(nodeData)"
          trigger="contextMenu"
          @select="handleDropdownSelect($event, nodeData)"
        >
          <span class="sunny-resource-tree__title">
            <slot name="title" v-bind="nodeData">
              {{ getNodeTitle(nodeData) }}
            </slot>
          </span>
          <template #content>
            <Doption
              v-for="action in getNodeActions(nodeData)"
              :key="`${String(nodeData?.key)}-${action.key}`"
              :value="action.key"
              :disabled="isActionDisabled(action, nodeData)"
            >
              <span :class="{ 'sunny-resource-tree__danger': action.danger }">
                {{ action.label }}
              </span>
            </Doption>
          </template>
        </Dropdown>
        <template v-else>
          <slot name="title" v-bind="nodeData">
            {{ getNodeTitle(nodeData) }}
          </slot>
        </template>
      </template>

      <template v-for="name in passThroughSlotNames" #[name]="scope">
        <slot :name="name" v-bind="scope || {}"></slot>
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, useSlots } from 'vue';
import { Dropdown, Doption, Tree } from '@arco-design/web-vue';
import { useSunnyResourceTree } from './use-sunny-resource-tree';
import type {
  SunnyResourceTreeEmits,
  SunnyResourceTreeExpose,
  SunnyResourceTreeProps,
} from './types';

defineOptions({
  name: 'SunnyResourceTree',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SunnyResourceTreeProps>(), {
  contextMenuActions: () => [],
  actions: () => [],
  enableRootContextMenu: false,
});

const emit = defineEmits<SunnyResourceTreeEmits>();
const attrs = useAttrs();
const slots = useSlots();
const treeRef = ref<any>();

const {
  canShowContextMenu,
  getNodeActions,
  isActionDisabled,
  getNodeTitle,
  handleActionClick,
} = useSunnyResourceTree({
  props,
  emit: emit as any,
  attrs: attrs as Record<string, any>,
});

const handleDropdownSelect = (
  value: string | number | Record<string, any>,
  nodeData: Record<string, any>
) => {
  handleActionClick(value as string | number, nodeData);
};

const passThroughSlotNames = computed(() =>
  Object.keys(slots).filter((name) => name !== 'title')
);

const callTreeMethod = (method: string, ...args: any[]) => {
  return treeRef.value?.[method]?.(...args);
};

defineExpose<SunnyResourceTreeExpose>({
  getTree: () => treeRef.value,
  toggleCheck: (key, e) => callTreeMethod('toggleCheck', key, e),
  scrollIntoView: (options) => callTreeMethod('scrollIntoView', options),
  getSelectedNodes: () => callTreeMethod('getSelectedNodes'),
  getCheckedNodes: (options) => callTreeMethod('getCheckedNodes', options),
  getHalfCheckedNodes: () => callTreeMethod('getHalfCheckedNodes'),
  getExpandedNodes: () => callTreeMethod('getExpandedNodes'),
  checkAll: (checked) => callTreeMethod('checkAll', checked),
  checkNode: (key, checked, onlyCheckLeaf) =>
    callTreeMethod('checkNode', key, checked, onlyCheckLeaf),
  selectAll: (selected) => callTreeMethod('selectAll', selected),
  selectNode: (key, selected) => callTreeMethod('selectNode', key, selected),
  expandAll: (expanded) => callTreeMethod('expandAll', expanded),
  expandNode: (key, expanded) => callTreeMethod('expandNode', key, expanded),
});
</script>

<style scoped>
.sunny-resource-tree {
  width: 100%;
}

.sunny-resource-tree__title {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.sunny-resource-tree__danger {
  color: rgb(var(--danger-6));
}
</style>
