import type { VxeGridProps } from 'vxe-table';
import type { FormSchema } from '@sunny-base-web/ui';
import { filterSelect } from '@sunny-base-web/effects'

const userYhlxOpts = [
  { label: "普通用户", value: "0" },
  { label: "超级用户", value: "1" }
]

const userSfqyOpts = [
  { label: "启用", value: "0" },
  { label: "禁用", value: "1" }
]

const nYesNo = [
  { label: "是", value: "1" },
  { label: "否", value: "0" }
]

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    fieldName: 'cUsernumb',
    label: '用户编号',
    component: 'Input',
    componentProps: {
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'cUsername',
    label: '用户姓名',
    component: 'Input',
    componentProps: {
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'cAdmin',
    label: '用户类型',
    component: 'Select',
    componentProps: {
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'dLastLoginList',
    label: '最近登录时间',
    component: 'Input',
    componentProps: {
      allowClear: true
    },
    colProps: { span: 4 }
  },
];

/**
 * 表格列配置
 */
export const tableColumns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 40 },
  { field: 'id', title: 'ID', minWidth: 80 },
  { field: 'cUsernumb', title: '用户编号', minWidth: 120 },
  { field: 'cUsername', title: '用户姓名', minWidth: 120 },
  {
    field: 'cAdmin',
    title: '用户类型',
    minWidth: 120,
    params: { optionlist: userYhlxOpts },
    formatter: ({ cellValue, column }) => filterSelect(cellValue, column.params.optionlist),
  },
  { field: 'cWork', title: '关联工号', minWidth: 120 },
  { field: 'dCredate', title: '创建时间', minWidth: 120 },
  {
    field: 'cSign',
    title: '是否启用',
    minWidth: 120,
    params: { optionlist: userSfqyOpts },
    formatter: ({ cellValue, column }) => filterSelect(cellValue, column.params.optionlist),
  },
  { field: 'cEmail', title: '邮箱', minWidth: 120 },
  { field: 'cDeptname', title: '所属部门', minWidth: 120 },
  {
    field: 'nMainAccount',
    title: '主账户',
    minWidth: 120,
    params: { optionlist: nYesNo },
    formatter: ({ cellValue, column }) => filterSelect(cellValue, column.params.optionlist),
  },
  {
    field: 'nOuterUser',
    title: '外部用户',
    minWidth: 120,
    params: { optionlist: nYesNo },
    formatter: ({ cellValue, column }) => filterSelect(cellValue, column.params.optionlist),
  },
  { field: 'dLastLogin', title: '最近登录时间', minWidth: 120 },
];

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: '88',
  nResourceid: 80,
  cModnumb: 'XTGL_YHGL_LIST'
};
