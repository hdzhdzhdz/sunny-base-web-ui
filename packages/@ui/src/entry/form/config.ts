import {
  Input,
  InputPassword,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  DatePicker,
  RangePicker,
  TimePicker,
  Upload,
  InputNumber,
  Textarea,
  Rate,
  Slider,
  Cascader,
  TreeSelect,
  // Mentions,
} from '@arco-design/web-vue';
import { defineAsyncComponent, type Component } from 'vue';
import type {
  FormCommonConfig,
  SunnyFormAdapterOptions,
} from './types';
import { defineRule } from 'vee-validate';

const SunnyBusinessSearch = defineAsyncComponent(() => import('../../composite/business-search/SunnyBusinessSearch.vue'));
const SunnyApiSelect = defineAsyncComponent(() => import('../api-select/SunnyApiSelect.vue'));

// 注册基础验证规则
defineRule('required', (value: any) => {
  if (value === null || value === undefined || value === '') {
    return '此项必填';
  }
  if (Array.isArray(value) && value.length === 0) {
    return '此项必填';
  }
  return true;
});

/**
 * 默认模型字段名
 * Default model prop name
 */
// const DEFAULT_MODEL_PROP_NAME = 'modelValue';

export const COMPONENT_MAP: Record<string, Component> = {
  Input,
  InputPassword,
  InputNumber,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  DatePicker,
  RangePicker,
  TimePicker,
  Upload,
  Rate,
  Slider,
  Cascader,
  TreeSelect,

  // Mentions,
  // Alias for prefix if needed, or map to same
  SunnySelect: Select,
  SunnyCheckbox: Checkbox,
  SunnyRadio: Radio,
  SunnySwitch: Switch,
  SunnyDatePicker: DatePicker,
  SunnyTimePicker: TimePicker,
  SunnyUpload: Upload,
  SunnyBusinessSearch,
  SunnyApiSelect,
};

export const COMPONENT_BIND_EVENT_MAP: Record<string, string> = {
  Checkbox: 'change',
  Switch: 'change',
  Upload: 'change',
};

export const DEFAULT_FORM_COMMON_CONFIG: FormCommonConfig = {};

/**
 * 初始化 表单配置
 * Setup form configuration
 *
 * @param options 适配器选项
 */
export function setupSunnyForm(options: SunnyFormAdapterOptions) {
  // 解构配置项和自定义验证规则
  // Destructure config and custom validation rules
  const { config, defineRules } = options;

  // 提取通用配置，并设置默认值
  // Extract common config and set default values
  const {
    // 默认禁用 change 事件监听 (Arco 组件通常不需要手动监听 change)
    // Default disable change listener (Arco components usually don't need manual change listener)
    disabledOnChangeListener = true,
    // 默认禁用 input 事件监听 (避免频繁触发)
    // Default disable input listener (Avoid frequent triggering)
    disabledOnInputListener = true,
    // 空状态时的默认值 (通常为 undefined)
    // Default value for empty state (Usually undefined)
    emptyStateValue = undefined,
  } = (config || {}) as FormCommonConfig;

  // 将配置应用到全局默认配置对象中，供其他组件使用
  // Apply config to global default config object for other components to use
  Object.assign(DEFAULT_FORM_COMMON_CONFIG, {
    disabledOnChangeListener,
    disabledOnInputListener,
    emptyStateValue,
  });


  // 如果提供了自定义验证规则，注册到 vee-validate 中
  // If custom validation rules are provided, register them to vee-validate
  if (defineRules) {
    for (const key of Object.keys(defineRules)) {
      // 使用 defineRule 全局注册规则，使其在 Schema 中可用
      // Use defineRule to register rules globally, making them available in Schema
      defineRule(key, defineRules[key]);
    }
  }
}
