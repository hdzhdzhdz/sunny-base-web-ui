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
import { computed } from 'vue';
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

</script>

<template>
  <div :class="props.wrapperClass">
    <FormRender @submit="onSubmit">
      <template #default>
        <FormActions
          v-if="props.showDefaultActions"
          :model-value="props.collapsed"
          @update:model-value="handleCollapsedChange"
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
