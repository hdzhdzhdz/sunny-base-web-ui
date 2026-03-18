import type { FormContext, GenericObject } from 'vee-validate';
import type { ZodTypeAny } from 'zod';
import type { Component } from 'vue';

export type FormLayout = 'horizontal' | 'inline' | 'vertical';

export type BaseFormComponentType =
  | 'SunnyInput'
  | 'SunnySelect'
  | 'SunnyCheckbox'
  | 'SunnyRadio'
  | 'SunnySwitch'
  | 'SunnyDatePicker'
  | 'SunnyTimePicker'
  | 'SunnyUpload'
  | 'Input'
  | 'Select'
  | 'Checkbox'
  | 'Radio'
  | 'Switch'
  | 'DatePicker'
  | 'TimePicker'
  | 'Upload'
  | (Record<never, never> & string);

export interface FormShape {
  default?: any;
  fieldName: string;
  required?: boolean;
  rules?: ZodTypeAny;
}

export type MaybeComponentProps = Record<string, any>;

export type FormActions = FormContext<GenericObject>;

export type FormSchemaRuleType =
  | 'required'
  | null
  | ZodTypeAny;

export interface FormItemDependencies {
  /**
   * 动态组件属性
   * Dynamic component props
   */
  componentProps?: (
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => MaybeComponentProps | PromiseLike<MaybeComponentProps>;
  /**
   * 是否渲染 (v-if)
   * Whether to render
   */
  if?: (
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => boolean | PromiseLike<boolean>;
  /**
   * 是否显示 (v-show)
   * Whether to show
   */
  show?: (
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => boolean | PromiseLike<boolean>;
  /**
   * 触发依赖更新的字段
   * Trigger fields for dependency updates
   * @deprecated 已废弃，Vue 会自动追踪依赖，无需手动指定
   * @deprecated Deprecated, Vue automatically tracks dependencies, no need to specify manually
   */
  triggerFields?: string[];
  disabled?: (
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => boolean | PromiseLike<boolean>;
  required?: (
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => boolean | PromiseLike<boolean>;
  rules?: (
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => FormSchemaRuleType | PromiseLike<FormSchemaRuleType>;
  trigger?: (
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => void | PromiseLike<void>;
}

export interface ColProps {
  span?: number;
  offset?: number;
  push?: number;
  pull?: number;
  order?: number;
  xs?: number | { [key: string]: any };
  sm?: number | { [key: string]: any };
  md?: number | { [key: string]: any };
  lg?: number | { [key: string]: any };
  xl?: number | { [key: string]: any };
  xxl?: number | { [key: string]: any };
  [key: string]: any;
}

export type FieldMappingTime = [
  string,
  [string, string],
  (
    | ((value: any, fieldName: string) => any)
    | [string, string]
    | null
    | string
  )?,
][];

export type ArrayToStringFields = Array<
  | [string[], string?] // 嵌套数组格式，可选分隔符
  | string // 单个字段，使用默认分隔符
  | string[] // 简单数组格式，最后一个元素可以是分隔符
>;

export interface FormSchema {
  /**
   * 组件属性
   * Component props
   */
  componentProps?: MaybeComponentProps;
  /**
   * 组件类型
   * Component type
   */
  component?: BaseFormComponentType | Component;
  /**
   * 默认值
   * Default value
   */
  defaultValue?: any;
  /**
   * 依赖项配置
   * Dependencies configuration
   */
  dependencies?: FormItemDependencies;
  /**
   * 字段名
   * Field name
   */
  fieldName?: string;
  /**
   * 标签
   * Label
   */
  label?: string;
  /**
   * 验证规则
   * Validation rules
   */
  rules?: FormSchemaRuleType;
  /**
   * 帮助信息
   * Help message
   */
  help?: string;
  /**
   * 标签宽度
   * Label width
   */
  labelWidth?: number | string;
  /**
   * 栅格列配置 (传递给 a-col)
   * Col props (passed to a-col)
   */
  colProps?: ColProps;
  /**
   * 栅格跨度 (1-24)
   * Col span (1-24)
   */
  colSpan?: number;
  /**
   * 通用组件属性
   * Common component props
   */
  commonComponentProps?: Record<string, any>;
  /**
   * 表单字段属性 (传递给 FormField/FormItem)
   * Form field props
   */
  formFieldProps?: Record<string, any>;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 是否隐藏字段（静态隐藏，不参与联动）
   * Whether to hide the field (static hiding, not involved in dependencies)
   */
  hidden?: boolean;

  /**
   * Select 选项声明配置（声明式加载字典选项）
   * Select options declaration config (declarative loading of dictionary options)
   * @description 在 FormSchema 中声明式配置字典选项，useList 会自动收集并批量加载
   * @description Declarative configuration of dictionary options in FormSchema, useList will auto-collect and batch load
   * @example
   * ```typescript
   * {
   *   fieldName: 'nZt',
   *   component: 'Select',
   *   selectOptions: {
   *     dictCode: 'SFQY',
   *     fieldMapping: { label: 'cName', value: 'cXuhao' }
   *   }
   * }
   * ```
   */
  selectOptions?: SelectOptionsDeclaration;
}

export interface SunnyFormProps {
  /**
   * 表单唯一标识
   * Form unique identifier
   */
  id?: string;
  /**
   * 表单布局
   * Form layout
   */
  layout?: FormLayout;
  /**
   * 表单尺寸
   * Form size
   * @default 'small'
   */
  size?: 'mini' | 'small' | 'medium' | 'large';
  /**
   * 表单 Schema 配置
   * Form schema configuration
   */
  schema?: FormSchema[];
  /**
   * 标签宽度
   * Label width
   */
  labelWidth?: number | string;
  /**
   * 外层容器类名
   * Wrapper class
   */
  wrapperClass?: string;
  /**
   * 栅格容器配置 (传递给 a-grid 组件，如 cols, xGap, yGap)
   * Grid container props (passed to a-grid)
   */
  gridProps?: Record<string, any>;
  /**
   * 操作栏外层类名
   * Action wrapper class
   */
  actionWrapperClass?: string;
  /**
   * 表单项通用配置 (如 colProps, labelWidth, componentProps)
   * Common config for form items
   */
  commonConfig?: Record<string, any>;
  /**
   * 其他配置
   * Other configuration
   */
  config?: Record<string, any>;
  /**
   * 是否显示默认操作按钮 (提交/重置)
   * Show default actions (submit/reset)
   */
  showDefaultActions?: boolean;
  /**
   * 提交按钮配置
   * Submit button options
   */
  submitButtonOptions?: Record<string, any>;
  /**
   * 重置按钮配置
   * Reset button options
   */
  resetButtonOptions?: Record<string, any>;
  /**
   * 是否回车提交
   * Submit on enter
   */
  submitOnEnter?: boolean;
  /**
   * 是否在值变化时自动提交
   * Submit on change
   */
  submitOnChange?: boolean;
  /**
   * 值变化时的回调
   * Handle values change
   */
  handleValuesChange?: (values: Record<string, any>, changedFields: string[]) => void;
  /**
   * 折叠状态变化时的回调
   * Handle collapsed change
   */
  handleCollapsedChange?: (collapsed: boolean) => void;
  /**
   * 提交回调
   * Handle submit
   */
  handleSubmit?: (values: Record<string, any>) => Promise<void> | void;
  /**
   * 滚动到第一个错误字段
   * Scroll to first error field
   */
  scrollToFirstError?: boolean;
  /**
   * 重置回调
   * Handle reset
   */
  handleReset?: (values: Record<string, any>) => Promise<void> | void;
  /**
   * 是否折叠
   * Collapsed state
   */
  collapsed?: boolean;
  /**
   * 是否显示折叠按钮
   * Show collapse button
   */
  showCollapseButton?: boolean;
  /**
   * 折叠行数
   * Collapsed rows
   */
  collapsedRows?: number;
  /**
   * 折叠是否触发布局调整
   * Collapse trigger resize
   */
  collapseTriggerResize?: boolean;
  /**
   * 紧凑模式
   * Compact mode
   */
  compact?: boolean;
  /**
   * 操作按钮布局
   * Action buttons layout
   */
  actionLayout?: 'inline' | 'newLine' | 'rowEnd';
  /**
   * 操作按钮位置
   * Action buttons position
   */
  actionPosition?: 'left' | 'right' | 'center';
  /**
   * 操作栏栅格配置 (传递给 a-grid-item)
   * Action column props
   */
  actionColProps?: ColProps;
  /**
   * 表单值
   * Form values
   */
  values?: Record<string, any>;
  /**
   * 表单字段映射到时间格式
   * Field mapping time
   */
  fieldMappingTime?: FieldMappingTime;
  /**
   * 表单字段数组映射字符串配置 默认使用","
   * Array to string fields
   */
  arrayToStringFields?: ArrayToStringFields;
  /**
   * 对象数组转值字符串配置
   * Object array to value string fields
   * 会自动从组件配置的 fieldNames 中读取 value 字段进行提取
   */
  objectToValueFields?: string[];

}

export interface FormApiOptions extends SunnyFormProps {
  /**
   * 表单实例
   * Form instance
   */
  form?: any;
}

/**
 * BusinessSearch 加载配置返回格式
 * BusinessSearch load config return format
 */
export interface BusinessSearchConfig {
  /**
   * 弹窗标题
   */
  title?: string;
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
  /**
   * 搜索表单配置 (FormSchema 格式)
   */
  formSchema?: any[];
  /**
   * 表格列配置 (VxeTable 格式)
   */
  tableColumns?: any[];
  /**
   * 字段名映射
   */
  fieldNames?: {
    label: string;
    value: string;
    desc?: string;
  };
  /**
   * 搜索 API 函数
   */
  searchApi?: (params: any) => Promise<{ records: any[]; total: number }>;
}

/**
 * BusinessSearch 搜索参数格式
 * BusinessSearch search params format
 */
export interface BusinessSearchParams {
  /**
   * 配置编码
   */
  cNum: string;
  /**
   * 分页：当前页 (别名)
   */
  page?: number;
  /**
   * 分页：当前页
   */
  pageNo?: number;
  /**
   * 分页：每页条数
   */
  pageSize?: number;
  /**
   * 搜索字段
   */
  [key: string]: any;
}

/**
 * BusinessSearch 搜索结果格式
 * BusinessSearch search result format
 */
export interface BusinessSearchResult {
  /**
   * 数据列表
   */
  records: any[];
  /**
   * 总数
   */
  total: number;
}

/**
 * BusinessSearch API 适配器接口
 * BusinessSearch API adapter interface
 *
 * 组件不关心数据如何获取和转换，全部由 adapter 负责
 * The component doesn't care about how data is fetched and transformed, all handled by adapter
 */
export interface BusinessSearchAdapter {
  /**
   * 加载动态配置
   * Load dynamic configuration
   *
   * 职责：
   * 1. 调用后端接口获取原始配置
   * 2. 转换成 BusinessSearchConfig 格式
   *
   * @param cNum 配置编码
   * @returns 已转换好的配置数据 (BusinessSearchConfig)
   */
  loadConfig?: (cNum: string) => Promise<BusinessSearchConfig>;

  /**
   * 搜索数据
   * Search data
   *
   * 职责：
   * 1. 接收前端组件传入的搜索参数
   * 2. 转换成后端需要的格式
   * 3. 调用后端接口
   * 4. 转换返回结果成 BusinessSearchResult 格式
   *
   * @param params 搜索参数 (已包含分页信息)
   * @returns 搜索结果 (BusinessSearchResult)
   */
  search?: (params: BusinessSearchParams) => Promise<BusinessSearchResult>;
}

export interface CustomizeSelectConfig {
  nType?: number;
  cLabelslotcol?: string;
  nSearchinterval?: number;
}

export interface CustomizeSelectOption {
  cKeynumb: string | number;
  cKeyname: string;
  cSlot?: string;
}

export interface CustomizeSelectQueryParams {
  cNum: string | number;
  attrParam?: Record<string, any>;
  cVal?: string;
  searchCondition?: string;
}

export interface CustomizeSelectQueryResult {
  options: CustomizeSelectOption[];
  config?: CustomizeSelectConfig;
}

export interface CustomizeSelectAdapter {
  query: (params: CustomizeSelectQueryParams) => Promise<CustomizeSelectQueryResult>;
}

/**
 * Select 选项数据格式
 * Select option data format
 */
export interface SelectOption {
  /**
   * 显示文本
   * Display text
   */
  label: string;
  /**
   * 选项值
   * Option value
   */
  value: string | number;
  /**
   * 是否禁用
   * Whether disabled
   */
  disabled?: boolean;
  /**
   * 保留原始字段
   * Preserve original fields
   */
  [key: string]: any;
}

/**
 * Select 字段映射配置
 * Select field mapping configuration
 */
export interface SelectFieldMapping {
  /**
   * label 字段名
   * Label field name
   * @default 'cName'
   */
  label?: string;
  /**
   * value 字段名
   * Value field name
   * @default 'cXuhao'
   */
  value?: string;
}

/**
 * Select 选项声明配置（Schema 声明式）
 * Select options declaration config (Schema declarative)
 * @description 用于在 FormSchema 中声明式配置字典选项，useList 会自动收集并批量加载
 * @description Used for declarative configuration of dictionary options in FormSchema, useList will auto-collect and batch load
 */
export interface SelectOptionsDeclaration {
  /**
   * 字典编码
   * Dictionary code
   */
  dictCode: string | number;

  /**
   * 字段映射配置
   * Field mapping configuration
   */
  fieldMapping?: SelectFieldMapping;

  /**
   * 是否强制刷新
   * Whether to force reload
   * @default false
   */
  forceReload?: boolean;
}

/**
 * Select 选项加载适配器
 * Select options loader adapter
 */
export interface SelectOptionsAdapter {
  /**
   * 批量加载多个字典选项
   * Batch load multiple dictionary options
   * @param numbList - 字典编码列表
   * @param fieldMapping - 字段映射配置
   * @returns 选项映射表 { dictCode: options }
   */
  loadOptions: (
    numbList: (string | number)[],
    fieldMapping?: SelectFieldMapping
  ) => Promise<Record<string, SelectOption[]>>;
}

/**
 * 表单通用配置
 * Form common configuration
 */
export interface FormCommonConfig {
  /**
   * 是否禁用 change 事件监听
   * Whether to disable change listener
   */
  disabledOnChangeListener?: boolean;
  /**
   * 是否禁用 input 事件监听
   * Whether to disable input listener
   */
  disabledOnInputListener?: boolean;
  /**
   * 空状态值
   * Empty state value
   */
  emptyStateValue?: any;
  /**
   * BusinessSearch API 适配器
   * BusinessSearch API adapter
   * 用于适配业务系统的后端接口格式
   * Used to adapt business system backend API formats
   */
  businessSearchAdapter?: BusinessSearchAdapter;
  /**
   * CustomizeSelect API 适配器
   */
  customizeSelectAdapter?: CustomizeSelectAdapter;
  /**
   * Select 选项加载适配器
   * Select options loader adapter
   * 用于批量加载字典选项
   * Used for batch loading dictionary options
   */
  selectOptionsAdapter?: SelectOptionsAdapter;
  /**
   * API 前缀
   */
  apiPrefix?: string;
}

/**
 * 表单适配器选项
 * Form adapter options
 */
export interface SunnyFormAdapterOptions {
  /**
   * 配置
   * Configuration
   */
  config?: FormCommonConfig;
  /**
   * 定义验证规则
   * Define validation rules
   */
  defineRules?: Record<string, any>;
}

/**
 * 表单渲染属性
 * Form render properties
 */
export interface FormRenderProps extends SunnyFormProps {
  form?: any;
}
