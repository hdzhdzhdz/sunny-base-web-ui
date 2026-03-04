import type { VxeGridPropTypes } from 'vxe-table';
import type { FormSchema } from '../../entry/form/types';
import type { SunnySearchModalProps } from '../../feedback/search-modal/types';
import type { FieldNames } from '../../entry/search-input-tag/types';

/**
 * 业务搜索组件配置接口
 * Business search component configuration interface
 * 用于定义特定业务类型（如用户、部门）的搜索弹窗结构
 */
export interface BusinessSearchConfig {
  /**
   * 弹窗标题
   */
  title: string;
  /**
   * 搜索表单配置
   */
  formSchema?: FormSchema[];
  /**
   * 表格列配置
   */
  tableColumns?: VxeGridPropTypes.Columns;
  /**
   * 查询接口函数
   * Search API function
   * 由 adapter.search 代理注入，组件内部不再直接调用 axios
   */
  searchApi?: (params: any) => Promise<any>;
  /**
   * 字段名映射
   */
  fieldNames?: {
    label: string;
    value: string;
    desc?: string;
  };
  /**
   * 弹窗宽度
   */
  width?: string | number;
  /**
   * 内容高度
   */
  contentHeight?: string | number;
  /**
   * 是否多选
   */
  multiple?: boolean;
}

/**
 * 组件 Props 定义
 */
export interface SunnyBusinessSearchProps {
  /**
   * 双向绑定的选中值
   * 支持传入 null/undefined，组件内部会自动转换为空数组
   */
  modelValue?: any[] | null;
  /**
   * 业务类型 (e.g., 'user', 'dept')
   * 用于加载静态预设配置
   */
  type?: string;
  /**
   * 动态配置编码 (e.g., 'MACHINE_SBBH')
   * 用于从后端加载配置。当提供时，优先使用动态配置流程。
   */
  cNum?: string;
  /**
   * 输入框占位符
   * @default "请选择"
   */
  placeholder?: string;
  /**
   * 是否多选
   * @default true
   */
  multiple?: boolean;
  /**
   * 选择模式 (用于替代 multiple，优先级低于 multiple)
   * 'single' | 'multiple'
   */
  cSelectionMode?: string;
  /**
   * 输入框最大显示标签数
   */
  maxTagCount?: number;
  /**
   * 透传给 SearchModal 的属性（用于覆盖默认配置）
   */
  modalProps?: Partial<SunnySearchModalProps>;
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 字段名映射
   * 优先级: props.fieldNames > props.modalProps.fieldNames > currentConfig.fieldNames
   */
  fieldNames?: FieldNames;
}
