<script setup lang="ts">
import { computed, toRaw, unref, watch } from 'vue';
import { Button } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconDown, IconUp } from '@arco-design/web-vue/es/icon';
import { useFormContext as useVeeFormContext } from 'vee-validate';
import { useFormContext } from '../form-render/context';
import type { FormApi } from '../form-api';
import { SunnySearchPlan, SunnyIcon } from '@sunny-base-web/ui';

/**
 * 组件 Props 定义
 */
const props = defineProps<{
  /**
   * 折叠状态 (双向绑定)
   * True 表示收起，False 表示展开
   */
  modelValue?: boolean;
  /**
   * 表单 API 实例
   * 用于调用表单方法 (验证、重置、获取值等)
   */
  formApi?: FormApi;
  /**
   * 查询方案相关配置
   */
  searchPlanConfig?: {
    /**
     * 是否启用查询方案
     */
    enable?: boolean;
    /**
     * 表单配置
     */
    formConfig?: any[];
    /**
     * 当前选中的查询方案
     */
    currentSearchPlan?: any;
    /**
     * 查询方案列表
     */
    searchPlanList?: any[];
    /**
     * 资源ID
     */
    resourceId?: string;
    /**
     * 资源编号
     */
    nResourceid?: number;
    /**
     * 查询方案API
     */
    api?: any;
    /**
     * 搜索回调
     */
    onSearch?: (values: any) => void;
    /**
     * 默认查询方案加载完成回调
     */
    onDefaultPlanLoaded?: (values: any) => void;
  };
}>();

/**
 * 事件定义
 */
const emit = defineEmits(['update:modelValue', 'reset', 'submit']);

// 获取注入的表单全局配置
// 这里的 rootProps 包含了 layout, schema, showCollapseButton 等所有渲染配置
const { props: rootProps } = useFormContext()!;

// 获取 VeeValidate 表单上下文 (用于组件模式)
const veeForm = useVeeFormContext();

/**
 * 折叠状态计算属性 (支持双向绑定)
 */
const collapsed = computed({
  get: () => props.modelValue ?? false,
  set: (val) => emit('update:modelValue', val),
});

/**
 * 重置按钮配置
 * 合并默认配置和用户传入的 resetButtonOptions
 */
const resetButtonOptions = computed(() => {
  return {
    content: '重置',
    show: true,
    type: 'outline',
    ...unref(rootProps).resetButtonOptions,
  };
});

/**
 * 提交按钮配置
 * 合并默认配置和用户传入的 submitButtonOptions
 */
const submitButtonOptions = computed(() => {
  return {
    content: '查询',
    show: true,
    // 如果有 formApi，使用普通按钮类型，手动触发提交逻辑
    // 否则使用 submit 类型，利用表单的原生提交机制
    htmlType: props.formApi ? 'button' : 'submit',
    ...unref(rootProps).submitButtonOptions,
  };
});

/**
 * 处理提交事件
 * @param e 事件对象
 */
async function handleSubmit(e: Event) {
  // 1. Hook 模式 (推荐): 使用 formApi 进行验证和提交
  if (props.formApi) {
    e?.preventDefault();
    e?.stopPropagation();
    const formProps = unref(rootProps);
    
    // 执行验证
    const { valid } = await props.formApi.validate();
    if (!valid) {
      return;
    }
    
    // 获取表单值并转换为原始对象
    const values = toRaw(await props.formApi.getValues()) ?? {};
    
    // 触发用户配置的 handleSubmit 回调
    await formProps.handleSubmit?.(values);
  }
  // 2. 组件模式: 不做处理，让 type="submit" 按钮触发 a-form 的 @submit 事件
}

/**
 * 处理重置事件
 * @param e 事件对象
 */
async function handleReset(e: Event) {
  e?.preventDefault();
  e?.stopPropagation();
  const formProps = unref(rootProps);

  // 1. Hook 模式
  if (props.formApi) {
     const values = toRaw(await props.formApi.getValues()) ?? {};
     // 如果用户配置了 handleReset，则调用自定义逻辑
     if (formProps.handleReset) {
       await formProps.handleReset(values);
     } else {
       // 否则执行默认重置逻辑
       props.formApi.resetForm();
     }
  } 
  // 2. 组件模式
  else if (veeForm) {
    if (formProps.handleReset) {
       const values = veeForm.values;
       await formProps.handleReset(values);
    } else {
       veeForm.resetForm();
    }
  }
  
  emit('reset');
}

// 监听折叠状态变化，如果开启了 collapseTriggerResize，则触发布局重算
watch(
  () => collapsed.value,
  () => {
    const formProps = unref(rootProps);
    if (formProps.collapseTriggerResize) {
      window.dispatchEvent(new Event('resize'));
    }
  },
);

