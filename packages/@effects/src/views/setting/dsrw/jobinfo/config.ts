import type { FormSchema } from '@sunny-base-web/ui';
import type { VxeGridProps } from 'vxe-pc-ui';
import type { JobInfoVO } from './types';

interface JobInfoConfig {
  t: (key: string) => string
}

export const getJobInfoConfig = ({ t }: JobInfoConfig) => {
  /**
   * 是否启用选项（用于表格显示）
   */
  const scheduleTypeOptions = [
    { cKeyname: t('jobinfo.none'), cKeynumb: 'NONE' },
    { cKeyname: t('jobinfo.cron'), cKeynumb: 'CRON' },
    { cKeyname: t('jobinfo.fixedRate'), cKeynumb: 'FIX_RATE' }
  ];
  const glueTypeOptions = [
    { cKeyname: t('jobinfo.bean'), cKeynumb: 'BEAN' },
    { cKeyname: t('jobinfo.glueJava'), cKeynumb: 'GLUE_GROOVY' },
    { cKeyname: t('jobinfo.glueShell'), cKeynumb: 'GLUE_SHELL' },
    { cKeyname: t('jobinfo.gluePython'), cKeynumb: 'GLUE_PYTHON' },
    { cKeyname: t('jobinfo.gluePhp'), cKeynumb: 'GLUE_PHP' },
    { cKeyname: t('jobinfo.glueNodejs'), cKeynumb: 'GLUE_NODEJS' },
    { cKeyname: t('jobinfo.gluePowershell'), cKeynumb: 'GLUE_POWERSHELL' }
  ];
  const triggerStatusOptions = [
    { cKeyname: t('jobinfo.stop'), cKeynumb: '0' },
    { cKeyname: t('jobinfo.running'), cKeynumb: '1' }
  ];

  /**
   * 搜索表单配置
   */
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'jobDesc',
      label: t('jobinfo.jobDesc'),
      component: 'Input',
      componentProps: {
        placeholder: t('jobinfo.inputJobDesc'),
        allowClear: true
      },
      colProps: { span: 4 }
    }
  ];

  /**
   * 表格列配置
   */
  const tableColumns: VxeGridProps<JobInfoVO>['columns'] = [
    { field: 'id', title: t('jobinfo.jobId') },
    { field: 'jobDesc', title: t('jobinfo.jobDesc') },
    { field: 'jobGroupTitle', title: t('jobinfo.executor') },
    { field: 'scheduleType', title: t('jobinfo.scheduleType'),
      formatter: ({ cellValue }) => {
        const option = scheduleTypeOptions.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } },
    { field: 'glueType', title: t('jobinfo.glueType'),
      formatter: ({ cellValue }) => {
        const option = glueTypeOptions.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } },
    { field: 'author', title: t('jobinfo.author') },
    { field: 'triggerStatus', title: t('jobinfo.status') ,
      formatter: ({ cellValue }) => {
        const option = triggerStatusOptions.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      }},
    {
      field: 'action',
      title: t('jobinfo.action'),
      fixed: 'right',
      width: 400,
      slots: { default: 'actionSlot' }
    }
  ];

  return {
    searchFormSchema,
    tableColumns,
    scheduleTypeOptions,
    glueTypeOptions,
    triggerStatusOptions
  };
};

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'jobinfo',
  nResourceid: 582,
  cModnumb: '55cd2939-d806-4a77-a827-3cc55ed729b7'
};