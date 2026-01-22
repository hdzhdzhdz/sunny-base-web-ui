import type { PatternKey } from "@utils";

export interface KunkkaInputProps {
  /**
   * 绑定值
   */
  modelValue?: string | number;
  /**
   * 预设校验规则 (来自于 @utils/regex)
   */
  rule?: PatternKey;
  /**
   * 自定义正则
   */
  regex?: RegExp | string;
  /**
   * 提示信息 (如果未提供，尝试使用 rule 对应的默认提示)
   */
  tip?: string;
  /**
   * 是否在输入框右侧显示提示图标
   * @default true
   */
  showTipIcon?: boolean;
}
