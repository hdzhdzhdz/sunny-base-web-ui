export interface ModalProps {
  /**
   * 是否显示 Dialog(.sync绑定)
   * @default false
   */
  modelValue?: boolean;

  /**
   * 是否默认全屏(.sync绑定)
   * @default false
   */
  fullscreen?: boolean;

  /**
   * 是否可以全屏
   * @default true
   */
  canFullscreen?: boolean;

  /**
   * 是否可以最小化
   * @default true
   */
  canMinimize?: boolean;

  /**
   * 是否显示取消按钮
   * @default true
   */
  showCancelBtn?: boolean;

  /**
   * 取消按钮文字
   * @default '取消'
   */
  cancelText?: string;

  /**
   * 是否显示确定按钮
   * @default true
   */
  showOkBtn?: boolean;

  /**
   * 确定按钮文字
   * @default '确定'
   */
  okText?: string;

  /**
   * 确认按钮loading
   * @default false
   */
  confirmLoading?: boolean;

  /**
   * 弹窗标题
   */
  title?: string;

  /**
   * 宽度
   */
  width?: string | number;

  /**
   * 确定回调
   */
  onOk?: () => void;

  /**
   * 取消回调
   */
  onCancel?: () => void;

  /**
   * 关闭回调
   */
  onClose?: () => void;
}

export interface ModalApiOptions extends Partial<ModalProps> {
  [key: string]: any;
}

export interface ModalMethods {
  setProps: (props: Partial<ModalProps>) => void;
  open: () => void;
  close: () => void;
  setState: (
    stateOrFn: ((prev: ModalProps) => Partial<ModalProps>) | Partial<ModalProps>
  ) => void;
}

export type UseModalReturnType = [
  any, // The component definition
  ModalMethods, // The methods
];
