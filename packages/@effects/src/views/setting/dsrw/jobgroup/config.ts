import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import type { JobGroupVO } from './types';

interface JobGroupConfig {
  t: (key: string) => string
}

export const getJobGroupConfig = ({ t }: JobGroupConfig) => {
  /**
   * 状态选项（用于表格显示）
   */
  const statusOptions = [
    { cKeyname: t('jobgroup.online'), cKeynumb: '1' },
    { cKeyname: t('jobgroup.offline'), cKeynumb: '0' }
  ];

  /**
   * 注册方式选项（用于表格显示）
   */
  const zcfsOpts = [
    { cKeyname: t('jobgroup.autoRegister'), cKeynumb: '0' },
    { cKeyname: t('jobgroup.manualEntry'), cKeynumb: '1' }
  ];

  /**
   * 搜索表单配置
   */
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'appname',
      label: t('jobgroup.appname'),
      component: 'Input',
      componentProps: {
        placeholder: t('jobgroup.inputAppname'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'title',
      label: t('jobgroup.title'),
      component: 'Input',
      componentProps: {
        placeholder: t('jobgroup.inputTitle'),
        allowClear: true
      },
      colProps: { span: 4 }
    }
  ];

  /**
   * 表格列配置
   */
  const tableColumns: VxeGridProps<JobGroupVO>['columns'] = [
    { field: 'appname', title: t('jobgroup.appname') },
    { field: 'title', title: t('jobgroup.title') },
    { field: 'addressType', title: t('jobgroup.registerType'),
      formatter: ({ cellValue }) => {
        const option = zcfsOpts.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } },
    { field: 'addressList', title: t('jobgroup.onlineAddressList') },
    {
      field: 'action',
      title: t('jobgroup.action'),
      fixed: 'right',
      width: 400,
      slots: { default: 'actionSlot' }
    }
  ];

  return {
    searchFormSchema,
    tableColumns,
    statusOptions,
    zcfsOpts
  };
};

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'jobgroup',
  nResourceid: 584,
  cModnumb: 'bfd3d15f-f261-4e02-9f37-be3dfd7edd00'
};