import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import type { JobLogVO } from './types';

interface JobLogConfig {
  t: (key: string) => string
}

export const getJobLogConfig = ({ t }: JobLogConfig) => {
  /**
   * 调度结果选项（用于表格显示）
   */
  const triggerCodeOptions = [
    { cKeyname: t('joblog.success'), cKeynumb: '200' },
    { cKeyname: t('joblog.failure'), cKeynumb: '500' },
    { cKeyname: t('joblog.empty'), cKeynumb: '0' }
  ];

  /**
   * 执行结果选项（用于表格显示）
   */
  const handleCodeOptions = [
    { cKeyname: t('joblog.success'), cKeynumb: '200' },
    { cKeyname: t('joblog.failure'), cKeynumb: '500' },
    { cKeyname: t('joblog.failureTimeout'), cKeynumb: '502' }
  ];

  /**
   * 搜索表单配置
   */
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'jobGroup',
      label: t('joblog.executor'),
      component: 'Select',
      componentProps: {
        placeholder: t('joblog.selectExecutor'),
        allowClear: true,
        options: []
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'jobDesc',
      label: t('joblog.jobDesc'),
      component: 'Input',
      componentProps: {
        placeholder: t('joblog.inputJobDesc'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'triggerStatus',
      label: t('joblog.status'),
      component: 'Select',
      componentProps: {
        placeholder: t('joblog.selectStatus'),
        allowClear: true,
        options: [
          { label: t('joblog.all'), value: '-1' },
          { label: t('joblog.success'), value: '1' },
          { label: t('joblog.failure'), value: '2' },
          { label: t('joblog.running'), value: '3' }
        ]
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'timeList',
      label: t('joblog.scheduleDate'),
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
  const tableColumns: VxeGridProps<JobLogVO>['columns'] = [
    { field: 'jobld', title: t('joblog.jobId') },
    { field: 'jobDesc', title: t('joblog.jobDesc') },
    { field: 'triggerCode', title: t('joblog.scheduleResult'),
      formatter: ({ cellValue }) => {
        const option = triggerCodeOptions.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } },
    { field: 'triggerTime', title: t('joblog.scheduleTime') },
    { field: 'executorAddress', title: t('joblog.executorAddress') },
    { field: 'executorHandler', title: t('joblog.executorHandler') },
    { field: 'executorParam', title: t('joblog.executorParam') },
    { field: 'handleDdbz', title: t('joblog.scheduleRemark'), slots: { default: 'handleDdbzSlot' } },
    { field: 'handleTime', title: t('joblog.handleTime') },
    { field: 'handleCode', title: t('joblog.handleResult'),
      formatter: ({ cellValue }) => {
        const option = handleCodeOptions.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } },
    { field: 'handleMsg', title: t('joblog.handleMsg'), slots: { default: 'handleMsgSlot' } },
    { field: 'handleZxrz', title: t('joblog.handleLog'), slots: { default: 'handleZxrzSlot' } }
  ];

  return {
    searchFormSchema,
    tableColumns,
    triggerCodeOptions,
    handleCodeOptions
  };
};

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'joblog',
  nResourceid: 583,
  cModnumb: '9aad5aa1-14be-4c03-934d-e9e6722cdd4f'
};