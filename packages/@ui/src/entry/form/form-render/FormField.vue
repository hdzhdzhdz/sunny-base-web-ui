<script setup lang="ts">
// 引入 Vue 的响应式 API 和工具函数
import { computed, nextTick, watch, toRaw, defineComponent, type VNode, type PropType } from 'vue';
// 引入 VeeValidate 的核心组件和 hook
import { Field, useFormValues } from 'vee-validate';
// 引入 Zod 适配器，用于将 Zod Schema 转换为 VeeValidate 规则
import { toTypedSchema } from '@vee-validate/zod';
// 引入 Zod 类型定义
import type { ZodType } from 'zod';
// 引入自定义工具函数
import { isFunction, isString } from '@sunny-base-web/utils';
// 引入组件映射表
import { COMPONENT_MAP } from '../config';
// ✅ 引入全局表单配置对象
import { DEFAULT_FORM_COMMON_CONFIG } from '../config';
// 引入表单 Schema 类型定义
import type { FormSchema } from '../types';
// 引入表单上下文注入函数
import { injectRenderFormProps, useFormContext, injectFieldSlots } from './context';
// 引入依赖处理 Hook
import useDependencies from './dependencies';

// 定义组件 Props
const props = defineProps<{
  schema: FormSchema; // 表单项的 Schema 配置
}>();

// 获取当前表单的所有值 (VeeValidate)
const values = useFormValues();
// 注入渲染属性
const formRenderProps = injectRenderFormProps();
// ✅ 从全局配置读取 disabled
const globalDisabled = computed(() => {
  return DEFAULT_FORM_COMMON_CONFIG.disabled ?? false;
});
// 获取表单上下文 (如布局方向)
const { isVertical } = useFormContext();
// 获取 FormApi 实例
const formApi = formRenderProps.form;
// 获取字段级别的 slots
const fieldSlots = injectFieldSlots();

// 处理字段间的依赖关系 (显示/隐藏/禁用/必填等)
const {
  dynamicComponentProps, // 动态组件属性
  dynamicRules,          // 动态验证规则
  isDisabled,            // 是否禁用
  isIf,                  // 是否渲染 (v-if)
  isRequired,            // 是否必填
  isShow,                // 是否显示 (v-show)
} = useDependencies(() => props.schema.dependencies);

// 解析实际渲染的组件
const component = computed(() => {
  const { component } = props.schema;
  // 如果是字符串，从映射表中查找对应组件；否则直接使用
  if (isString(component)) {
    return COMPONENT_MAP[component] || component;
  }
  return component;
});

/**
 * 检查是否使用插槽渲染
 * - component === 'Slot': 使用 fieldName 作为插槽名
 */
const isSlotMode = computed(() => {
  const { component } = props.schema;
  return component === 'Slot';
});

// 检查是否有字段级别的 slot
const hasFieldSlot = computed(() => {
  if (!isSlotMode.value || !fieldSlots) return false;
  const slotName = props.schema.fieldName;
  return slotName ? !!fieldSlots[slotName] : false;
});

// 渲染 slot 内容的函数
const renderFieldSlot = (field: any, errorMessage: string | undefined): VNode | VNode[] | null => {
  const slotName = props.schema.fieldName;
  if (!slotName || !fieldSlots || !fieldSlots[slotName]) return null;

  const slotFn = fieldSlots[slotName];

  // 提供更新字段值的函数
  const setValue = (newValue: any) => {
    field.onInput(newValue);
  };

  const slotProps = {
    // 整个表单的值 (支持双向绑定)
    model: values.value,
    // 当前字段的值
    value: field.value,
    // 更新字段值的函数
    setValue,
    // 是否禁用
    disabled: shouldDisabled.value,
    // 验证错误信息
    errorMessage,
    // 原始 field 对象 (包含 onInput, onChange 等)
    field,
    // 组件属性
    componentProps: computedProps.value,
  };

  return slotFn(slotProps);
};

