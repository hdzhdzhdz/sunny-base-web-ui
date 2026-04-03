import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import type { OtherPermissionsVO } from './types';

interface OtherPermissionsConfig {
  t: (key: string) => string;
}

/**
 * 搜索表单配置
 */
export function getOtherPermissionsConfig({ t }: OtherPermissionsConfig) {
  /**
   * 搜索表单配置
   */
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'cExresnum',
      label: t('otherPermissions.cExresnum'),
      component: 'Input',
      componentProps: {
        placeholder: t('otherPermissions.inputcExresnum'),
        allowClear: true
      },
      colProps: { span: 6 }
    },
    {
      fieldName: 'cExresname',
      label: t('otherPermissions.cExresname'),
      component: 'Input',
      componentProps: {
        placeholder: t('otherPermissions.inputcExresname'),
        allowClear: true
      },
      colProps: { span: 6 }
    }
  ];

  /**
   * 新增表单配置
   */
  const addFormSchema: FormSchema[] = [
    {
      fieldName: 'cExresnum',
      label: t('otherPermissions.cExresnum'),
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: t('otherPermissions.inputcExresnum'),
        allowClear: true
      }
    },
    {
      fieldName: 'cExresname',
      label: t('otherPermissions.cExresname'),
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: t('otherPermissions.inputcExresname'),
        allowClear: true
      }
    },
    {
      fieldName: 'cOrg',
      label: t('otherPermissions.cOrg'),
      component: 'Select',
      componentProps: {
        placeholder: t('otherPermissions.inputcOrg'),
        allowClear: true
      },
      permissionOptions: {
        code: 'COMPANY',  // 权限选项
        fieldMapping: { label: 'cExresname', value: 'cExresnum' }
      }
    },
    {
      fieldName: 'nOrder',
      label: t('otherPermissions.nOrder'),
      component: 'InputNumber',
      componentProps: {
        placeholder: t('otherPermissions.inputnOrder'),
        min: 1,
        precision: 0
      }
    }
  ];

  /**
   * 表格列配置
   */
  const tableColumns: VxeGridProps<OtherPermissionsVO>['columns'] = [
    { type: 'checkbox', width: 50 },
    { field: 'cExresnum', title: t('otherPermissions.cExresnum'), minWidth: 140, treeNode: true  },
    { field: 'cExresname', title: t('otherPermissions.cExresname'), minWidth: 180 },
    { field: 'cOrg', title: t('otherPermissions.cOrg'), minWidth: 150 },
    { field: 'dCredate', title: t('otherPermissions.dCredate'), width: 180 },
    { field: 'cCreateName', title: t('otherPermissions.cCreateName'), width: 120 },
    { field: 'nOrder', title: t('otherPermissions.nOrder'), width: 80 }
  ];

  return {
    searchFormSchema,
    addFormSchema,
    tableColumns
  };
}

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'otherPermissions',
  nResourceid: 67,
  cModnumb: 'db7a8e32-f20b-444b-af0f-aed54ec99532'
};