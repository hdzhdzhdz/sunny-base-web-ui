import { defineComponent, h, ref } from 'vue';
import { VxeButton } from 'vxe-pc-ui';
import { Tooltip as ATooltip } from '@arco-design/web-vue';

import { VxeGridApi } from './api';
import VxeGrid from './use-vxe-grid.vue';
import { createEditableClipConfig } from './clip-utils';

const EDIT_GRID_TIP =
  '1. 支持鼠标区域选取，Ctrl+A 全选\n2. 支持 Ctrl+C/X/V 复制/剪切/粘贴（不可编辑或禁用的列自动跳过）\n3. 支持 Tab/方向键/Shift+方向键导航\n4. 支持 Ctrl+F 查找/Ctrl+H 替换\n5. 支持 Ctrl+Z 撤销';

export function useSunnyEditGrid(options: any) {
  const gridRef = ref();
  const api = new VxeGridApi(gridRef, options);

  const Grid = defineComponent(
    (props, { attrs, slots }) => {
      const { gridEvents, gridOptions } = options;

      const listeners = Object.entries(gridEvents || {}).reduce((acc: Record<string, any>, [key, val]) => {
        const eventName = `on${key.charAt(0).toUpperCase() + key.slice(1)}`;
        acc[eventName] = val;
        return acc;
      }, {});

      return () => {
        const tipNode = h(
          ATooltip,
          { content: EDIT_GRID_TIP, position: 'left' },
          {
            default: () =>
              h(
                VxeButton,
                {
                  circle: true,
                  size: gridOptions?.size || 'small',
                  style: 'width: 34px; height: 34px; margin-right: 0.8em; font-size: 18px',
                },
                { default: () => '!' },
              ),
          },
        );

        // 注入提示到 toolbarConfig.slots.toolSuffix（vxe-table 内置工具栏）
        const originalToolSuffix = gridOptions?.toolbarConfig?.slots?.toolSuffix;
        const toolbarConfig = {
          ...gridOptions?.toolbarConfig,
          slots: {
            ...gridOptions?.toolbarConfig?.slots,
            toolSuffix: (params: any) => {
              const nodes: any[] = [tipNode];
              if (originalToolSuffix) {
                nodes.push(...(originalToolSuffix(params) || []));
              }
              return nodes;
            },
          },
        };

        // 注入提示到 #toolbar 插槽（自定义工具栏）
        const originalToolbarSlot = slots.toolbar;
        const mergedSlots = {
          ...slots,
          ...(originalToolbarSlot
            ? {
                toolbar: (...args: any[]) => [
                  h('div', { class: 'flex items-center w-full' }, [
                    h('div', { class: 'flex-1' }, originalToolbarSlot(...args)),
                    h('div', { class: 'flex-shrink-0' }, tipNode),
                  ]),
                ],
              }
            : {}),
        };

        return h(
          VxeGrid,
          {
            ref: gridRef,
            mouseConfig: { area: true }, // 开启区域选取
            areaConfig: {
              multiple: true, // 多区域选取
              showColumnStatus: true, // 列选取状态
              showRowStatus: true, // 行选取状态
              selectCellToRow: true, // 点击单元格自动选取当前行
            },
            editConfig: { mode: 'cell', trigger: 'click' },
            keyboardConfig: {
              isAll: true, // 快捷键全选
              isArrow: true, // 方向键
              isDel: true, // 删除键编辑
              isBack: true, // Backspace 键
              isEnter: true, // 回车键
              isTab: true, // Tab 键
              isShift: true, // Shift+方向键延伸区域
              isEdit: true, // 快捷键编辑
              isMerge: false, // 合并/取消合并
              isClip: true, // 复制/剪贴/粘贴
              isFNR: true, // 查找和替换
              isChecked: true, // 空格键切换复选框
              arrowCursorLock: true, // 方向键光标锁（非聚焦编辑状态可切换单元格）
              enterToTab: false, // 回车键改为 Tab 行为
              isLastEnterAppendRow: false, // 末行回车追加行
              isUndoRedo: true, // 撤销/重做
            },
            ...props,
            ...attrs,
            ...gridOptions,
            clipConfig: gridOptions?.clipConfig ?? createEditableClipConfig(),
            toolbarConfig,
            ...listeners,
          },
          mergedSlots,
        );
      };
    },
  );

  return [Grid, api] as const;
}