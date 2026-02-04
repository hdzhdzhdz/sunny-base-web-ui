<script setup lang="ts">
/**
 * Hook Mode Form (Hook 模式表单)
 *
 * 与 KunkkaForm (组件模式) 的区别:
 * 1. 由 FormApi 驱动 (Driven by FormApi).
 * 2. 需要 `formApi` 属性 (Requires `formApi` prop).
 * 3. 适用于需要动态 Schema 更新和程序化控制的复杂表单 (Suitable for complex forms).
 * 4. 状态由 FormApi 内部的 TanStack Store 管理 (State managed by TanStack Store).
 */
import { computed, onBeforeUnmount, onMounted, nextTick, watch, toRaw } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import type { FormApi } from './form-api';
import type { KunkkaFormProps } from './types';
import { provideComponentRefMap, provideFormProps, useFormInitial } from './use-form-context';
import FormRender from './form-render/Form.vue';
import FormActions from './components/form-actions.vue';
import { cloneDeep, get, isEqual, set } from '@sunny-base-web/utils';

const props = withDefaults(defineProps<KunkkaFormProps & { formApi: FormApi }>(), {
  // 必须显式设为 undefined，防止 Vue 将未传递的 Boolean prop 默认转为 false
  // 从而导致覆盖了 formApi store 中的配置值
  // Must explicitly set to undefined to prevent Vue from defaulting missing boolean props to false,
  // which would override config values from formApi store.
  showDefaultActions: undefined,
  submitOnEnter: undefined,
  submitOnChange: undefined,
  collapsed: undefined,
  showCollapseButton: undefined,
  collapseTriggerResize: undefined,
  compact: undefined,
});

// 同步 Store 状态 (状态由 useKunkkaForm/FormApi 管理)
// formApi.useStore 由 useKunkkaForm 注入
const state = props.formApi.useStore?.() || computed(() => ({}));

// 合并属性: Store 状态 + Props
// 优先级: Props > Store 状态
const contextProps = computed(() => {
  const propsWithoutUndefined = Object.entries(props).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
  return { ...state.value, ...propsWithoutUndefined };
});

// 组件引用映射，用于获取具体组件实例
const componentRefMap = new Map<string, unknown>();

// 1. 初始化 vee-validate 表单核心 ：
//    它会根据你传入的 schema （表单配置），自动提取出所有字段的 defaultValue ，然后用这些默认值去创建一个 vee-validate 的 form 实例。
   
//    - 作用 ：确保表单一开始就有初始值，而不是空的，同时建立起验证机制。
// 2. 处理插槽转发 (delegatedSlots) ：
//    它会检查你给 KunkkaUseForm 传了哪些插槽（比如自定义字段组件、自定义按钮等），并把它们的名字收集起来。
   
//    - 作用 ：为了让外面的插槽能穿透到内部的 FormRender 组件里去。如果不做这一步，你在最外层写的插槽可能传不进去，里面就显示不出来。
// 简单总结 ：它负责把表单的“里子”（数据状态）和“面子”（插槽内容）都准备
const { delegatedSlots, form } = useFormInitial(contextProps);

// 提供 Context 给子组件
provideFormProps(contextProps);
provideComponentRefMap(componentRefMap);

onBeforeUnmount(() => {
  props.formApi.unmount();
});

const valuesCache: Record<string, any> = {};

// 挂载 API
onMounted(async () => {
  // 挂载表单实例到 FormApi
  // 注意：这里我们传入 form 实例的方法，以便 FormApi 可以调用 (如 validate, submitForm 等)
  // 同时传入 componentRefMap，以便 FormApi 可以获取具体的组件实例 (getFieldComponentRef)
  props.formApi.mount(form as any, componentRefMap);
  
  // 立即同步一次初始值 (Immediate sync of initial values)
  props.formApi.setState({ values: cloneDeep(form.values) });
  
  await nextTick();
  
  // 监听表单值变化
  // form.values 是响应式的
  watch(
    () => form.values,
    async (newVal) => {
      // 0. 同步值到 Store (Sync values to Store)
      props.formApi.setState({ values: cloneDeep(newVal) });

      // 1. 总是执行防抖提交 (如果配置了 submitOnChange)
      handleValuesChangeDebounced();

      // 2. 如果没有配置 handleValuesChange 回调，直接跳过后续复杂的 Diff 逻辑
      // 注意：handleValuesChange 是【表单级】的全局变化事件 (Global Form Change Event)。
      // 它与组件自身的 @change (Component Change Event) 不同：
      // - 组件级 @change: 仅当前组件触发，只关注当前组件的值。
      // - 表单级 handleValuesChange: 任何一个字段变化都会触发，关注整个表单的数据联动。
      if (!contextProps.value.handleValuesChange) return;

      // 3. 获取所有定义的字段名
      const fields = contextProps.value.schema?.map((item) => item.fieldName) || [];
      if (fields.length === 0) return;

      // 4. 计算变更字段 (Diff)
      const changedFields: string[] = [];
      for (const field of fields) {
        const newFieldValue = get(newVal, field);
        const oldFieldValue = get(valuesCache, field);
        
        if (!isEqual(newFieldValue, oldFieldValue)) {
          changedFields.push(field);
          // 更新缓存
          set(valuesCache, field, newFieldValue);
        }
      }

      // 5. 如果有字段发生变化，触发回调
      if (changedFields.length > 0) {
        // 获取最新的完整表单值 (深拷贝以避免引用问题)
        const values = await props.formApi.getValues();
        contextProps.value.handleValuesChange(
          cloneDeep(values ?? {}) as Record<string, any>,
          changedFields,
        );
      }
    },
    { deep: true }
  );
});

// 防抖处理值变化提交
const handleValuesChangeDebounced = useDebounceFn(async () => {
  if (state.value.submitOnChange) {
    await props.formApi.submitForm();
  }
}, 300);

// 处理折叠状态更新
const handleUpdateCollapsed = (value: boolean) => {
  props.formApi.setState({ collapsed: value });
  contextProps.value.handleCollapsedChange?.(value);
};

// 处理回车提交
function handleKeyDownEnter(event: KeyboardEvent) {
  if (!state.value.submitOnEnter) {
    return;
  }
  // 如果是多行文本框，不阻止默认行为 (允许换行)
  if (event.target instanceof HTMLTextAreaElement) {
    return;
  }
  event.preventDefault();
  props.formApi.submitForm();
}

</script>

<template>
  <div :class="contextProps.wrapperClass">
    <FormRender 
      v-bind="contextProps"
      :form="form"
      :form-api="props.formApi" 
      @keydown.enter="handleKeyDownEnter"
    >
      <!-- 转发插槽到 FormRender (如果 FormRender 支持动态插槽) -->
      <template v-for="slotName in delegatedSlots" :key="slotName" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>

      <!-- 
        Default actions are now handled inside FormRender (Form.vue) 
        using a-grid-item suffix, so we don't need to manually render FormActions here
        unless we want to override the default placement completely.
        
        However, to support slots injection into the internal FormActions, 
        we might need to keep passing slots through FormRender.
      -->
      <template #default>
        <!-- 
           This slot is intentionally left empty as FormActions is now integrated 
           inside FormRender's grid layout.
           
           If we need to pass slots to the internal FormActions, FormRender needs to expose them.
        -->
      </template>
    </FormRender>
  </div>
</template>
