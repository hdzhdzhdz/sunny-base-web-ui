import type { VxeGridPropTypes } from 'vxe-table';
import type { FormSchema } from '../../entry/form/types';

export interface SunnySearchModalProps {
  /**
   * 弹窗显示状态 (v-model)
   */
  visible: boolean;
  /**
   * 搜索表单配置
   */
  formSchema?: FormSchema[];
  /**
   * 表格列配置
   */
  tableColumns: VxeGridPropTypes.Columns;
  /**
   * 查询接口地址或函数
   * 如果是 string，则发起 POST 请求
   * 如果是 Function，则直接调用，需返回 Promise
   */
  searchApi?: string | ((params: any) => Promise<any>);
  /**
   * 默认选中的数据 (回显)
   * 数组中的对象至少包含 rowKey 指定的字段
   */
  modelValue?: Record<string, any>[];
  /**
   * 字段名映射配置
   * 用于指定回显时显示的文本字段和值字段
   * @default { label: 'label', value: 'value', desc: 'desc' }
   */
  fieldNames?: {
    label?: string;
    value?: string;
    desc?: string; // 第二行描述文本字段
  };
  /**
   * 表单通用配置 (如 colProps, labelWidth 等)
   * 用于控制内部搜索表单的布局和属性，与 SunnyForm 的 commonConfig 保持一致
   * @default { colProps: { xs: 24, sm: 12, md: 8, lg: 8, xl: 8, xxl: 8 } }
   */
  commonConfig?: Record<string, any>;
  /**
   * 帮助提示文本
   * 显示在标题栏问号图标的 Tooltip 中
   * @default "支持跨页多选，翻页保留选中状态；双击表格行可快速确认。"
   */
  helpMessage?: string;
  /**
   * 弹窗标题
   * @default "数据查询"
   */
  title?: string;
  /**
   * 单选/多选模式
   * @default true (多选)
   */
  multiple?: boolean;
  /**
   * 数据主键字段名
   * @default 'id'
   */
  rowKey?: string;
  /**
   * 弹窗宽度
   * @default "800px"
   */
  width?: string | number;
  /**
   * 内容区域高度 (表格区域高度)
   * @default 300
   */
  contentHeight?: string | number;
  /**
   * 是否在打开弹窗时重新查询数据
   * 设为 true 时，每次打开弹窗都会重新执行查询并清空已选数据
   * 设为 false 时，保留上次的查询结果和已选数据
   * @default true
   */
  resetOnOpen?: boolean;
  /**
   * 是否在查询时清空已选数据
   * 设为 true 时，点击查询按钮会清空右侧已选列表
   * 设为 false 时，点击查询按钮保留已选数据，可跨页累加选择
   * @default false
   */
  clearOnSearch?: boolean;
}

export interface SunnySearchModalEmits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'update:modelValue', values: Record<string, any>[]): void;
  /**
   * 确认选择事件
   */
  (e: 'confirm', values: Record<string, any>[]): void;
  /**
   * 取消事件
   */
  (e: 'cancel'): void;
}

/**
 * 搜索弹窗表单插槽
 */
export interface SunnySearchModalSlots {
  /**
   * 表单前置内容插槽
   */
  'form-prefix'?: () => any;
  /**
   * 表单后置内容插槽
   */
  'form-suffix'?: () => any;
  /**
   * 表单项前置插槽 (显示在查询按钮之前)
   */
  'submit-before'?: () => any;
  /**
   * 表单项后置插槽 (显示在重置按钮之后)
   */
  'reset-before'?: () => any;
  /**
   * 自定义表单项插槽
   * 用法: #fieldName (需在 formSchema 中设置 component: 'Slot')
   * @example
   * ```vue
   * <template #customField="{ value, setValue }">
   *   <a-input :value="value" @input="setValue($event.target.value)" />
   * </template>
   * ```
   */
  [key: string]: (props: { schema: any; model: any; value: any; setValue: (val: any) => void }) => any;
}

/**
 * 搜索弹窗暴露的方法
 */
export interface SunnySearchModalExpose {
  /**
   * 重置表格数据和已选数据
   * 清空表格数据、已选数据，并重置分页
   */
  reset: () => void;
}
