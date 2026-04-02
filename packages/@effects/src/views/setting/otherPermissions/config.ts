import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import type { OtherPermissionsVO } from './types';

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    fieldName: 'cExresnum',
    label: '权限编号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入权限编号',
      allowClear: true
    },
    colProps: { span: 6 }
  },
  {
    fieldName: 'cExresname',
    label: '权限名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入权限名称',
      allowClear: true
    },
    colProps: { span: 6 }
  }
];

/**
 * 新增表单配置
 */
export const addFormSchema: FormSchema[] = [
  {
    fieldName: 'cExresnum',
    label: '权限编号',
    component: 'Input',
    rules: 'required',
    componentProps: {
      placeholder: '请输入权限编号',
      allowClear: true
    }
  },
  {
    fieldName: 'cExresname',
    label: '权限名称',
    component: 'Input',
    rules: 'required',
    componentProps: {
      placeholder: '请输入权限名称',
      allowClear: true
    }
  },
  {
    fieldName: 'cOrg',
    label: '所属组织',
    component: 'Input',
    componentProps: {
      placeholder: '请输入所属组织',
      allowClear: true
    }
  },
  {
    fieldName: 'nOrder',
    label: '排序',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入排序',
      min: 1,
      precision: 0
    }
  }
];

/**
 * 表格列配置
 */
export const tableColumns: VxeGridProps<OtherPermissionsVO>['columns'] = [
  { type: 'checkbox', width: 50 },
  { field: 'cExresnum', title: '权限编号', minWidth: 140, treeNode: true  },
  { field: 'cExresname', title: '权限名称', minWidth: 180 },
  { field: 'cOrg', title: '所属组织', minWidth: 150 },
  { field: 'dCredate', title: '创建日期', width: 180 },
  { field: 'cCreateName', title: '创建人', width: 120 },
  { field: 'nOrder', title: '排序', width: 80 }
];

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'otherPermissions',
  nResourceid: 67,
  cModnumb: 'db7a8e32-f20b-444b-af0f-aed54ec99532'
};