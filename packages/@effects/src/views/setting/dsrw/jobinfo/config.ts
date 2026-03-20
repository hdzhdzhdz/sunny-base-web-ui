import type { FormSchema } from '@sunny-base-web/ui';
import type { VxeGridProps } from 'vxe-pc-ui';
import type { JobInfoVO } from './types';

/**
 * 是否启用选项（用于表格显示）
 */
const scheduleTypeOptions = [
  { cKeyname: '无', cKeynumb: 'NONE' },
  { cKeyname: 'CRON', cKeynumb: 'CRON' },
  { cKeyname: '固定速度', cKeynumb: 'FIX_RATE' }
];
const glueTypeOptions = [
  { cKeyname: 'BEAN', cKeynumb: 'BEAN' },
  { cKeyname: 'GLUE(Java)', cKeynumb: 'GLUE_GROOVY' },
  { cKeyname: 'GLUE(Shell)', cKeynumb: 'GLUE_SHELL' },
  { cKeyname: 'GLUE(Python)', cKeynumb: 'GLUE_PYTHON' },
  { cKeyname: 'GLUE(PHP)', cKeynumb: 'GLUE_PHP' },
  { cKeyname: 'GLUE(Nodejs)', cKeynumb: 'GLUE_NODEJS' },
  { cKeyname: 'GLUE(PowerShell)', cKeynumb: 'GLUE_POWERSHELL' }
];
const triggerStatusOptions = [
  { cKeyname: '停止', cKeynumb: '0' },
  { cKeyname: '运行', cKeynumb: '1' }
];

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    fieldName: 'jobDesc',
    label: '任务描述',
    component: 'Input',
    componentProps: {
      placeholder: '请输入任务描述',
      allowClear: true
    },
    colProps: { span: 4 }
  }
];

/**
 * 表格列配置
 */
export const tableColumns: VxeGridProps<JobInfoVO>['columns'] = [
  { field: 'id', title: '任务id' },
  { field: 'jobDesc', title: '任务描述' },
  { field: 'jobGroupTitle', title: '执行器' },
  { field: 'scheduleType', title: '调度类型',
    formatter: ({ cellValue }) => {
      const option = scheduleTypeOptions.find(opt => opt.cKeynumb === cellValue);
      return option?.cKeyname || cellValue;
    } },
  { field: 'glueType', title: '运行模式',
    formatter: ({ cellValue }) => {
      const option = glueTypeOptions.find(opt => opt.cKeynumb === cellValue);
      return option?.cKeyname || cellValue;
    } },
  { field: 'author', title: '负责人' },
  { field: 'triggerStatus', title: '状态' ,
    formatter: ({ cellValue }) => {
      const option = triggerStatusOptions.find(opt => opt.cKeynumb === cellValue);
      return option?.cKeyname || cellValue;
    }},
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
  resourceId: 'jobinfo',
  nResourceid: 582,
  cModnumb: '55cd2939-d806-4a77-a827-3cc55ed729b7'
};