/**
 * 计算操作栏容器样式
 * 处理布局方向 (layout) 和 对齐方式 (actionPosition)
 */
const actionWrapperClass = computed(() => {
  const formProps = unref(rootProps);
  const actionPosition = formProps.actionPosition || 'right';

  const cls = [
    'flex',
    'items-center',
    'gap-3',
    // 垂直布局时靠右，水平布局时靠左 (默认)
    formProps.layout === 'vertical' ? 'self-end' : 'self-start',
    // 行内布局不需要宽度，其他情况占满
    formProps.layout === 'inline' ? '' : 'w-full',
    // 用户自定义类名
    formProps.actionWrapperClass,
  ];

  // 处理对齐方式
  switch (actionPosition) {
    case 'center': {
      cls.push('justify-center');
      break;
    }
    case 'left': {
      cls.push('justify-start');
      break;
    }
    default: {
      // case 'right': 默认右对齐
      cls.push('justify-end');
      break;
    }
  }

  return cls.join(' ');
});

defineExpose({
  handleReset,
  handleSubmit,
});
</script>

<template>
  <div :class="actionWrapperClass">
    <!-- 
      按钮顺序反转逻辑 
      默认: 提交在前，重置在后
      如果 actionButtonsReverse 为 true，则 重置在前，提交在后
    -->
    <template v-if="!(unref(rootProps) as any).actionButtonsReverse">
      <!-- 提交按钮前插槽 -->
      <slot name="submit-before"></slot>

      <Button
        v-if="submitButtonOptions.show"
        type="primary"
        :size="unref(rootProps).size || 'small'"
        @click="handleSubmit"
        v-bind="(submitButtonOptions as any)"
      >
        <template #icon>
          <IconSearch />
        </template>
        {{ submitButtonOptions.content }}
      </Button>
    </template>

    <!-- 重置按钮前插槽 -->
    <slot name="reset-before"></slot>

    <Button
      v-if="resetButtonOptions.show"
      :size="unref(rootProps).size"
      @click="handleReset"
      v-bind="(resetButtonOptions as any)"
    >
      <template #icon>
        <IconRefresh />
      </template>
      {{ resetButtonOptions.content }}
    </Button>

    <template v-if="(unref(rootProps) as any).actionButtonsReverse">
      <!-- 提交按钮前插槽 -->
      <slot name="submit-before"></slot>

      <Button
        v-if="submitButtonOptions.show"
        type="primary"
        :size="unref(rootProps).size || 'small'"
        @click="handleSubmit"
        v-bind="(submitButtonOptions as any)"
      >
        <template #icon>
          <IconSearch />
        </template>
        {{ submitButtonOptions.content }}
      </Button>
    </template>

    <!-- 展开按钮前插槽 -->
    <slot name="expand-before"></slot>
    
    <!-- 查询方案组件 -->
    <slot name="search-plan">
      <SunnySearchPlan
        v-if="props.searchPlanConfig?.enable"
        :form-config="props.searchPlanConfig.formConfig"
        :current-search-plan="props.searchPlanConfig.currentSearchPlan"
        :search-plan-list="props.searchPlanConfig.searchPlanList"
        :resource-id="props.searchPlanConfig.resourceId"
        :n-resourceid="props.searchPlanConfig.nResourceid"
        :api="props.searchPlanConfig.api"
        @search="props.searchPlanConfig.onSearch"
        @default-plan-loaded="props.searchPlanConfig.onDefaultPlanLoaded"
        @update:currentSearchPlan="props.searchPlanConfig?.onUpdateCurrentSearchPlan && props.searchPlanConfig.onUpdateCurrentSearchPlan($event)"
        @update:searchPlanList="props.searchPlanConfig?.onUpdateSearchPlanList && props.searchPlanConfig.onUpdateSearchPlanList($event)"
      >
        <template #trigger="{ open }">
          <button
            type="button"
            class="px-3 py-1.5 border border-[var(--color-border-2)] rounded bg-white text-sm transition-all hover:border-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))] disabled:cursor-not-allowed disabled:opacity-60 mr-2"
            @click="open"
            title="查询方案"
          >
            <SunnyIcon icon="lucide:filter" class="w-4 h-4" />
          </button>
        </template>
      </SunnySearchPlan>
    </slot>

    <!-- 展开/收起切换按钮 -->
    <div
      v-if="unref(rootProps).showCollapseButton"
      class="cursor-pointer text-[rgb(var(--primary-6))] hover:opacity-80 transition-opacity select-none flex items-center gap-0.5"
      @click="collapsed = !collapsed"
    >
      <IconDown v-if="collapsed" :size="16" />
      <IconUp v-else :size="16" />
    </div>

    <!-- 展开按钮后插槽 -->
    <slot name="expand-after"></slot>
  </div>
</template>
