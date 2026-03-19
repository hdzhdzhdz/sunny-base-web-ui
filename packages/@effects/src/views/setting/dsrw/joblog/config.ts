import type { FormSchema } from '@sunny-base-web/ui';
import type { VxeGridProps } from 'vxe-pc-ui';
import type { JobLogVO } from './types';

/**
 * 调度结果选项（用于表格显示）
 */
const triggerCodeOptions = [
  { cKeyname: '成功', cKeynumb: '200' },
  { cKeyname: '失败', cKeynumb: '500' },
  { cKeyname: '空', cKeynumb: '0' }
];

/**
 * 执行结果选项（用于表格显示）
 */
const handleCodeOptions = [
  { cKeyname: '成功', cKeynumb: '200' },
  { cKeyname: '失败', cKeynumb: '500' },
  { cKeyname: '失败(超时)', cKeynumb: '502' }
];

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    fieldName: 'jobGroup',
    label: '执行器',
    component: 'Select',
    componentProps: {
      placeholder: '请选择执行状态',
      allowClear: true,
      options: []
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'jobDesc',
    label: '任务描述',
    component: 'Input',
    componentProps: {
      placeholder: '请输入任务描述',
      allowClear: true
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'triggerStatus',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '全部', value: '-1' },
        { label: '成功', value: '1' },
        { label: '失败', value: '2' },
        { label: '运行中', value: '3' }
      ]
    },
    colProps: { span: 4 }
  },
  {
    fieldName: 'timeList',
    label: '调度日期',
    component: 'RangePicker',
    componentProps: {
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
export const tableColumns: VxeGridProps<JobLogVO>['columns'] = [
  { field: 'jobld', title: '任务ID' },
  { field: 'jobDesc', title: '任务描述' },
  { field: 'triggerCode', title: '调度结果',
    formatter: ({ cellValue }) => {
      const option = triggerCodeOptions.find(opt => opt.cKeynumb === cellValue);
      return option?.cKeyname || cellValue;
    } },
  { field: 'triggerTime', title: '调度时间' },
  { field: 'executorAddress', title: '本次执行地址' },
  { field: 'executorHandler', title: '执行任务' },
  { field: 'executorParam', title: '执行参数' },
  { field: 'handleDdbz', title: '调度备注', slots: { default: 'handleDdbzSlot' } },
  { field: 'handleTime', title: '执行时间' },
  { field: 'handleCode', title: '执行结果',
    formatter: ({ cellValue }) => {
      const option = handleCodeOptions.find(opt => opt.cKeynumb === cellValue);
      return option?.cKeyname || cellValue;
    } },
  { field: 'handleMsg', title: '执行备注', slots: { default: 'handleMsgSlot' } },
  { field: 'handleZxrz', title: '执行日志', slots: { default: 'handleZxrzSlot' } }
];

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'joblog',
  nResourceid: 583,
  cModnumb: '9aad5aa1-14be-4c03-934d-e9e6722cdd4f'
};