import type { FormSchema } from '@sunny-base-web/ui';
import { EditRender } from '@sunny-base-web/ui';
import type { VxeGridProps } from 'vxe-table';
import type { DataDictionaryVO, DataDictionaryFormVO, MetaItem } from './types';

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
      dictCode: 'SFQY',  // 是否启用字典编码
      fieldMapping: {
        label: 'cName',
        value: 'cXuhao'
      }
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
export const tableColumns: VxeGridProps<DataDictionaryVO>['columns'] = [
  { type: 'checkbox', width: 50 },
  { type: 'seq', title: '序号', width: 60 },
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
export const metaGridColumns: VxeGridProps<MetaItem>['columns'] = [
  { type: 'checkbox', width: 50, align: 'center' },
  { type: 'seq', title: '序号', width: 60, align: 'center' },
  {
    field: 'key',
    title: '属性键',
    minWidth: 150,
    ...EditRender.InputRender,
    params: {
      placeholder: '如: icon, color',
      allowClear: true
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
 * 额外属性表格校验规则
 */
export const metaGridEditRules = {
  key: [{ required: true, message: '请输入属性键' }]
};

/**
 * 资源配置
 */
export const resourceConfig = {
  resourceId: 'dataDictionary',
  nResourceid: 62,
  cModnumb: '40577f0e-1c19-4fa6-bb88-d247fff5e32a'
};
