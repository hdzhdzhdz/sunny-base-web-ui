import type { SunnyFormProps } from '../../entry/form';
import type { ModalProps } from '../../feedback/modal';

export interface SearchPlanItem {
  ID: string | number;
  CSEARCHPLANNAME: string;
}

export interface SunnySearchPlanProps {
  /**
   * 表单配置
   */
  formConfig: SunnyFormProps['schema'];
  /**
   * 表单模型数据
   */
  model: Record<string, any>;
  /**
   * 双向绑定的表单数据
   */
  modelValue?: Record<string, any>;
  /**
   * 搜索方案列表
   */
  searchPlanList: SearchPlanItem[];
  /**
   * 当前选中的搜索方案
   */
  currentSearchPlan?: SearchPlanItem;
  /**
   * 资源ID
   */
  resourceId: string;
  /**
   * 资源编号
   */
  nResourceid?: number;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 弹窗配置
   */
  modalProps?: Partial<ModalProps>;
  /**
   * 表单配置覆盖
   */
  formProps?: Partial<SunnyFormProps>;
  /**
   * 弹窗标题
   */
  title?: string;
  /**
   * 弹窗宽度
   */
  width?: string | number;
  /**
   * 加载状态
   */
  loading?: boolean;
}

export interface SunnySearchPlanEmits {
  /**
   * 新增查询方案
   */
  (e: 'add', name: string, model: Record<string, any>): void;
  /**
   * 覆盖查询方案
   */
  (e: 'update', id: string | number, name: string, model: Record<string, any>): void;
  /**
   * 删除查询方案
   */
  (e: 'delete', id: string | number): void;
  /**
   * 选择查询方案
   */
  (e: 'select', plan: SearchPlanItem): void;
  /**
   * 重置表单
   */
  (e: 'reset'): void;
  /**
   * 搜索
   */
  (e: 'search', model: Record<string, any>): void;
  /**
   * 错误事件
   */
  (e: 'error', error: any): void;
  /**
   * 默认查询方案加载完成
   */
  (e: 'default-plan-loaded', model: Record<string, any>): void;
}
