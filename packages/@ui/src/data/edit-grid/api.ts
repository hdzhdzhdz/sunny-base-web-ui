import { nextTick, type Ref } from 'vue';
import type { VxeGridInstance } from 'vxe-table';

export class VxeGridApi {
  private gridRef: Ref<any>;
  // private options: any;

  constructor(gridRef: Ref<any>, _options: any) {
    this.gridRef = gridRef;
    // this.options = options;
  }

  private get grid(): VxeGridInstance | undefined {
    return this.gridRef.value?.getGrid?.() || this.gridRef.value;
  }

  /**
   * 获取 VxeGrid 实例
   * 可以直接调用 VxeTable 的所有方法
   * @returns VxeGridInstance | undefined
   */
  get $grid(): VxeGridInstance | undefined {
    return this.grid;
  }

  /**
   * 加载数据并清除所有状态
   * @param data
   */
  async reloadData(data: any[]) {
    const $grid = this.grid;
    if ($grid) {
      await $grid.reloadData(data);
    }
  }

  /**
   * 获取完整的全量表体数据
   * @returns
   */
  async getFullData() {
    const $grid = this.grid;
    if ($grid) {
      return $grid.getFullData();
    }
    return [];
  }

  /**
   * 获取选中的行数据
   * @returns
   */
  async getCheckboxRecords() {
    const $grid = this.grid;
    if ($grid) {
      return $grid.getCheckboxRecords();
    }
    return [];
  }


  /**
   * 新增数据并设置为可编辑状态
   * @record 默认值
   * @index 插入位置，null从第一行插入、-1 从最后插入
   */
  async addEvent(record?: any, index?: number) {
    const $grid = this.grid;
    if ($grid) {
      const { row: newRow } = await $grid.insertAt(record, index);

      await nextTick();
      $grid.setEditRow(newRow);
    }
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
   * 校验表格数据
   * @param full 是否校验全量数据
   * @returns 校验错误映射，如果返回 null 表示校验通过
   */
  async validate(full = true) {
    const $grid = this.grid;
    if ($grid) {
      return $grid.validate(full);
    }
    return null;
  }
}