// 字段插槽渲染器组件 - 用于在模板中渲染字段级别的插槽
const FieldSlotRenderer = defineComponent({
  name: 'FieldSlotRenderer',
  props: {
    field: { type: Object as PropType<any>, required: true },
    errorMessage: { type: String as PropType<string | undefined>, default: undefined }
  },
  setup(props) {
    return () => renderFieldSlot(props.field, props.errorMessage);
  }
});

// 计算字段的可见性
const visible = computed(() => {
  // 如果 Schema 中明确指定隐藏，则直接返回 false
  if ((props.schema as any).hidden) return false;
  // 结合依赖关系中的 isIf 和 isShow
  return isIf.value && isShow.value;
});

// 计算当前的验证规则
const currentRules = computed(() => {
  // 优先使用依赖计算出的动态规则，否则使用 Schema 中的规则
  return dynamicRules.value || props.schema.rules;
});

// 计算是否必填 (用于控制 UI 上的星号显示)
const shouldRequired = computed(() => {
  // 如果字段不可见，则不必填
  if (!visible.value) {
    return false;
  }

  // 如果没有规则，回退到依赖中的 isRequired 状态
  if (!currentRules.value) {
    return isRequired.value;
  }

  // 如果依赖中明确要求必填
  if (isRequired.value) {
    return true;
  }

  // 如果规则是字符串简写 (如 'required')
  if (isString(currentRules.value)) {
    // 处理组合规则 (如 'required|phone')
    return currentRules.value.split('|').includes('required');
  }

  // 处理 Zod Schema 的情况
  const rules = toRaw(currentRules.value);
  // 尝试检查 Zod 的 isOptional 方法
  let isOptional = (rules as any)?.isOptional?.();

  // 特殊处理 ZodDefault (有默认值的情况)
  const typeName = (rules as any)?._def?.typeName;
  if (typeName === 'ZodDefault') {
    const innerType = (rules as any)?._def.innerType;
    if (innerType) {
      isOptional = innerType.isOptional?.();
    }
  }

  // 如果不是可选的，那就是必填的
  return !isOptional;
});

// 计算最终传给 VeeValidate Field 的规则
const fieldRules = computed(() => {
  // 如果不可见，不应用规则
  if (!visible.value) {
    return null;
  }

  let rules = toRaw(currentRules.value);
  // 如果没有规则，根据是否必填生成默认 required 规则
  if (!rules) {
    return isRequired.value ? 'required' : undefined;
  }

  // 如果是字符串规则，直接返回

  if (isString(rules)) {
    return rules;
  }

  // 如果 UI 上显示非必填，但规则本身可能是必填的 Zod Schema
  // 我们尝试解包 Zod Effect (如 refine) 来获取原始 Schema 判断
  const isOptional = !shouldRequired.value;
  if (!isOptional) {
    const unwrappedRules = (rules as any)?.unwrap?.();
    if (unwrappedRules) {
      rules = unwrappedRules;
    }
  }
  // 将 Zod Schema 转换为 VeeValidate 可用的 TypedSchema
  return toTypedSchema(rules as ZodType);
});

// 计算传递给输入组件的 Props
const computedProps = computed(() => {
  // 解构通用组件属性和特定组件属性
  const { componentProps, commonComponentProps } = props.schema;
  // 如果 componentProps 是函数，执行它获取结果
  const finalComponentProps = isFunction(componentProps)
    ? componentProps(values.value, formApi!)
    : componentProps;

  // 合并属性：通用 < 特定 < 动态依赖
  return {
    ...commonComponentProps,
    ...finalComponentProps,
    ...dynamicComponentProps.value,
  };
});

/**
 * 合并用户事件处理器和 vee-validate 的 field 事件
 * 确保两者都能被触发
 */
