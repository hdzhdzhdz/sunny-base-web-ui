import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import type { OperationLogVO } from './types';

interface OperationLogConfig {
  t: (key: string) => string
}

export const getOperationLogConfig = ({ t }: OperationLogConfig) => {
  /**
   * 搜索表单配置
   */
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'cModname',
      label: t('operationLog.moduleName'),
      component: 'Input',
      componentProps: {
        placeholder: t('operationLog.inputModuleName'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cSystem',
      label: t('operationLog.system'),
      component: 'Input',
      componentProps: {
        placeholder: t('operationLog.inputSystem'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cDanju',
      label: t('operationLog.billNo'),
      component: 'Input',
      componentProps: {
        placeholder: t('operationLog.inputBillNo'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cUser',
      label: t('operationLog.userWork'),
      component: 'Input',
      componentProps: {
        placeholder: t('operationLog.inputUserWork'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'dCreatelist',
      label: t('operationLog.operationDate'),
      component: 'RangePicker',
      componentProps: {
        placeholder: [t('operationLog.startDate'), t('operationLog.endDate')],
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
  const tableColumns: VxeGridProps<OperationLogVO>['columns'] = [
    { type: 'seq', width: 60, title: t('operationLog.sequence') },
    { field: 'cModname', title: t('operationLog.moduleName'), minWidth: 120, filters: [{ data: '' }], filterRender: { name: 'MyFilterComplex' } },
    { field: 'cSystem', title: t('operationLog.system'), minWidth: 120, filters: [{ data: '' }], filterRender: { name: 'MyFilterComplex' } },
    { field: 'cDanju', title: t('operationLog.billNo'), minWidth: 140 },
    { field: 'cUser', title: t('operationLog.userWork'), width: 100, filters: [{ data: '' }], filterRender: { name: 'MyFilterComplex' } },
    { field: 'cUsername', title: t('operationLog.userName'), minWidth: 120 },
    { field: 'cDongzuo', title: t('operationLog.description'), minWidth: 200, align: 'left' },
    { field: 'cUrl', title: t('operationLog.interfaceUrl'), minWidth: 200 },
    { field: 'cMethod', title: t('operationLog.interfaceMethod'), minWidth: 150 },
    { field: 'nSecond', title: t('operationLog.executionTime'), width: 120 },
    { field: 'dCreate', title: t('operationLog.operationTime'), width: 180 }
  ];

  return {
    searchFormSchema,
    tableColumns
  };
};

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'operationLog',
  nResourceid: 103,
  cModnumb: 'aaa722d3-fe09-4992-a96a-39bfc466bcb3'
};
