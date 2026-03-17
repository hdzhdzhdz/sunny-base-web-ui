import type { VxeGridProps } from 'vxe-table';
import type { FormSchema } from '@sunny-base-web/ui';
import { filterSelect } from '@sunny-base-web/effects'

export const getUserConfig = ({ t }: { t: (key: string) => string }) => {
  const userYhlxOpts = [
    { label: "普通用户", value: "0" },
    { label: "超级用户", value: "1" }
  ]

  const userSfqyOpts = [
    { label: "启用", value: "0" },
    { label: "禁用", value: "1" }
  ]

  const nYesNo = [
    { label: "是", value: "1" },
    { label: "否", value: "0" }
  ]

  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'cUsernumb',
      label: t('user.cUsernumb'),
      component: 'Input',
      componentProps: {
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cUsername',
      label: t('user.cUsername'),
      component: 'Input',
      componentProps: {
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cAdmin',
      label: t('user.cAdmin'),
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: userYhlxOpts
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'dLastLoginList',
      label: t('user.dLastLoginList'),
      component: 'RangePicker',
      componentProps: {
        allowClear: true
      },
      colProps: { span: 6 }
    },
  ];

  const tableColumns: VxeGridProps['columns'] = [
    { type: 'checkbox', width: 40 },
    { field: 'id', title: 'ID', minWidth: 80 },
    { field: 'cUsernumb', title: t('user.cUsernumb'), minWidth: 120 },
    { field: 'cUsername', title: t('user.cUsername'), minWidth: 120 },
    {
      field: 'cAdmin',
      title: t('user.cAdmin'),
      minWidth: 120,
      params: { optionlist: userYhlxOpts },
      formatter: ({ cellValue, column }) => filterSelect(cellValue, column.params.optionlist),
    },
    { field: 'cWork', title: t('user.cWork'), minWidth: 120 },
    { field: 'dCredate', title: t('user.dCredate'), minWidth: 120 },
    {
      field: 'cSign',
      title: t('user.cSign'),
      minWidth: 120,
      params: { optionlist: userSfqyOpts },
      formatter: ({ cellValue, column }) => filterSelect(cellValue, column.params.optionlist),
    },
    { field: 'cEmail', title: t('user.cEmail'), minWidth: 120 },
    { field: 'cDeptname', title: t('user.cDeptname'), minWidth: 120 },
    {
      field: 'nMainAccount',
      title: t('user.nMainAccount'),
      minWidth: 120,
      params: { optionlist: nYesNo },
      formatter: ({ cellValue, column }) => filterSelect(cellValue, column.params.optionlist),
    },
    {
      field: 'nOuterUser',
      title: t('user.nOuterUser'),
      minWidth: 120,
      params: { optionlist: nYesNo },
      formatter: ({ cellValue, column }) => filterSelect(cellValue, column.params.optionlist),
    },
    { field: 'dLastLogin', title: t('user.dLastLogin'), minWidth: 120 },
  ];

  const resourceConfig = {
    resourceId: '88',
    nResourceid: 80,
    cModnumb: 'XTGL_YHGL_LIST'
  };

  return {
    searchFormSchema,
    tableColumns,
    resourceConfig
  };
}