const createMergedFieldProps = (field: any) => {
  const userProps = computedProps.value;

  // 合并事件处理器
  const mergeEvent = (userHandler: Function | undefined, fieldHandler: Function) => {
    return (...args: any[]) => {
      // 先触发用户的处理器
      if (isFunction(userHandler)) {
        userHandler(...args);
      }
      // 再触发 vee-validate 的处理器（更新表单值）
      fieldHandler(...args);
    };
  };

  // 创建更新值的函数，同时触发用户事件
  const handleUpdateModelValue = (val: any) => {
    // 触发用户的 onInput
    if (isFunction(userProps?.onInput)) {
      userProps.onInput(val);
    }
    // 触发 vee-validate 更新
    field.onInput(val);
  };

  return {
    ...userProps,
    // 合并 onInput 事件
    onInput: mergeEvent(userProps?.onInput as Function, field.onInput),
    // 合并 onChange 事件
    onChange: mergeEvent(userProps?.onChange as Function, field.onChange),
    // model-value 绑定
    modelValue: field.value,
    // update:modelValue 事件
    'onUpdate:modelValue': handleUpdateModelValue,
  };
};

// 监听自动聚焦属性
watch(
  () => computedProps.value?.autofocus,
  (value) => {
    if (value === true) {
      nextTick(() => {
        // TODO: 如果需要手动聚焦逻辑可以在这里实现
        // 目前主要依赖组件自身的 autofocus 属性
      });
    }
  },
  { immediate: true },
);

// 计算禁用状态
const shouldDisabled = computed(() => {
  // ✅ 五层优先级：依赖 > Schema > Props > 表单级 > 全局
  return (
    isDisabled.value ||                      // 1. 依赖禁用（最高优先级）
    props.schema.disabled ||                 // 2. Schema 禁用
    computedProps.value?.disabled ||         // 3. Props 禁用
    props.schema.formDisabled ||             // 4. 表单级禁用（来自 commonConfig.disabled）
    globalDisabled.value                     // 5. 全局禁用（来自 FormCommonConfig.disabled）
  );
});

// 计算 Wrapper (控件容器) 的布局属性
const wrapperColProps = computed(() => {
  // 1. 如果是垂直布局，或者是水平布局但没有指定 labelWidth，则不强制样式
  // 让 Arco 自行处理布局
  if (isVertical.value || !props.schema.labelWidth) {
    return undefined;
  }
  // 2. 只有在指定了固定 labelWidth 的水平布局下，才需要手动计算 flex
  // 保证控件占据剩余空间
  return {
    style: {
      flex: 1,
    }
  };
});

// 计算 Label (标签) 的布局属性
const labelColProps = computed(() => {
  // 1. 垂直布局或无 labelWidth 时，返回 undefined，使用 Arco 默认行为
  if (isVertical.value || !props.schema.labelWidth) {
    return undefined;
  }
  // 2. 处理固定 labelWidth 的情况 (兼容旧模式)
  const val = props.schema.labelWidth;
  const width = typeof val === 'number' ? `${val}px` : val;
  
  // 使用 flex 布局固定宽度
  return {
    style: {
      width: width,
      minWidth: width,
      maxWidth: width,
      flex: `0 0 ${width}`,
    }
  };
});

</script>

<template>
  <Field
    v-if="visible && schema.fieldName"
    :name="schema.fieldName"
    :rules="(fieldRules as any)"
    :label="schema.label"
    v-slot="{ field, errorMessage }"
  >

    <a-form-item
      :label="schema.label"
      :help="errorMessage || schema.help"
      :validate-status="errorMessage ? 'error' : undefined"
      :required="shouldRequired"
      :label-col-props="labelColProps"
      :wrapper-col-props="wrapperColProps"
      v-bind="schema.formFieldProps"
    >
      <!-- 使用 slot 渲染字段 -->
      <component
        v-if="hasFieldSlot"
        :is="FieldSlotRenderer"
        :field="field"
        :error-message="errorMessage"
      />

      <!-- 默认使用 component 渲染 -->
      <component
        v-else
        :is="component"
        v-bind="createMergedFieldProps(field)"
        :disabled="shouldDisabled"
      />
    </a-form-item>
  </Field>
</template>
