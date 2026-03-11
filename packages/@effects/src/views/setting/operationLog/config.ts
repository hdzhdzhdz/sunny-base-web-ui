import type { VxeGridProps } from 'vxe-table';
import type { FormSchema } from '@sunny-base-web/ui';
import type { OperationLogVO } from './types';

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    fieldName: 'cModname',
    label: '模块名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入模块名称',
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'cSystem',
    label: '所属系统',
    component: 'Input',
    componentProps: {
      placeholder: '请输入所属系统',
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'cDanju',
    label: '单据号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入单据号',
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'cUser',
    label: '用户工号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户工号',
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'dCreatelist',
    label: '操作日期',
    component: 'RangePicker',
    componentProps: {
      placeholder: ['开始日期', '结束日期'],
      allowClear: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    },
    colProps: { span: 4 }
  }
];

/**
 * 表格列配置
 */
export const tableColumns: VxeGridProps<OperationLogVO>['columns'] = [
  { type: 'seq', width: 60, title: '序号' },
  { field: 'cModname', title: '模块名称', minWidth: 120, filters: [{ data: '' }], filterRender: { name: 'MyFilterComplex' } },
  { field: 'cSystem', title: '所属系统', minWidth: 120, filters: [{ data: '' }], filterRender: { name: 'MyFilterComplex' } },
  { field: 'cDanju', title: '单据号', minWidth: 140 },
  { field: 'cUser', title: '用户工号', width: 100, filters: [{ data: '' }], filterRender: { name: 'MyFilterComplex' } },
  { field: 'cUsername', title: '用户名称', minWidth: 120 },
  { field: 'cDongzuo', title: '描述', minWidth: 200, align: 'left' },
  { field: 'cUrl', title: '接口地址', minWidth: 200 },
  { field: 'cMethod', title: '接口服务方法', minWidth: 150 },
  { field: 'nSecond', title: '执行时间(秒)', width: 120 },
  { field: 'dCreate', title: '操作时间', width: 180 }
];

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'operationLog',
  nResourceid: 103,
  cModnumb: 'aaa722d3-fe09-4992-a96a-39bfc466bcb3'
};
