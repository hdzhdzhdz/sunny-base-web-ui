import type {
  FormItemDependencies,
  FormSchemaRuleType,
  MaybeComponentProps,
} from '../types';

import { computed } from 'vue';

import { isBoolean, isFunction } from '@sunny-base-web/utils';

import { useFormValues } from 'vee-validate';

import { injectRenderFormProps } from './context';

/**
 * 使用表单依赖钩子
 * Use form dependencies hook
 *
 * 用于处理表单项之间的联动关系，如：显示/隐藏、禁用/启用、必填/非必填、动态 props 等
 * Used to handle linkage relationships between form items, such as: show/hide, disable/enable, required/optional, dynamic props, etc.
 *
 * @param getDependencies 获取依赖配置的函数
 */
export default function useDependencies(
  getDependencies: () => FormItemDependencies | undefined,
) {
  // 获取表单值
  const values = useFormValues();

  // 获取注入的表单渲染属性
  const formRenderProps = injectRenderFormProps();

  // 获取表单 API 实例
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const formApi = formRenderProps.form!;

  if (!values) {
    throw new Error('useDependencies should be used within <SunnyForm> (VeeValidate Form)');
  }

  // 获取当前表单值
  // Get current form values
  const formValues = computed(() => values.value);

  // 获取依赖配置
  // Get dependencies config
  const dependencies = computed(() => getDependencies());

  // 【原代码 / Original code】
  // 使用 watch + ref 的方式，支持异步函数
  // Using watch + ref approach, supports async functions
  //
  // const isIf = ref(true);
  // const isShow = ref(true);
  // ...watch(() => { isIf.value = await whenIf(values); })...
  //
  // 【新实现 / New implementation】
  // 使用 computed，直接响应式，无需 watch
  // Using computed, directly reactive, no watch needed
  // Vue 会自动追踪 formValues 的依赖，任何字段变化都会触发重新计算
  // Vue automatically tracks formValues dependencies, any field change triggers recalculation

  // 是否渲染 DOM (v-if)
  // Whether to render DOM (v-if)
  const isIf = computed(() => {
    const deps = dependencies.value;
    if (!deps) return true;

    const { if: whenIf } = deps;
    const vals = formValues.value;

    if (isFunction(whenIf)) {
      return !!whenIf(vals, formApi);
    }
    if (isBoolean(whenIf)) {
      return whenIf;
    }
    return true;
  });

  // 是否显示 (v-show)
  // Whether to show (v-show)
  const isShow = computed(() => {
    const deps = dependencies.value;
    if (!deps) return true;

    const { show } = deps;
    const vals = formValues.value;

    if (isFunction(show)) {
      return !!show(vals, formApi);
    }
    if (isBoolean(show)) {
      return show;
    }
    return true;
  });

  // 是否禁用
  // Whether disabled
  const isDisabled = computed(() => {
    const deps = dependencies.value;
    if (!deps) return false;

    const { disabled } = deps;
    const vals = formValues.value;

    if (isFunction(disabled)) {
      return !!disabled(vals, formApi);
    }
    if (isBoolean(disabled)) {
      return disabled;
    }
    return false;
  });

  // 是否必填
  // Whether required
  const isRequired = computed(() => {
    const deps = dependencies.value;
    if (!deps) return false;

    const { required } = deps;
    const vals = formValues.value;

    if (isFunction(required)) {
      return !!required(vals, formApi);
    }
    return false;
  });

  // 动态组件属性
  // Dynamic component props
  const dynamicComponentProps = computed<MaybeComponentProps>(() => {
    const deps = dependencies.value;
    if (!deps) return {};

    const { componentProps } = deps;
    const vals = formValues.value;

    if (isFunction(componentProps)) {
      return componentProps(vals, formApi) || {};
    }
    return {};
  });

  // 动态验证规则
  // Dynamic validation rules
  const dynamicRules = computed<FormSchemaRuleType | undefined>(() => {
    const deps = dependencies.value;
    if (!deps) return undefined;

    const { rules } = deps;
    const vals = formValues.value;

    if (isFunction(rules)) {
      return rules(vals, formApi);
    }
    return undefined;
  });

  return {
    dynamicComponentProps,
    dynamicRules,
    isDisabled,
    isIf,
    isRequired,
    isShow,
  };
}
