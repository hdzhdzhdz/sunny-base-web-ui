import type { FormSchema, VxeGridProps } from '@sunny-base-web/ui';
import { EditRender } from '@sunny-base-web/ui';
import type { YwsjzdVO, YwsjzdFormVO, MetaItem } from './types';

/**
 * 是否启用选项（用于表格显示）
 */
const signOptions = [
  { label: "启用", value: "10001" },
  { label: "禁用", value: "10002" }
];

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    fieldName: 'cXuhao',
    label: '字典编号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典编号',
      allowClear: true
    },
    colProps: { span: 6 }
  },
  {
    fieldName: 'cName',
    label: '字典名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典名称',
      allowClear: true
    },
    colProps: { span: 6 }
  },
  {
    fieldName: 'cSign',
    label: '是否启用',
    component: 'Select',
    // ✅ 方案2：声明式配置
    selectOptions: {
      dictCode: 'SFQY',  // 是否启用字典编码
      fieldMapping: {
        label: 'cName',
        value: 'cXuhao'
      }
    },
    componentProps: {
      placeholder: '请选择是否启用',
      allowClear: true,
    },
    colProps: { span: 6 }
  }
];

/**
 * 新增表单配置
 */
export const addFormSchema: FormSchema[] = [
  {
    fieldName: 'parentName',
    label: '父级字典',
    component: 'Input',
    componentProps: {
      disabled: true,
      placeholder: '无'
    }
  },
  {
    fieldName: 'cXuhao',
    label: '字典编号',
    component: 'Input',
    rules: 'required',
    componentProps: {
      placeholder: '请输入字典编号',
      allowClear: true
    }
  },
  {
    fieldName: 'cName',
    label: '字典名称',
    component: 'Input',
    rules: 'required',
    componentProps: {
      placeholder: '请输入字典名称',
      allowClear: true
    }
  },
  {
    fieldName: 'cSign',
    label: '是否启用',
    component: 'Select',
    rules: 'required',
    // ✅ 方案2：声明式配置
    selectOptions: {
      dictCode: 'SFQY'  // 是否启用字典编码
    },
    componentProps: {
      placeholder: '请选择是否启用'
    }
  },
  {
    fieldName: 'nOrder',
    label: '排序',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入排序',
      min: 0,
      precision: 0
    }
  }
];

/**
 * 表格列配置
 */
export const tableColumns: VxeGridProps<YwsjzdVO>['columns'] = [
  { type: 'checkbox', width: 50 },
  { field: 'id', title: '数据字典ID', minWidth: 140, treeNode: true },
  { field: 'cXuhao', title: '字典编号', minWidth: 140 },
  { field: 'cName', title: '字典名称', minWidth: 180 },
  {
    field: 'cSign',
    title: '是否启用',
    width: 100,
    formatter: ({ cellValue }) => {
      const option = signOptions.find(opt => opt.value === cellValue);
      return option?.label || cellValue;
    }
  },
  { field: 'cCreateName', title: '创建人', width: 120 },
  { field: 'dCreate', title: '创建时间', width: 180 },
  { field: 'nOrder', title: '排序', width: 80 }
];

/**
 * 额外属性表格列配置
 */
export const gridColumns: VxeGridProps<MetaItem>['columns'] = [
  { type: 'checkbox', width: 50, align: 'center' },
  {
    field: 'key',
    title: '属性键',
    minWidth: 150,
    ...EditRender.SelectRender,
    params: {
      placeholder: '请选择属性键',
      allowClear: true,
      options: []
    },
    selectOptions: {
      dictCode: 'DICTATTR',
      fieldMapping: {
        label: 'cName',
        value: 'cXuhao'
      }
    }
  },
  {
    field: 'value',
    title: '属性值',
    minWidth: 200,
    ...EditRender.InputRender,
    params: {
      placeholder: '请输入属性值',
      allowClear: true
    }
  }
];

/**
 * 子级数据字典表格列配置
 */
export const childGridColumns: VxeGridProps<any>['columns'] = [
  {
    field: 'cXuhao',
    title: '子级数据字典编号',
    minWidth: 200,
    ...EditRender.InputRender,
    params: {
      placeholder: '请输入子级数据字典编号',
      allowClear: true,
      disabled: true
    }
  },
  {
    field: 'cName',
    title: '子级数据字典名称',
    minWidth: 200,
    ...EditRender.InputRender,
    params: {
      placeholder: '请输入子级数据字典名称',
      allowClear: true
    }
  },
  {
    field: 'nOrder',
    title: '子级数据字典排序',
    minWidth: 150,
    ...EditRender.InputRender,
    params: {
      placeholder: '请输入排序',
      allowClear: true
    }
  }
];

/**
 * 额外属性表格校验规则
 */
export const gridEditRules = {
  key: [{ required: true, message: '请输入属性键' }]
};

/**
 * 表格工具栏按钮配置
 */
export const tableToolbarButtons = [
  { code: 'insert', name: '添加属性' },
  { code: 'remove', name: '删除' }
];

/**
 * 标签页配置
 */
export const tabsConfig = [
  {
    title: '额外属性',
    type: 'grid',
    gridConfig: {
      columns: gridColumns,
      editRules: gridEditRules,
      toolbarButtons: tableToolbarButtons
    }
  },
  {
    title: '子级数据字典',
    type: 'grid',
    gridConfig: {
      columns: childGridColumns,
      editRules: {},
      toolbarButtons: []
    }
  }
];

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'ywsjzd',
  nResourceid: 161,
  cModnumb: 'b2a3c6ba-d6d8-4d51-ad78-887f05b9e56b'
};
