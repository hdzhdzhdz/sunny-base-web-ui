<script setup lang="ts">
/**
 * Component Mode Form (组件模式表单)
 *
 * Difference from SunnyUseForm (Hook Mode):
 * 1. Driven directly by props (props 驱动).
 * 2. Does NOT require `formApi` (不需要 formApi).
 * 3. Suitable for simple forms where external programmatic control is not needed (适用于不需要外部程序化控制的简单表单).
 * 4. State is managed internally or via v-model (状态内部管理或通过 v-model).
 */
import { computed, ref, useSlots } from 'vue';
import type { SunnyFormProps } from './types';
import { provideFormProps } from './use-form-context';
import FormRender from './form-render/Form.vue';
import FormActions from './components/form-actions.vue';

// Define props directly
const props = defineProps<SunnyFormProps>();

const emit = defineEmits<{
  (e: 'submit', values: any): void;
  (e: 'reset', values: any): void;
  (e: 'update:collapsed', value: boolean): void;
}>();

// 获取外部传入的 slots，用于透传给 FormRender（支持字段级别的 slot）
const slots = useSlots();

// FormRender 组件引用
const formRenderRef = ref<InstanceType<typeof FormRender> | null>(null);

// Provide context for FormRender
const contextProps = computed(() => props);

provideFormProps(contextProps);

const handleCollapsedChange = (val: boolean) => {
  emit('update:collapsed', val);
  props.handleCollapsedChange?.(val);
};

const onSubmit = (values: any) => {
  emit('submit', values);
  props.handleSubmit?.(values);
};

const onReset = () => {
  emit('reset', undefined);
};

/**
 * 暴露表单方法给父组件
 */
defineExpose({
  /**
   * 验证表单
   * @returns Promise<{ valid: boolean; errors: Record<string, string> }>
   */
  validate: async () => {
    if (!formRenderRef.value) {
      return { valid: false, errors: {} };
    }
    return formRenderRef.value.validate();
  },
  /**
   * 触发表单提交（会先进行校验）
   */
  submit: () => {
    if (formRenderRef.value?.handleSubmit) {
      formRenderRef.value.handleSubmit(onSubmit)(undefined as any);
    }
  },
});
</script>

<template>
  <div :class="props.wrapperClass">
    <FormRender ref="formRenderRef" @submit="onSubmit">
      <!-- 透传字段级别的 slots（如 form-item-fieldName） -->
      <template v-for="(_, name) in slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>

      <template #default>
        <FormActions
          v-if="props.showDefaultActions"
          :model-value="props.collapsed"
          @update:model-value="handleCollapsedChange"
          @reset="onReset"
        >
          <template #reset-before>
            <slot name="reset-before"></slot>
          </template>
          <template #submit-before>
            <slot name="submit-before"></slot>
          </template>
          <template #expand-before>
            <slot name="expand-before"></slot>
          </template>
          <template #expand-after>
             <slot name="expand-after"></slot>
          </template>
        </FormActions>
      </template>
    </FormRender>
  </div>
</template>
