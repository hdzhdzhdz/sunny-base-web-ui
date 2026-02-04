import { h } from 'vue';
import type { VxeGridProps } from 'vxe-table';
import type { FormSchema } from '@kunkka/ui';
import type { OperationLogVO } from './types';

export const searchFormSchema: FormSchema[] = [
  {
    fieldName: 'username',
    label: '用户名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户名',
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'operationType',
    label: '操作类型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择操作类型',
      allowClear: true,
      options: [
        { label: '新增', value: 'Create' },
        { label: '修改', value: 'Update' },
        { label: '删除', value: 'Delete' },
        { label: '登录', value: 'Login' },
        { label: '导出', value: 'Export' },
      ]
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failure' },
      ]
    },
    colProps: { span: 4 }
  },
    {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failure' },
      ]
    },
    colProps: { span: 4 }
  },
    {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failure' },
      ]
    },
    colProps: { span: 4 }
  },
    {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failure' },
      ]
    },
    colProps: { span: 4 }
  },
    {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failure' },
      ]
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failure' },
      ]
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failure' },
      ]
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'timeRange',
    label: '操作时间',
    component: 'RangePicker',
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      allowClear: true,
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss'
    },
    colProps: { span: 4 }
  }
];

export const tableColumns: VxeGridProps<OperationLogVO>['columns'] = [
  { type: 'seq', width: 60, title: '序号' },
  { field: 'username', title: '用户名', minWidth: 120 },
  { field: 'module', title: '模块', minWidth: 150 },
  { field: 'operationType', title: '操作类型', width: 120 },
  { field: 'description', title: '描述', minWidth: 200, align: 'left' },
  { field: 'ip', title: 'IP地址', width: 140 },
  { 
    field: 'status', 
    title: '状态', 
    width: 100,
    slots: {
      default: ({ row }) => {
        return h(
          'span', 
          { 
            class: row.status === 'success' ? 'text-green-600' : 'text-red-600' 
          }, 
          row.status === 'success' ? '成功' : '失败'
        )
      }
    } 
  },
  { field: 'createTime', title: '操作时间', width: 180 },
  { field: 'duration', title: '耗时(ms)', width: 100 },
];
