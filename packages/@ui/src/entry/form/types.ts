import type { FieldOptions, FormContext, GenericObject } from 'vee-validate';
import type { ZodTypeAny } from 'zod';
import type { Component, HtmlHTMLAttributes } from 'vue';

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
  | 'selectRequired'
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
   */
  triggerFields?: string[];
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
}

export interface SunnyFormProps {
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
}

/**
 * 表单适配器选项
 * Form adapter options
 */
export interface SunnyFormAdapterOptions<
  T extends BaseFormComponentType = BaseFormComponentType,
> {
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
