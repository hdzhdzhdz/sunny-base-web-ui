import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import { filterSelect } from '@sunny-base-web/effects'

interface RoleConfig {
  t: (key: string) => string
  formApi?: any
}

export const getRoleConfig = ({ t, formApi }: RoleConfig) => {
  const statusOptions = [
    { cKeyname: t('role.enable'), cKeynumb: '1' },
    { cKeyname: t('role.disable'), cKeynumb: '0' }
  ];

  const nYesNo = [
    { cKeyname: t('common.no'), cKeynumb: '0' },
    { cKeyname: t('common.yes'), cKeynumb: '1' }
  ];

  const systemOpts = [
    { cKeyname: t('role.baseSystem'), cKeynumb: 'BASE' }
  ];

  const typeOpts = [
    { cKeyname: t('role.type1'), cKeynumb: '1' },
    { cKeyname: t('role.type2'), cKeynumb: '2' }
  ];

  // 查询表单
  const searchFormSchema: FormSchema[] = [
    {
      fieldName: 'cRolenumb',
      label: t('user.cRolenumb'),
      component: 'Input',
      componentProps: {
        placeholder: t('role.inputRoleNumb'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cRolename',
      label: t('user.cRolename'),
      component: 'Input',
      componentProps: {
        placeholder: t('role.inputRoleName'),
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cOrg',
      label: t('role.org'),
      component: 'Input',
      componentProps: {
        placeholder: t('role.inputOrg'),
        allowClear: true
      },
      colProps: { span: 4 }
    }
  ];

  // 查询表格列
  const tableColumns: VxeGridProps['columns'] = [
    { type: 'checkbox', width: 40 },
    { field: 'id', title: t('role.id') },
    { field: 'cRolenumb', title: t('user.cRolenumb') },
    { field: 'cRolename', title: t('user.cRolename') },
    { 
      field: 'CSystem', 
      title: t('role.system'),
      formatter: ({ cellValue }) => {
        const option = systemOpts.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } 
    },
    { field: 'corg', title: t('role.org') },
    { 
      field: 'сType', 
      title: t('role.type'),
      formatter: ({ cellValue }) => {
        const option = typeOpts.find(opt => opt.cKeynumb === cellValue);
        return option?.cKeyname || cellValue;
      } 
    },
    { 
      field: 'nSensitive', 
      title: t('user.nSensitive'),
      formatter: ({ cellValue }) => {
        const option = nYesNo.find(opt => opt.cKeynumb === String(cellValue));
        return option?.cKeyname || cellValue;
      } 
    },
    { field: 'cCrename', title: t('role.createUser') },
    { field: 'dCredate', title: t('role.createTime') }
  ];

  // 菜单资源配置
  const resourceConfig = {
    resourceId: 'role',
    nResourceid: 95,
    cModnumb: 'XTGL_JSGL_LIST'
  };

  // 新增修改弹窗表单
  const addEditFormSchema: FormSchema[] = [
    {
      fieldName: 'cRolenumb',
      label: t('user.cRolenumb'),
      component: 'Input',
      componentProps: {
        allowClear: true,
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'cRolename',
      label: t('user.cRolename'),
      component: 'Input',
      componentProps: {
        allowClear: true
      },
      rules: 'required',
      colProps: { span: 4 }
    },
    {
      fieldName: 'cSystem',
      label: t('role.system'),
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: systemOpts.map(opt => ({ label: opt.cKeyname, value: opt.cKeynumb }))
      },
      rules: 'required',
      colProps: { span: 4 }
    },
    {
      fieldName: 'corg',
      label: t('role.org'),
      component: 'Input',
      componentProps: {
        allowClear: true
      },
      colProps: { span: 4 }
    },
    {
      fieldName: 'сType',
      label: t('role.type'),
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: typeOpts.map(opt => ({ label: opt.cKeyname, value: opt.cKeynumb }))
      },
      colProps: { span: 4 }
    }
  ];

  // 授权弹窗表单
  const authFormSchema: FormSchema[] = [
    {
      fieldName: 'cRolenumb',
      label: t('user.cRolenumb'),
      component: 'Input',
      componentProps: {
        disabled: true
      },
      colProps: { span: 12 }
    },
    {
      fieldName: 'cRolename',
      label: t('user.cRolename'),
      component: 'Input',
      componentProps: {
        disabled: true
      },
      colProps: { span: 12 }
    },
  ];

  const authGridColumns: VxeGridProps['columns'] = [
    { type: 'checkbox', width: 40, align: 'center' },
    { field: 'cUsernumb', title: t('user.cUsernumb'), minWidth: 100 },
    { field: 'cUsername', title: t('user.cUsername'), minWidth: 200 },
    { field: 'cAdmin', title: t('user.cAdmin'), minWidth: 100,
      formatter: ({ cellValue }) => {
        const options = [
          { cKeyname: t('role.normalUser'), cKeynumb: '0' },
          { cKeyname: t('role.superUser'), cKeynumb: '1' }
        ]
        const option = options.find(opt => opt.cKeynumb === String(cellValue));
        return option?.cKeyname || cellValue;
      }
    },
  ];

  return {
    searchFormSchema,
    tableColumns,
    resourceConfig,
    addEditFormSchema,
    authFormSchema,
    authGridColumns
  };
}