import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import type { GgcxtcVO } from './types';
import { sfggOpts, cbTypeOpts } from '@sunny-base-web/effects';

interface GgcxtcConfig {
  t: (key: string) => string
  formApi?: any
}

export const getGgcxtcConfig = ({ t }: GgcxtcConfig) => {
  /**
   * 搜索表单配置
   */
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'cNum',
      label: t('ggcxtc.cNum'),
      component: 'Input',
      componentProps: {
        placeholder: t('ggcxtc.inputcNum'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cTitle',
      label: t('ggcxtc.cTitle'),
      component: 'Input',
      componentProps: {
        placeholder: t('ggcxtc.inputcTitle'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'nSfcommon',
      label: t('ggcxtc.nSfcommon'),
      component: 'Select',
      componentProps: {
        placeholder: t('ggcxtc.selectnSfcommon'),
        allowClear: true,
        options: sfggOpts
      },
      colProps: { span: 4 }
    }
  ];

  /**
   * 表格列配置
   */
  const tableColumns: VxeGridProps<GgcxtcVO>['columns'] = [
    { type: 'checkbox', width: 40 },
    { field: 'cNum', title: t('ggcxtc.cNum') },
    { field: 'cTitle', title: t('ggcxtc.cTitle') },
    { field: 'nCbtype', title: t('ggcxtc.nCbtype'),
      formatter: ({ cellValue }) => {
        const option = cbTypeOpts.find(opt => opt.value === cellValue);
        return option?.label || cellValue;
      } },
    { field: 'cCbclass', title: t('ggcxtc.cCbclass') },
    { field: 'cCondition', title: t('ggcxtc.cCondition') },
    { field: 'cWidth', title: t('ggcxtc.cWidth') },
    { field: 'cHeight', title: t('ggcxtc.cHeight') },
    { field: 'nRows', title: t('ggcxtc.nRows') },
    { field: 'cSql', title: t('ggcxtc.cSql') },
    { field: 'cTablecols', title: t('ggcxtc.cTablecols') },
    { field: 'cCrenumb', title: t('ggcxtc.cCrenumb') },
    { field: 'cCrename', title: t('ggcxtc.cCrename') },
    { field: 'dDate', title: t('ggcxtc.dDate') },
    { field: 'cOrder', title: t('ggcxtc.cOrder') },
    { field: 'nSfcommon', title: t('ggcxtc.nSfcommon'),
      formatter: ({ cellValue }) => {
        const option = sfggOpts.find(opt => opt.value === cellValue);
        return option?.label || cellValue;
      } }
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
  resourceId: 'Ggcxtc',
  nResourceid: 11955,
  cModnumb: 'GGCXTC'
};