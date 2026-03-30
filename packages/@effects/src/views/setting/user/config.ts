import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import { filterSelect } from '@sunny-base-web/effects'
import { EditRender } from '@sunny-base-web/ui'

interface UserConfig {
  t: (key: string) => string
  formApi?: any
}

export const getUserConfig = ({ t, formApi }: UserConfig) => {
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

  // 查询表单
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'cUsernumb',
      label: t('user.cUsernumb'),
      component: 'Input',
      componentProps: {
        allowClear: true
      },
    },
    {
      fieldName: 'cUsername',
      label: t('user.cUsername'),
      component: 'Input',
      componentProps: {
        allowClear: true
      },
    },
    {
      fieldName: 'cAdmin',
      label: t('user.cAdmin'),
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: userYhlxOpts
      },
    },
    {
      fieldName: 'dLastLoginList',
      label: t('user.dLastLoginList'),
      component: 'RangePicker',
      componentProps: {
        allowClear: true
      },
    },
  ];

  // 查询表格列
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

  // 菜单资源配置
  const resourceConfig = {
    resourceId: '88',
    nResourceid: 80,
    cModnumb: 'XTGL_YHGL_LIST'
  };

  // 新增修改弹窗表单
  const addEditFormSchema: FormSchema[] = [
    {
      fieldName: 'cUsernumb',
      label: t('user.cUsernumb'),
      component: 'Input',
      componentProps: {
        allowClear: true,
      },
      rules: 'required',
    },
    {
      fieldName: 'cUsername',
      label: t('user.cUsername'),
      component: 'Input',
      componentProps: {
        allowClear: true
      },
      rules: 'required',
    },
    {
      fieldName: 'cAdmin',
      label: t('user.cAdmin'),
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: userYhlxOpts
      },
      rules: 'required',
    },
    {
      fieldName: 'nMainAccount',
      label: t('user.nMainAccount'),
      component: 'RadioGroup',
      componentProps: {
        allowClear: true,
        options: nYesNo
      },
    },
    {
      fieldName: 'nOuterUser',
      label: t('user.nOuterUser'),
      component: 'RadioGroup',
      componentProps: {
        allowClear: true,
        options: nYesNo
      },
    },
    {
      fieldName: 'cWork',
      label: t('user.cWork'),
      component: 'SunnyBusinessSearch',
      componentProps: {
        allowClear: true,
        cNum: 'INNER_WORK_OPT',
        modalProps: {
          multiple: false,
          fieldNames: {
            value: 'WORKCODE',       // 选中值的唯一标识
            label: 'LASTNAME'  // 显示在 Tag 中的文本
          },
        },
        onChange: (values: any[]) => {
          if (values.length > 0) {
            formApi.setFieldValue('cDeptnum', values[0].DEPTCODE)
            formApi.setFieldValue('cDeptname', values[0].DEPTNAME)
          } else {
            formApi.setFieldValue('cDeptnum', '')
            formApi.setFieldValue('cDeptname', '')
          }
        }
      },
      dependencies: {
        show: (values) => values.nOuterUser === '0'
      }
    },
    {
      fieldName: 'cDeptnum',
      label: t('user.cDeptnum'),
      component: 'Input',
      componentProps: {
        allowClear: true,
        disabled: true
      },
      dependencies: {
        show: (values) => values.nOuterUser === '0'
      }
    },
    {
      fieldName: 'cDeptname',
      label: t('user.cDeptname'),
      component: 'Input',
      componentProps: {
        allowClear: true,
        disabled: true
      },
      dependencies: {
        show: (values) => values.nOuterUser === '0'
      }
    }
  ]

  // 授权弹窗表单
  const authFormSchema: FormSchema[] = [
    {
      fieldName: 'cUsernumb',
      label: t('user.cUsernumb'),
      component: 'Input',
      componentProps: {
        disabled: true
      },
      colProps: { span: 12 }
    },
    {
      fieldName: 'cUsername',
      label: t('user.cUsername'),
      component: 'Input',
      componentProps: {
        disabled: true
      },
      colProps: { span: 12 }
    },
  ]

  const authGridColumns: VxeGridProps['columns'] = [
    { type: 'checkbox', width: 40, align: 'center' },
    { field: 'cRolenumb', title: t('user.cRolenumb'), minWidth: 100 },
    { field: 'cRolename', title: t('user.cRolename'), minWidth: 200 },
    {
      field: 'nSensitive',
      title: t('user.nSensitive'),
      minWidth: 100,
      formatter: ({ cellValue, column }) => filterSelect(cellValue, column.params.optionlist),
      params: { optionlist: nYesNo },
    },
    { field: 'cSystem', title: t('user.cSystem'), minWidth: 100 },
  ]

  const bindMacGridColumns: VxeGridProps['columns'] = [
    { type: 'checkbox', width: 40, align: 'center' },
    { field: 'cMac', title: t('user.cMac'), ...EditRender.InputRender },
    { field: 'cMacdesc', title: t('user.cMacdesc'), ...EditRender.InputRender },
    { field: 'cCreateusername', title: t('user.cCreateusername') },
    { field: 'dDate', title: t('user.dDate') },
  ]

  return {
    searchFormSchema,
    tableColumns,
    resourceConfig,
    addEditFormSchema,
    authFormSchema,
    authGridColumns,
    bindMacGridColumns
  };
}
