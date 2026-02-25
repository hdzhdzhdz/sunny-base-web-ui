import type {
  FormItemDependencies,
  FormSchemaRuleType,
  MaybeComponentProps,
} from '../types';

import { computed, ref, watch } from 'vue';

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

  // 定义响应式状态
  const isIf = ref(true); // 是否渲染 DOM (v-if)
  const isDisabled = ref(false); // 是否禁用
  const isShow = ref(true); // 是否显示 (v-show)
  const isRequired = ref(false); // 是否必填
  const dynamicComponentProps = ref<MaybeComponentProps>({}); // 动态组件属性
  const dynamicRules = ref<FormSchemaRuleType>(); // 动态验证规则

  // 计算监听源
  // Compute the watch source
  // 监听策略：
  // 1. 如果声明了 triggerFields，只监听指定的字段（性能更好）
  // 2. 如果未声明 triggerFields，监听整个表单值（默认行为）
  // Watch strategy:
  // 1. If triggerFields is declared, only watch specified fields (better performance)
  // 2. If triggerFields is not declared, watch entire form values (default behavior)
  const watchSource = computed(() => {
    const triggerFields = getDependencies()?.triggerFields;

    // 【原代码 / Original code】
    // 只监听 triggerFields 指定的字段，如果未指定则返回空数组
    // Only watch fields specified by triggerFields, return empty array if not specified
    // const triggerFields = getDependencies()?.triggerFields ?? [];
    // return triggerFields.map((dep) => {
    //   return values.value[dep];
    // });

    // 【新逻辑 / New logic】
    // 如果指定了 triggerFields，只监听这些字段；否则监听整个表单
    // If triggerFields is specified, only watch those fields; otherwise watch entire form
    if (triggerFields && triggerFields.length > 0) {
      return triggerFields.map((dep) => values.value[dep]);
    }
    // 未指定 triggerFields 时，返回整个表单值对象
    // When triggerFields is not specified, return the entire form values object
    return values.value;
  });

  // 重置条件状态
  // Reset condition state
  const resetConditionState = () => {
    isDisabled.value = false;
    isIf.value = true;
    isShow.value = true;
    isRequired.value = false;
    dynamicRules.value = undefined;
    dynamicComponentProps.value = {};
  };

  // 监听表单值变化和依赖配置的变化
  // Watch for changes in form values and dependency configuration
  watch(
    [watchSource, getDependencies],
    async ([_values, dependencies]) => {
      // 【原代码 / Original code】
      // 如果没有依赖配置或触发字段，直接返回
      // if (!dependencies || !dependencies?.triggerFields?.length) {
      //   return;
      // }

      // 【新逻辑 / New logic】
      // 只检查是否有依赖配置，triggerFields 不再是必须的
      // Only check if dependencies config exists, triggerFields is no longer required
      if (!dependencies) {
        return;
      }
      
      // 重置状态
      resetConditionState();
      
      const {
        componentProps,
        disabled,
        if: whenIf,
        required,
        rules,
        show,
        trigger, // 自定义触发器
      } = dependencies;

      const formValues = values.value;

      // 1. 优先判断 if，如果 if 为 false，则不渲染 dom，后续判断也不再执行
      // 1. Prioritize 'if'. If 'if' is false, do not render DOM, and subsequent checks are skipped.
      if (isFunction(whenIf)) {
        isIf.value = !!(await whenIf(formValues, formApi));
        // 不渲染，直接返回
        if (!isIf.value) return;
      } else if (isBoolean(whenIf)) {
        isIf.value = whenIf;
        if (!isIf.value) return;
      }

      // 2. 判断 show，如果 show 为 false，则隐藏
      // 2. Check 'show'. If 'show' is false, hide it.
      if (isFunction(show)) {
        isShow.value = !!(await show(formValues, formApi));
        if (!isShow.value) return;
      } else if (isBoolean(show)) {
        isShow.value = show;
        if (!isShow.value) return;
      }

      // 3. 动态计算组件属性
      // 3. Dynamically compute component props
      if (isFunction(componentProps)) {
        dynamicComponentProps.value = await componentProps(formValues, formApi);
      }

      // 4. 动态计算验证规则
      // 4. Dynamically compute validation rules
      if (isFunction(rules)) {
        dynamicRules.value = await rules(formValues, formApi);
      }

      // 5. 判断是否禁用
      // 5. Check if disabled
      if (isFunction(disabled)) {
        isDisabled.value = !!(await disabled(formValues, formApi));
      } else if (isBoolean(disabled)) {
        isDisabled.value = disabled;
      }

      // 6. 判断是否必填
      // 6. Check if required
      if (isFunction(required)) {
        isRequired.value = !!(await required(formValues, formApi));
      }

      // 7. 执行自定义触发器
      // 7. Execute custom trigger
      if (isFunction(trigger)) {
        await trigger(formValues, formApi);
      }
    },
    { deep: true, immediate: true },
  );

  return {
    dynamicComponentProps,
    dynamicRules,
    isDisabled,
    isIf,
    isRequired,
    isShow,
  };
}
