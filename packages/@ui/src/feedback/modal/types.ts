export interface ModalProps {
  /** 是否可见 */
  modelValue?: boolean;
  /** 标题 */
  title?: string;
  /** 宽度 */
  width?: string | number;
  /** 距离顶部距离 */
  top?: string | number;
  /** 层级 */
  zIndex?: number;
  /** 帮助信息 */
  helpMessage?: string;
  /** 是否支持 ESC 关闭 */
  closeOnEsc?: boolean;
  /** 是否显示全屏按钮 */
  fullscreen?: boolean;
  /** 是否支持点击遮罩关闭 */
  closeOnClickModal?: boolean;
  /** 确认按钮文字 */
  okText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认按钮 loading */
  okLoading?: boolean;
  /** 确认按钮 loading (兼容) */
  confirmLoading?: boolean;
  /** 是否隐藏取消按钮 */
  hideCancel?: boolean;
  /** 确认按钮 props */
  okButtonProps?: any;
  /** 取消按钮 props */
  cancelButtonProps?: any;
  /** 可见性变化回调 */
  onVisibleChange?: (visible: boolean) => void;
  /** 确认前回调 */
  onBeforeOk?: (
    done?: (closed: boolean) => void
  ) => void | boolean | Promise<void | boolean>;
  /** 取消前回调 */
  onBeforeCancel?: () => boolean | Promise<boolean>;
  /** 是否支持拖拽 */
  draggable?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 确认回调 */
  onOk?: () => void;
}

export interface ModalApiOptions extends Partial<ModalProps> {
  [key: string]: any;
}

export interface ModalMethods {
  /** 设置属性 */
  setProps: (props: Partial<ModalProps>) => void;
  /** 打开弹窗 */
  open: () => void;
  /** 关闭弹窗 */
  close: () => void;
  /** 设置状态 */
  setState: (
    stateOrFn: ((prev: ModalProps) => Partial<ModalProps>) | Partial<ModalProps>
  ) => void;
}

export type UseModalReturnType = [
  any, // 组件定义
  ModalMethods, // 方法
];
