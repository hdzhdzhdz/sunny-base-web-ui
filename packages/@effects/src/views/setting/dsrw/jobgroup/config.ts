import type { FormSchema } from '@sunny-base-web/ui';
import type { VxeGridProps } from 'vxe-pc-ui';
import type { JobGroupVO } from './types';

/**
 * 状态选项（用于表格显示）
 */
const statusOptions = [
  { cKeyname: '在线', cKeynumb: '1' },
  { cKeyname: '离线', cKeynumb: '0' }
];

/**
 * 注册方式选项（用于表格显示）
 */
const zcfsOpts = [
  { cKeyname: '自动注册', cKeynumb: '0' },
  { cKeyname: '手动录入', cKeynumb: '1' }
];

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    fieldName: 'appname',
    label: 'Appname',
    component: 'Input',
    componentProps: {
      placeholder: '请输入Appname',
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'title',
    label: '名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入名称',
      allowClear: true
    },
    colProps: { span: 4 }
  }
];

/**
 * 表格列配置
 */
export const tableColumns: VxeGridProps<JobGroupVO>['columns'] = [
  { field: 'appname', title: 'Appname' },
  { field: 'title', title: '名称' },
  { field: 'addressType', title: '注册方式',
    formatter: ({ cellValue }) => {
      const option = zcfsOpts.find(opt => opt.cKeynumb === cellValue);
      return option?.cKeyname || cellValue;
    } },
  { field: 'addressList', title: 'OnLine地址列表' },
  {
    field: 'action',
    title: '操作',
    fixed: 'right',
    width: 400,
    slots: { default: 'actionSlot' }
  }
];

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'jobgroup',
  nResourceid: 584,
  cModnumb: 'bfd3d15f-f261-4e02-9f37-be3dfd7edd00'
};