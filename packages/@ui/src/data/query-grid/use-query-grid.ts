import { defineComponent, h, ref } from 'vue';
import { VxeButton } from 'vxe-pc-ui';
import { Tooltip as ATooltip } from '@arco-design/web-vue';

import { VxeGridApi } from './api';
import VxeGrid from './use-query-grid.vue';

export function useSunnyQueryGrid(options: any) {
  const gridRef = ref();
  const api = new VxeGridApi(gridRef);
  const { gridEvents, gridOptions } = options;
  const showSelectionCount = gridOptions?.showSelectionCount;
  const gridTip = gridOptions?.gridTip;

  const selectionCount = ref(0);

  const updateSelectionCount = () => {
    const $grid = gridRef.value?.getGrid?.() || gridRef.value;
    if (!$grid) return;
    const records = $grid.getCheckboxRecords?.() || [];
    const reserved = $grid.getCheckboxReserveRecords?.() || [];
    selectionCount.value = records.length + reserved.length;
  };

  const clearSelection = () => {
    const $grid = gridRef.value?.getGrid?.() || gridRef.value;
    if ($grid) {
      // 清当前页选中
      $grid.clearCheckboxRow();
      // 清跨页保留的选中（reserve）
      const reserved = $grid.getCheckboxReserveRecords?.() || [];
      reserved.forEach((row: any) => {
        $grid.setCheckboxRow(row, false);
      });
      selectionCount.value = 0;
    }
  };

  const listeners = Object.entries(gridEvents || {}).reduce((acc: Record<string, any>, [key, val]) => {
    const eventName = `on${key.charAt(0).toUpperCase() + key.slice(1)}`;
    acc[eventName] = val;
    return acc;
  }, {});

  const Grid = defineComponent(
    (props, { attrs, slots }) => {
      return () => {
        const count = selectionCount.value;

        const toolbarConfig = (showSelectionCount || gridTip) && gridOptions?.toolbarConfig
          ? {
              ...gridOptions.toolbarConfig,
              slots: {
                ...gridOptions.toolbarConfig.slots,
                toolSuffix: (params: any) => {
                  const nodes: any[] = [];

                  if (count > 0) {
                    nodes.push(
                      h('span', {
                        class: 'inline-flex items-center gap-1 self-center mr-2 px-2 py-0.5 rounded text-xs text-[rgb(var(--primary-6))] whitespace-nowrap select-none',
                        style: 'background-color: rgba(var(--primary-6), 0.08)',
                      }, [
                        h('span', { class: 'leading-5' }, `已选 ${count} 项`),
                        h('span', {
                          class: 'inline-flex items-center justify-center w-[18px] h-[18px] rounded-full cursor-pointer text-[rgb(var(--primary-6))] transition-all duration-150 hover:bg-[rgba(var(--primary-6),0.15)] active:bg-[rgba(var(--primary-6),0.25)]',
                          title: '清空',
                          onClick: clearSelection,
                        }, '×'),
                      ])
                    );
                  }

                  if (gridTip) {
                    nodes.push(
                      h(ATooltip, { content: gridTip, position: 'left' }, {
                        default: () => h(VxeButton, {
                          circle: true,
                          size: gridOptions?.size || 'small',
                          style: 'width: 27px; height: 24px; margin-right: 0.8em',
                        }, { default: () => '!' }),
                      })
                    );
                  }

                  const originalToolSuffix = gridOptions.toolbarConfig.slots?.toolSuffix;
                  if (originalToolSuffix) {
                    nodes.push(...(originalToolSuffix(params) || []));
                  }

                  return nodes;
                },
              },
            }
          : gridOptions?.toolbarConfig;

        return h(VxeGrid, {
          ref: gridRef,
          ...props,
          ...attrs,
          ...gridOptions,
          ...(toolbarConfig ? { toolbarConfig } : {}),
          ...listeners,
          ...(showSelectionCount ? { onCheckboxChange: updateSelectionCount, onCheckboxAll: updateSelectionCount } : {}),
        }, slots);
      };
    }
  );

  return [Grid, api] as const;
}
