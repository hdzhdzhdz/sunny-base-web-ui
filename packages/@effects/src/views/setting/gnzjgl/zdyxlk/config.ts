import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import { SunnyCustomizeSelect } from '@sunny-base-web/ui';
import { markRaw } from 'vue';
import type { AssSelectVO } from './types';

// 使用 markRaw 标记组件，避免 Vue 将组件转为响应式对象
const CustomizeSelect = markRaw(SunnyCustomizeSelect);

interface ZdyxlkConfig {
  t: (key: string) => string
  formApi?: any
}

export const getZdyxlkConfig = ({ t, formApi }: ZdyxlkConfig) => {
  /**
   * 实现类型选项
   */
  const nCbtypeOptions = [
    { cKeyname: t('zdyxlk.backendSQL'), cKeynumb: '0' },
    { cKeyname: t('zdyxlk.customImplementation'), cKeynumb: '1' }
  ];

  /**
   * 类型选项
   */
  const nTypeOptions = [
    { cKeyname: t('zdyxlk.dropdown'), cKeynumb: '0' },
    { cKeyname: t('zdyxlk.searchableDropdown'), cKeynumb: '1' }
  ];

  /**
   * 是否公共选项
   */
  const nSfcommonOptions = [
    { cKeyname: t('zdyxlk.private'), cKeynumb: '0' },
    { cKeyname: t('zdyxlk.public'), cKeynumb: '1' }
  ];

  /**
   * 搜索匹配选项
   */
  const nLikematchOptions = [
    { cKeyname: t('zdyxlk.exactMatch'), cKeynumb: '0' },
    { cKeyname: t('zdyxlk.fuzzyMatch'), cKeynumb: '1' }
  ];

  /**
   * 搜索表单配置
   */
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'CNum',
      label: t('zdyxlk.CNum'),
      component: 'Input',
      componentProps: {
        placeholder: t('zdyxlk.inputCNum'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'CTitle',
      label: t('zdyxlk.CTitle'),
      component: 'Input',
      componentProps: {
        placeholder: t('zdyxlk.inputCTitle'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cWork',
      label: t('zdyxlk.cWork'),
      component: CustomizeSelect,
      componentProps: {
        placeholder: t('zdyxlk.inputcWork'),
        allowClear: true,
        cNum: 'UserSearch1',
        fieldNames: {
          label: 'cKeyname',
          value: 'cKeyname'
        }
      },
      colProps: { span: 4 }
    }
  ];

  /**
   * 表格列配置
   */
  const tableColumns: VxeGridProps<AssSelectVO>['columns'] = [
    { type: 'checkbox', width: 40 },
    { field: 'cNum', title: t('zdyxlk.CNum') },
    { field: 'nCbtype', title: t('zdyxlk.nCbtype'),
      formatter: ({ cellValue }) => {
        const option = nCbtypeOptions.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } },
    { field: 'cCbclass', title: t('zdyxlk.cCbclass') },
    { field: 'cTitle', title: t('zdyxlk.CTitle') },
    { field: 'cValcol', title: t('zdyxlk.cValcol') },
    { field: 'cLabelcol', title: t('zdyxlk.cLabelcol') },
    { field: 'cLabelslotcol', title: t('zdyxlk.cLabelslotcol') },
    { field: 'nType', title: t('zdyxlk.nType'),
      formatter: ({ cellValue }) => {
        const option = nTypeOptions.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } },
    { field: 'nSearchinterval', title: t('zdyxlk.nSearchinterval') },
    { field: 'cStaffname', title: t('zdyxlk.CStaffname') },
    { field: 'nLimit', title: t('zdyxlk.nLimit') },
    { field: 'nSfcommon', title: t('zdyxlk.nSfcommon'),
      formatter: ({ cellValue }) => {
        const option = nSfcommonOptions.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } }
  ];

  /**
   * 新增修改弹窗表单配置
   */
  const addEditFormSchema: FormSchema[] = [
    {
      fieldName: 'nCbtype',
      label: t('zdyxlk.nCbtype'),
      component: 'Select',
      componentProps: {
        placeholder: t('zdyxlk.selectnCbtype'),
        options: nCbtypeOptions.map(opt => ({ label: opt.cKeyname, value: opt.cKeynumb })),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    },
    {
      fieldName: 'cCbclass',
      label: t('zdyxlk.cCbclass'),
      component: 'Input',
      componentProps: {
        placeholder: t('zdyxlk.inputcCbclass'),
        allowClear: true
      },
      colProps: { span: 8 }
    },
    {
      fieldName: 'cNum',
      label: t('zdyxlk.CNum'),
      component: 'Input',
      componentProps: {
        placeholder: t('zdyxlk.inputCNum'),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    },
    {
      fieldName: 'cTitle',
      label: t('zdyxlk.CTitle'),
      component: 'Input',
      componentProps: {
        placeholder: t('zdyxlk.inputCTitle'),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    },
    {
      fieldName: 'cValcol',
      label: t('zdyxlk.cValcol'),
      component: 'Input',
      componentProps: {
        placeholder: t('zdyxlk.inputcValcol'),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    },
    {
      fieldName: 'cLabelcol',
      label: t('zdyxlk.cLabelcol'),
      component: 'Input',
      componentProps: {
        placeholder: t('zdyxlk.inputcLabelcol'),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    },
    {
      fieldName: 'cLabelslotcol',
      label: t('zdyxlk.cLabelslotcol'),
      component: 'Input',
      componentProps: {
        placeholder: t('zdyxlk.inputcLabelslotcol'),
        allowClear: true
      },
      colProps: { span: 8 }
    },
    {
      fieldName: 'nType',
      label: t('zdyxlk.nType'),
      component: 'Select',
      componentProps: {
        placeholder: t('zdyxlk.selectnType'),
        options: nTypeOptions.map(opt => ({ label: opt.cKeyname, value: opt.cKeynumb })),
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 8 }
    },
    {
      fieldName: 'nLikematch',
      label: t('zdyxlk.nLikematch'),
      component: 'Select',
      componentProps: {
        placeholder: t('zdyxlk.selectnLikematch'),
        options: nLikematchOptions.map(opt => ({ label: opt.cKeyname, value: opt.cKeynumb })),
        allowClear: true
      },
      colProps: { span: 8 }
    },
    {
      fieldName: 'nSearchinterval',
      label: t('zdyxlk.nSearchinterval'),
      component: 'InputNumber',
      componentProps: {
        placeholder: '默认700毫秒',
        min: 0,
        max: 5000,
        allowClear: true
      },
      colProps: { span: 8 }
    },
    {
      fieldName: 'nLimit',
      label: t('zdyxlk.nLimit'),
      component: 'InputNumber',
      componentProps: {
        placeholder: '默认20',
        min: 1,
        max: 1000,
        allowClear: true
      },
      colProps: { span: 8 }
    },
    {
      fieldName: 'nSfcommon',
      label: t('zdyxlk.nSfcommon'),
      component: 'Select',
      componentProps: {
        placeholder: t('zdyxlk.selectnSfcommon'),
        options: nSfcommonOptions.map(opt => ({ label: opt.cKeyname, value: opt.cKeynumb })),
        allowClear: true
      },
      colProps: { span: 8 }
    },
    {
      fieldName: 'cPrefixUrl',
      label: t('zdyxlk.cPrefixUrl'),
      component: 'Input',
      componentProps: {
        placeholder: t('zdyxlk.inputcPrefixUrl'),
        allowClear: true
      },
      colProps: { span: 8 }
    }
  ];

  return {
    searchFormSchema,
    tableColumns,
    addEditFormSchema,
    nCbtypeOptions,
    nTypeOptions,
    nSfcommonOptions,
    nLikematchOptions
  };
};

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'zdyxlk',
  nResourceid: 11908,
  cModnumb: 'ZDYXLK'
};