import type { VxeGridProps } from 'vxe-table';
import type { FormSchema } from '@sunny-base-web/ui';
import { markRaw } from 'vue';
import { SunnyBusinessSearch, SunnyCustomizeSelect } from '@sunny-base-web/ui';
import type { TestVO } from './types';

// 使用 markRaw 标记组件，避免 Vue 将组件转为响应式对象
const BusinessSearch = markRaw(SunnyBusinessSearch);
const CustomizeSelect = markRaw(SunnyCustomizeSelect);

/**
 * 搜索表单配置
 *
 * 组件类型示例：
 * - Input: 文本输入框
 * - Select: 下拉选择框
 * - Checkbox: 复选框
 * - Radio: 单选框
 * - Switch: 开关
 * - DatePicker: 日期选择器（单个）
 * - RangePicker: 日期范围选择器
 * - TimePicker: 时间选择器
 * - SunnyBusinessSearch: 业务搜索（弹窗选择用户、部门等）
 */
export const searchFormSchema: FormSchema[] = [
  // Input - 文本输入框
  {
    fieldName: 'cName',
    label: '姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入姓名',
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'cCrenumb',
    label: '创建人工号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入创建人工号',
      allowClear: true
    },
    colProps: { span: 4 }
  },
  // Select - 下拉选择框
  {
    fieldName: 'nZt',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    },
    colProps: { span: 4 }
  },
  // SunnyBusinessSearch - 业务搜索（弹窗选择）
  {
    fieldName: 'businessSearchValue',
    label: '业务搜索',
    component: BusinessSearch,
    componentProps: () => ({
        cNum: 'XTGL_USER_ROLE', // 业务编码，必填项
        placeholder: '请选择用户',
        modalProps: {
          // 在 modalProps 中配置 multiple，优先级最高
          multiple: true,
          fieldNames: {
            label: 'C_ROLENAME',
            value: 'ID',
            desc: 'C_ROLENUMB'
          }
        }
      }),
    colProps: { span: 4 }
  },
  // DatePicker - 日期选择器（单个）
  {
    fieldName: 'singleDate',
    label: '单日期',
    component: 'DatePicker',
    componentProps: {
      placeholder: '请选择日期',
      allowClear: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    },
    colProps: { span: 4 }
  },
  // RangePicker - 日期范围选择器
  {
    fieldName: 'dCredate',
    label: '创建日期',
    component: 'RangePicker',
    componentProps: {
      placeholder: ['开始日期', '结束日期'],
      allowClear: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    },
    colProps: { span: 4 }
  },
  // TimePicker - 时间选择器
  {
    fieldName: 'timeRange',
    label: '时间段',
    component: 'TimePicker',
    componentProps: {
      placeholder: '请选择时间',
      allowClear: true,
      format: 'HH:mm:ss',
      mode: 'time-range'
    },
    colProps: { span: 4 }
  },
  // CustomizeSelect - 自定义选择器
  {
    fieldName: 'customizeSelectValue',
    label: '自定义选择',
    component: CustomizeSelect,
    componentProps: {
      placeholder: '请选择',
      allowClear: true,
      cNum: 'user_search', // 业务编码，必填项
      // 示例配置，实际使用需要根据业务配置
      fieldConfig: {
        label: 'name',
        value: 'id'
      }
    },
    colProps: { span: 4 }
  }
];

/**
 * 表格列配置
 */
export const tableColumns: VxeGridProps<TestVO>['columns'] = [
  { type: 'checkbox', width: 50 }, // 批量选择列
  { type: 'seq', width: 60, title: '序号' },
  {
    field: 'cName',
    title: '姓名',
    minWidth: 120,
    sortable: true,  // 启用排序
    filters: [{ data: '' }],
    filterRender: { name: 'MyFilterComplex' },
    slots: { default: 'cNameSlot' }  // 使用自定义插槽
  },
  {
    field: 'cCrenumb',
    title: '创建人工号',
    minWidth: 120,
    sortable: true,  // 启用排序
    filters: [{ data: '' }],
    filterRender: { name: 'MyFilterComplex' }
  },
  {
    field: 'nZt',
    title: '状态',
    width: 100,
    sortable: true,  // 启用排序
    slots: { default: 'statusTag' } // 使用插槽自定义渲染状态标签
  },
  {
    field: 'nNum',
    title: '数字',
    width: 120,
    sortable: true,  // 启用排序
    slots: { default: 'nNumCell' } // 使用插槽实现单元格变色
  },
  {
    field: 'cName1',
    title: '名称1',
    minWidth: 120,
    sortable: true,  // 启用排序
    slots: { default: 'cName1Cell' }  // 使用插槽实现单元格高亮
  },
  {
    field: 'cName2',
    title: '名称2',
    minWidth: 120,
    sortable: true  // 启用排序
  },
  {
    field: 'dCredate',
    title: '创建日期',
    width: 180,
    sortable: true  // 启用排序
  },
  {
    field: 'cName3',
    title: '名称3',
    minWidth: 120,
    sortable: true  // 启用排序
  },
  {
    title: '操作',
    width: 160,
    fixed: 'right',
    slots: { default: 'action' } // 操作列插槽
  }
];

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'testQuery',
  nResourceid: 181,
  cModnumb: 'f4e45e1f-c6a8-454e-aaed-fd187a2c8e7d'
};
