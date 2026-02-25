<script setup lang="ts">
import { computed, onMounted, reactive, useSlots, watch } from 'vue';
import { useForm } from 'vee-validate';
import { injectFormProps } from '../use-form-context';
import FormField from './FormField.vue';
import FormActions from '../components/form-actions.vue';
import type { FormApi } from '../form-api';
import { provideFormRenderProps, provideFieldSlots } from './context';
import { useResponsiveState } from './expandable';

/**
 * 组件 Props 定义
 */
const props = defineProps<{
  /**
   * 表单 API 实例
   * 用于暴露表单内部方法给外部使用，以及接收外部的状态更新
   */
  formApi?: FormApi;
  /**
   * VeeValidate 表单实例
   * 如果通过 useSunnyForm Hook 传入，则使用该实例
   * 否则在组件内部创建新的实例
   */
  form?: any;
}>();

// 获取传入的 slots，用于透传给 FormActions 和 FormField
const slots = useSlots();

// 注入上层提供的表单配置 (来自 SunnyUseForm 或 SunnyForm)
const formProps = injectFormProps();

/**
 * 创建响应式的渲染属性状态
 *
 * 为什么需要这一步？
 * 1. inject 得到的是一个 Ref，直接透传可能导致引用的响应性丢失或难以追踪。
 * 2. 我们需要一个稳定的 reactive 对象来 provide 给下层组件。
 * 3. 组件内部可能需要修改某些状态 (如 collapsed)，reactive 对象更方便管理。
 */
const renderPropsState = reactive({ ...formProps.value });

// 监听上层配置变化，并同步到本地渲染状态
watch(
  () => formProps.value,
  (newVal) => {
    Object.assign(renderPropsState, newVal);
  },
  { deep: true } // 深度监听，确保对象内部属性变化也能捕获
);

// 向下层组件 (如 FormField, dependencies) 提供最新的表单渲染配置
provideFormRenderProps(renderPropsState as any);

// 向下层组件提供 slots，用于字段级别的自定义渲染
provideFieldSlots(slots);

// 使用响应式 Hook 计算栅格布局的 span (跨度)
// 处理响应式布局逻辑，根据屏幕宽度自动计算每个字段占用的列数
const { spans, actionSpan } = useResponsiveState(renderPropsState as any);

/**
 * 计算最终的表单 Schema
 * 
 * 核心逻辑：
 * 1. 合并全局通用配置 (Common Config)
 * 2. 处理每个字段的特定配置
 * 3. 注入通用属性 (Common Props)
 */
const computedSchema = computed(() => {
  const { 
    commonConfig = {}, 
    labelWidth, 
    schema = [] 
  } = renderPropsState;
  
  // 1. 配置解构与分离
  // 从 commonConfig 中提取出组件通用属性 (componentProps) 和表单项通用属性 (formFieldProps)
  // 剩余的属性 (restConfig) 将作为所有表单项的基础配置
  const {
    componentProps: commonComponentProps = {},
    formFieldProps: commonFormFieldProps = {},
    ...restConfig
  } = commonConfig;

  // 2. 构建全局基础配置
  // 如果 props 中传递了 labelWidth，它的优先级高于 commonConfig 中的设置
  const globalConfig = { ...restConfig };
  if (labelWidth !== undefined) {
    Object.assign(globalConfig, { labelWidth });
  }

  // 3. 遍历并处理每个表单项
  return schema.map((item) => {
    return {
      // 合并策略：全局配置 (Global) < 表单项自身配置 (Item)
      ...globalConfig,
      ...item,

      // 显隐逻辑：只处理 Item 自身配置的 hide 属性
      // (v-if/v-show 的动态逻辑由 dependencies.ts 处理)
      hidden: item.hide,

      // 注入通用组件属性 
      // 注意：这里只是透传，最终合并逻辑在 FormField 组件内部进行
      commonComponentProps,

      // 合并表单项容器属性 (Wrapper Props)
      // 直接在此处合并全局配置和局部配置，减少下层组件的计算负担
      formFieldProps: {
        ...commonFormFieldProps,
        ...(item.formFieldProps || {}),
      },

      // 显式保留组件原本的 props，防止在合并过程中被意外覆盖
      componentProps: item.componentProps,
    };
  });
});

// 判断是否为行内布局
const isInline = computed(() => renderPropsState.layout === 'inline');

/**
 * 初始化 VeeValidate 表单核心
 * 
 * 模式区分：
 * 1. Hook 模式 (强烈推荐): 外部传入 props.form。状态由 useSunnyForm 管理，跨组件共享更方便。
 * 2. 组件模式: 内部创建 useForm。适用于简单场景。
 */
const { handleSubmit, resetForm, setValues, values, validate, errors, meta } = props.form || useForm({
  // 提取默认值构建初始状态
  initialValues: computedSchema.value.reduce((acc, item) => {
    if (item.fieldName) {
      acc[item.fieldName] = item.defaultValue;
    }
    return acc;
  }, {} as Record<string, any>),
});

