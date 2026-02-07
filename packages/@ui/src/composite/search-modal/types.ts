export interface SearchConfig {
  title?: string;
  searchApi?: string; // 可选，如果为空则使用通用查询接口
  rowKey?: string;
  formSchema: Record<string, any>[]; // 暂时使用 Record<string, any>，理想情况应引用 SunnyForm 的 Schema 类型
  tableColumns: Record<string, any>[]; // 引用 Table Column 类型
  commonConfig?: Record<string, any>; // 表单通用配置
}

export interface SunnySearchModalProps {
  /**
   * 弹窗宽度
   * @default '1200px'
   */
  width?: string | number;
  /**
   * 弹窗显示状态 (v-model)
   */
  visible: boolean;
  /**
   * 配置编号 (核心参数)
   * 对应后端接口传参中的 sqlNum
   */
  sqlNum: string;
  /**
   * 额外的查询条件
   * 对应后端接口传参中的 conditions
   */
  conditions?: Record<string, any>;
  /**
   * 默认选中的数据 (回显)
   */
  modelValue?: Record<string, any>[];
  /**
   * 弹窗标题
   */
  title?: string;
  /**
   * 单选/多选模式
   * @default true
   */
  multiple?: boolean;
  /**
   * 数据主键字段名
   * @default 'id'
   */
  rowKey?: string;
  /**
   * 字段映射配置
   * 用于指定显示在右侧列表的字段
   */
  fieldNames?: {
    value?: string;
    label?: string;
    desc?: string;
  };
  /**
   * 表单通用配置 (如 colProps, labelWidth 等)
   * Common config for form items
   */
  commonConfig?: Record<string, any>;
  /**
   * 静态配置 (用于前端直接传入配置，无需请求接口)
   * 优先级高于 sqlNum
   */
  staticConfig?: SearchConfig;
  /**
   * 帮助提示文本
   * 显示在标题栏问号图标的 Tooltip 中
   */
  helpMessage?: string;
}

export interface SunnySearchModalEmits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'update:modelValue', values: Record<string, any>[]): void;
  (e: 'confirm', values: Record<string, any>[]): void;
  (e: 'cancel'): void;
}
