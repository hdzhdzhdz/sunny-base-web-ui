import { nextTick, type Ref } from 'vue';
import type { VxeGridInstance } from 'vxe-table';
import { transformToObjectArray, transformToString } from '@sunny-base-web/utils';

export class VxeGridApi {
  private gridRef: Ref<any>;
  private options: any;

  constructor(gridRef: Ref<any>, options: any) {
    this.gridRef = gridRef;
    this.options = options;
  }

  private get grid(): VxeGridInstance | undefined {
    return this.gridRef.value?.getGrid?.() || this.gridRef.value;
  }

  /**
   * 从列配置中提取需要做 对象数组↔字符串 转换的字段信息
   */
  private getObjectValueFields(): { field: string; valueKey: string; labelKey: string; displayField?: string }[] {
    const columns = this.options?.gridOptions?.columns || [];
    const fields: { field: string; valueKey: string; labelKey: string; displayField?: string }[] = [];

    for (const col of columns) {
      const fieldNames = col.params?.fieldNames;
      if (fieldNames?.value && col.field) {
        fields.push({
          field: col.field,
          valueKey: fieldNames.value,
          labelKey: fieldNames.label || 'label',
          displayField: col.params?.displayField,
        });
      }
    }

    return fields;
  }

  /**
   * 字符串 → 对象数组
   * 支持从 displayField 读取 label 字符串
   */
  private transformStringToObjectArray(data: any[]) {
    const fields = this.getObjectValueFields();
    if (fields.length === 0) return;

    for (const row of data) {
      for (const { field, valueKey, labelKey, displayField } of fields) {
        const value = row[field];
        if (typeof value !== 'string' || value === '') continue;
        if (Array.isArray(value)) continue;

        const displayValue = displayField && row[displayField] ? String(row[displayField]) : undefined;
        row[field] = transformToObjectArray(value, { valueKey, labelKey }, displayValue);
      }
    }
  }

  /**
   * 对象数组 → 字符串
   * 同时回写 displayField
   */
  private transformObjectArrayToString(data: any[]) {
    const fields = this.getObjectValueFields();
    if (fields.length === 0) return;

    for (const row of data) {
      for (const { field, valueKey, labelKey, displayField } of fields) {
        const value = row[field];
        if (!Array.isArray(value)) continue;

        const result = transformToString(value, { valueKey, labelKey });
        row[field] = result.value;

        if (displayField) {
          row[displayField] = result.displayValue;
        }
      }
    }
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
   * 自动将字符串格式转换为组件需要的对象数组格式
   * @param data
   */
  async reloadData(data: any[]) {
    const $grid = this.grid;
    if ($grid) {
      this.transformStringToObjectArray(data);
      await $grid.reloadData(data);
    }
  }

  /**
   * 获取完整的全量表体数据
   * 自动将对象数组转换回字符串格式
   * @returns
   */
  async getFullData() {
    const $grid = this.grid;
    if ($grid) {
      const data = await $grid.getFullData();
      this.transformObjectArrayToString(data);
      return data;
    }
    return [];
  }

  /**
   * 获取选中的行数据
   * 自动将对象数组转换回字符串格式
   * @returns
   */
  async getCheckboxRecords() {
    const $grid = this.grid;
    if ($grid) {
      const records = await $grid.getCheckboxRecords();
      this.transformObjectArrayToString(records);
      return records;
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
      if (record) {
        this.transformStringToObjectArray([record]);
      }
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
