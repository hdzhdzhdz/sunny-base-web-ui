import { nextTick, type Ref } from 'vue';
import type { VxeGridInstance } from 'vxe-table';

export class VxeGridApi {
  private gridRef: Ref<any>;

  constructor(gridRef: Ref<any>) {
    this.gridRef = gridRef;
  }

  private get grid(): VxeGridInstance | undefined {
    return this.gridRef.value?.getGrid?.() || this.gridRef.value;
  }

  /**
   * 新增数据
   * @param params 
   * @returns 
   */
  async addEvent(params: {
    // 默认值
    record?: any, 
    // 插入位置，默认最后，-1表示最后
    index?: number
  } = {}) {
    const $grid = this.grid;
    if ($grid) {
      const { record = {}, index = -1 } = params;
      
      const { row: newRow } = await $grid.insertAt(record, index);
      
      await nextTick();
      $grid.setEditRow(newRow);
    }
  }

  /**
   * 获取当前选中行
   */
  getSelection() {
    const $grid = this.grid;
    if ($grid) {
      return $grid.getCheckboxRecords();
    }
    return [];
  }

  /**
   * 删除选中行
   */
  async deleteSelection() {
    const $grid = this.grid;
    if ($grid) {
      const selectRecords = $grid.getCheckboxRecords();
      if (selectRecords.length > 0) {
        await $grid.remove(selectRecords);
      }
    }
  }

  /**
   * 提交代理
   */
  commitProxy(code: string | { code: string; target?: string | undefined; force?: boolean | undefined }, ...args: any[]) {
    const $grid = this.grid;
    if ($grid) {
      return $grid.commitProxy(code, ...args);
    }
  }
}
