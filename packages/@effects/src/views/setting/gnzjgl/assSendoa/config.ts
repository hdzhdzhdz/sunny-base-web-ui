import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import type { AssSendoaVO } from './types';

interface AssSendoaConfig {
  t: (key: string) => string
  formApi?: any
}

export const getAssSendoaConfig = ({ t }: AssSendoaConfig) => {
  /**
   * 启用标志选项
   */
  const userSfqyOpts = [
    { cKeyname: '启用', cKeynumb: '0' },
    { cKeyname: '禁用', cKeynumb: '1' }
  ];

  /**
   * 搜索表单配置
   */
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'cModnumb',
      label: t('assSendoa.cModnumb'),
      component: 'Input',
      componentProps: {
        placeholder: t('assSendoa.inputcModnumb'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cGongsi',
      label: t('assSendoa.cGongsi'),
      component: 'Input',
      componentProps: {
        placeholder: t('assSendoa.inputcGongsi'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'nSign',
      label: t('assSendoa.nSign'),
      component: 'Select',
      componentProps: {
        placeholder: t('assSendoa.selectnSign'),
        allowClear: true,
        options: userSfqyOpts.map(opt => ({ label: opt.cKeyname, value: opt.cKeynumb }))
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cUrl',
      label: t('assSendoa.cUrl'),
      component: 'Input',
      componentProps: {
        placeholder: t('assSendoa.inputcUrl'),
        allowClear: true
      },
      colProps: { span: 4 }
    }
  ];

  /**
   * 表格列配置
   */
  const tableColumns: VxeGridProps<AssSendoaVO>['columns'] = [
    { type: 'checkbox', width: 40 },
    { field: 'cModnumb', title: t('assSendoa.cModnumb') },
    { field: 'cGongsi', title: t('assSendoa.cGongsi') },
    { field: 'cLcmc', title: t('assSendoa.cLcmc') },
    { field: 'cOalcid', title: t('assSendoa.cOalcid') },
    { field: 'cUrl', title: t('assSendoa.cUrl') },
    { field: 'nSign', title: t('assSendoa.nSign'),
      formatter: ({ cellValue }) => {
        const option = userSfqyOpts.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } },
    { field: 'cCreateuserName', title: t('assSendoa.CreateuserName') },
    { field: 'dCreatetime', title: t('assSendoa.dCreatetime') },
    { field: 'cBeizhu', title: t('assSendoa.cBeizhu') }
  ];

  /**
   * 新增修改弹窗表单配置
   */
  const addEditFormSchema: FormSchema[] = [
    {
      fieldName: 'cModnumb',
      label: t('assSendoa.cModnumb'),
      component: 'Input',
      componentProps: {
        placeholder: t('assSendoa.inputcModnumb'),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    },
    {
      fieldName: 'cGongsi',
      label: t('assSendoa.cGongsi'),
      component: 'Input',
      componentProps: {
        placeholder: t('assSendoa.inputcGongsi'),
        allowClear: true
      },
      colProps: { span: 8 }
    },
    {
      fieldName: 'nSign',
      label: t('assSendoa.nSign'),
      component: 'Select',
      componentProps: {
        placeholder: t('assSendoa.selectnSign'),
        options: userSfqyOpts.map(opt => ({ label: opt.cKeyname, value: opt.cKeynumb })),
        allowClear: true
      },
      colProps: { span: 8 }
    },
    {
      fieldName: 'cLcmc',
      label: t('assSendoa.cLcmc'),
      component: 'Input',
      componentProps: {
        placeholder: t('assSendoa.inputcLcmc'),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    },
    {
      fieldName: 'cUrl',
      label: t('assSendoa.cUrl'),
      component: 'Input',
      componentProps: {
        placeholder: t('assSendoa.inputcUrl'),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    },
    {
      fieldName: 'cOalcid',
      label: t('assSendoa.cOalcid'),
      component: 'Input',
      componentProps: {
        placeholder: t('assSendoa.cOalcid'),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    }
  ];

  return {
    searchFormSchema,
    tableColumns,
    addEditFormSchema,
    userSfqyOpts
  };
};

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'assSendoa',
  nResourceid: 326,
  cModnumb: '066e0071-1bb5-494a-9d5e-506eb65b8c81'
};