/**
 * 组件挂载时的逻辑
 * 
 * 核心任务：将表单内部的方法 (validate, submit 等) 挂载到 formApi 上，
 * 使得父组件可以通过 formApi.submitForm() 等方式控制表单。
 */
onMounted(() => {
  if (props.formApi) {
    props.formApi.mount({
      handleSubmit,
      resetForm,
      setValues,
      values,
      validate,
      errors,
      meta,
    } as any);
  }
});

/**
 * 表单提交处理函数
 */
const onSubmit = handleSubmit((values: Record<string, any>) => {
  // 优先执行配置中的 handleSubmit 回调
  if (renderPropsState.handleSubmit) {
    renderPropsState.handleSubmit(values);
  } else {
    // 默认行为：打印日志 (开发环境调试用)
    console.log('Form submitted:', values);
  }
});

/**
 * 处理折叠状态更新
 * 
 * 触发场景：用户点击操作栏的“展开/收起”按钮
 * @param val 新的折叠状态 (true: 收起, false: 展开)
 */
const handleCollapsedUpdate = (val: boolean) => {
  // 1. 更新本地响应式状态
  renderPropsState.collapsed = val;
  
  // 2. 触发外部回调 (如果有)
  renderPropsState.handleCollapsedChange?.(val);
  
  // 3. 同步状态到 FormApi (保持状态一致性)
  if (props.formApi) {
    props.formApi.setState({ collapsed: val });
  }
};

/**
 * 计算最终的 Grid Gap
 * 优先级: gridProps配置 > compact模式默认值 > 普通模式默认值
 */
const computedGap = computed(() => {
  const { compact, gridProps } = renderPropsState;
  const defaultGap = compact ? 8 : 16;
  
  // 兼容 xGap/x-gap 两种写法
  const xGap = gridProps?.xGap ?? gridProps?.['x-gap'] ?? defaultGap;
  const yGap = gridProps?.yGap ?? gridProps?.['y-gap'] ?? defaultGap;
  
  // console.log('[SunnyForm Debug] computedGap:', { xGap, yGap, gridProps });
  
  return { x: xGap, y: yGap };
});
</script>

<template>
  <!-- Arco Design Form 组件作为最外层容器 -->
  <a-form
    :model="{}" 
    :layout="formProps.layout || 'horizontal'"
    :size="formProps.size || 'small'"
    class="arco-form"
    @submit="(_data: any, ev: any) => onSubmit(ev)"
  >
    <!-- 
      核心布局容器：使用 a-row 和 a-col 替代 a-grid
      a-row 的 gutter 能更稳健地处理左右(xGap)和上下(yGap)间距，且不会撑破布局。
    -->
    <a-row
      :gutter="[computedGap.x, computedGap.y]"
      :class="renderPropsState.wrapperClass"
      :align="(renderPropsState.layout || 'horizontal') === 'vertical' ? 'stretch' : undefined"
    >
      <template v-for="(item, index) in computedSchema" :key="item.fieldName || index">
        <a-col
          v-if="item.fieldName && !item.hidden && (!renderPropsState.collapsed || index < (24 / (spans[item.fieldName] ?? 24)) * (renderPropsState.collapsedRows ?? 1) - 1)"
          :span="spans[item.fieldName] ?? (isInline ? undefined : 24)"
        >
          <FormField :schema="item" />
        </a-col>
      </template>
      
      <!-- 操作栏区域 -->

      <a-col
        v-if="renderPropsState.showDefaultActions || slots['actions']"
        :span="actionSpan"
        :style="isInline ? { marginLeft: '16px' } : { flex: 1, textAlign: 'right' }"
      >
        <div class="h-full flex flex-col justify-end">
          <!-- 自定义操作栏插槽：完全替换默认操作栏 -->
          <slot v-if="slots['actions']" name="actions" :collapsed="renderPropsState.collapsed" :form-api="props.formApi"></slot>
          <!-- 默认操作栏 -->
          <FormActions
            v-else
            :model-value="renderPropsState.collapsed"
            @update:model-value="handleCollapsedUpdate"
            :form-api="props.formApi"
          >
            <!-- 透传 slots 给 FormActions -->
            <template v-if="slots['submit-before']" #submit-before>
              <slot name="submit-before"></slot>
            </template>
            <template v-if="slots['reset-before']" #reset-before>
              <slot name="reset-before"></slot>
            </template>
            <template v-if="slots['expand-before']" #expand-before>
              <slot name="expand-before"></slot>
            </template>
            <template v-if="slots['expand-after']" #expand-after>
              <slot name="expand-after"></slot>
            </template>
          </FormActions>
        </div>
      </a-col>
    </a-row>
  </a-form>
</template>
