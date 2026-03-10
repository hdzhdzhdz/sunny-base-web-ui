<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, useSlots, watch } from 'vue';
import { VxeGrid } from 'vxe-table';
import type { VxeGridProps, VxeGridListeners, VxeGridInstance } from 'vxe-table';
import 'vxe-table/lib/style.css';
import { Modal, Popover } from '@arco-design/web-vue';
import { useForm } from 'vee-validate';
import { injectFormProps } from '../use-form-context';
import FormField from './FormField.vue';
import FormActions from '../components/form-actions.vue';
import type { FormApi } from '../form-api';
import { provideFormRenderProps, provideFieldSlots } from './context';
import { useResponsiveState } from './expandable';
import { Maximize2, Minimize2 } from 'lucide-vue-next';

// 添加最大化状态控制
const isMaximized = ref(false);

// 切换全屏/还原
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value;
};

// 初始化时重置全屏状态
isMaximized.value = false;

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

const emit = defineEmits<{
  (e: 'submit', values: Record<string, any>): void;
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

// 监听 formProps 变化，同步到 renderPropsState
watch(
  () => formProps.value,
  (newProps) => {
    Object.assign(renderPropsState, newProps);
  },
  { deep: true }
);

// 字段设置相关
const fieldSettingsVisible = ref(false);
const fieldList = ref<any[]>([]);

// 初始化字段列表
const initFieldList = () => {
  const formId = renderPropsState.id;
  let storedFieldList = null;
  
  // 如果有 formId，尝试从 localStorage 读取存储的字段设置
  if (formId) {
    try {
      const storedData = localStorage.getItem(`form-field-settings-${formId}`);
      if (storedData) {
        storedFieldList = JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Failed to read field settings from localStorage:', error);
    }
  }
  
  if (storedFieldList) {
    // 使用存储的字段设置
    fieldList.value = storedFieldList;
  } else {
    // 生成默认字段列表
    fieldList.value = computedSchema.value.map((field, index) => ({
      id: field.fieldName || index,
      fieldName: field.fieldName,
      label: field.label,
      required: field.rules === 'required' || false,
      visible: true,
      sort: index
    }));
  }
};

// 应用字段设置到表单
const applyFieldSettings = () => {
  const formId = renderPropsState.id;
  if (!formId || !renderPropsState.schema) return;
  
  try {
    const storedData = localStorage.getItem(`form-field-settings-${formId}`);
    if (storedData) {
      const storedFieldList = JSON.parse(storedData);

      
      // 检查存储的字段列表是否有效
      if (!Array.isArray(storedFieldList) || storedFieldList.length === 0) {
        return;
      }
      
      // 创建字段设置映射
      const fieldSettingsMap = new Map(storedFieldList.map(item => [item.fieldName, item]));
      
      // 构建新的schema，包含所有原始字段，同时应用存储的设置
      const newSchema = renderPropsState.schema
        .map(field => {
          const settings = fieldSettingsMap.get(field.fieldName);
          if (settings) {
            return {
              ...field,
              hidden: !settings.visible
            };
          }
          return field;
        });
      
      // 按存储的顺序排序
      const fieldOrder = storedFieldList.map(item => item.fieldName);
      newSchema.sort((a, b) => {
        const aIndex = fieldOrder.indexOf(a.fieldName);
        const bIndex = fieldOrder.indexOf(b.fieldName);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
      
      // 检查新的schema是否有效
      if (newSchema.length === 0) {
        return;
      }
      

      // 检查新的schema是否与当前的schema相同，避免死循环
      const isSchemaSame = JSON.stringify(newSchema) === JSON.stringify(renderPropsState.schema);
      if (!isSchemaSame) {
        if (props.formApi) {
          props.formApi.setState({ schema: newSchema });
        } else {
          renderPropsState.schema = newSchema;
        }
      }
    }
  } catch (error) {
    console.error('Failed to apply field settings from localStorage:', error);
  }
};

// 监听上层配置变化，并同步到本地渲染状态
watch(
  () => formProps.value,
  (newVal) => {
    Object.assign(renderPropsState, newVal);
    // 当配置变化时，重新应用字段设置
    applyFieldSettings();
  },
  { deep: true, immediate: true } // 深度监听，确保对象内部属性变化也能捕获，并且立即执行一次
);

// 向下层组件 (如 FormField, dependencies) 提供最新的表单渲染配置
provideFormRenderProps(renderPropsState as any);

// 向下层组件提供 slots，用于字段级别的自定义渲染
provideFieldSlots(slots);

// 使用响应式 Hook 计算栅格布局的 span (跨度)
// 处理响应式布局逻辑，根据屏幕宽度自动计算每个字段占用的列数
const { spans, actionSpan } = useResponsiveState((renderPropsState || {}) as any);

// 字段设置 grid 配置
const fieldSettingsGridOptions = reactive<VxeGridProps<any>>({
  id: 'field-settings-grid',
  border: true,
  size: 'mini',
  height: 400,
  columnConfig: {
    resizable: true
  },
  pagerConfig: {
    enabled: false
  },
  rowConfig: {
    drag: true,
    keyField: 'id'
  },
  toolbarConfig: {
    enabled: false
  },
  editConfig: {
    trigger: 'click',
    mode: 'cell',
    showAsterisk: true,
    activeMethod: ({ row, column }) => {
      if (column.field === 'visible' && row.required) {
        return false;
      }
      return true;
    }
  },
  data: [],
  columns: [
    {
      type: 'seq',
      width: 60,
      title: '序号'
    },
    {
      field: 'label',
      title: '字段标题',
      minWidth: 200,
      sortable: true,
      sortBy: 'sort',
      dragSort: true
    },
    {
      field: 'visible',
      title: '是否显示',
      width: 120,
      editRender: {
        name: 'VxeSelect',
        props: {
          options: [
            { label: '是', value: true },
            { label: '否', value: false }
          ]
        }
      },
      formatter: ({ cellValue }) => {
        return cellValue ? '是' : '否';
      }
    }
  ]
});

// 字段设置 grid 事件
const fieldSettingsGridEvents: VxeGridListeners = {
  cellClick: ({ row, column }) => {
    // 当字段为必填时，禁止编辑是否显示列
    if (column.field === 'visible' && (row as any).required) {
      return false;
    }
  },
  rowDragend: () => {
    if (fieldSettingsGridRef.value) {
      fieldSettingsGridOptions.data = fieldSettingsGridRef.value.getFullData();
    }
  }
};

// 字段设置表格引用
const fieldSettingsGridRef = ref<VxeGridInstance>();

// 打开字段设置弹窗
const openFieldSettings = () => {
  initFieldList();
  fieldSettingsGridOptions.data = fieldList.value;
  fieldSettingsVisible.value = true;
};

// 关闭字段设置弹窗
const closeFieldSettings = () => {
  fieldSettingsVisible.value = false;
};

// 保存字段设置
const saveFieldSettings = () => {
  // 从表格数据获取排序后的字段列表
  const $grid = fieldSettingsGridRef.value;
  let sortedFields = fieldSettingsGridOptions.data || [];
  
  if ($grid) {
    sortedFields = $grid.getFullData();
  }
  
  // 如果有 formId，将字段设置存储到 localStorage
  const formId = renderPropsState.id;
  if (formId) {
    try {
      localStorage.setItem(`form-field-settings-${formId}`, JSON.stringify(sortedFields));
    } catch (error) {
      console.error('Failed to save field settings to localStorage:', error);
    }
  }
  
  // 根据新顺序重新构建 schema
  if (renderPropsState.schema) {
    const schemaMap = new Map(renderPropsState.schema.map(item => [item.fieldName, item]));
    const newSchema = sortedFields
      .map(item => {
        const field = schemaMap.get(item.fieldName);
        if (field) {
          // 创建新的字段对象，而不是修改原有的只读对象
          return {
            ...field,
            hidden: !item.visible
          };
        }
        return field;
      })
      .filter((item): item is typeof item => item !== undefined) as typeof renderPropsState.schema; // 过滤掉可能不存在的字段（安全处理）
    // 触发 schema 更新
    if (props.formApi) {
      props.formApi.setState({ schema: newSchema });
    } else {
      // 或者直接修改 renderPropsState（谨慎使用，可能破坏单向数据流）
      renderPropsState.schema = newSchema;
    }
  }
  fieldSettingsVisible.value = false;
};

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
  } = renderPropsState || {};
  

  
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
  const processedSchema = schema
    .filter(item => item && typeof item === 'object' && item.fieldName) // 过滤掉无效项和没有 fieldName 的项
    .map((item) => {
      return {
        // 合并策略：全局配置 (Global) < 表单项自身配置 (Item)
        ...globalConfig,
        ...item,

        // 显隐逻辑：只处理 Item 自身配置的 hidden 属性
        // (v-if/v-show 的动态逻辑由 dependencies.ts 处理)
        hidden: item.hidden,

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
  

  return processedSchema;
});

// 判断是否为行内布局
const isInline = computed(() => (renderPropsState || {}).layout === 'inline');

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
 * 暴露表单方法给父组件
 */
defineExpose({
  /**
   * 验证表单
   * @returns Promise<{ valid: boolean; errors: Record<string, string> }>
   */
  validate: async () => {
    const result = await validate();
    return {
      valid: result.valid,
      errors: errors.value,
    };
  },
  /**
   * 获取 handleSubmit 方法（用于外部触发表单提交）
   */
  handleSubmit,
  /**
   * 获取全屏状态
   */
  getIsMaximized: () => isMaximized.value,
  /**
   * 监听全屏状态变化
   */
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    return watch(isMaximized, callback);
  },
});

/**
 * 组件挂载时的逻辑
 * 
 * 核心任务：将表单内部的方法 (validate, submit 等) 挂载到 formApi 上，
 * 使得父组件可以通过 formApi.submitForm() 等方式控制表单。
 */
onMounted(() => {
  // 每次挂载时重置全屏状态
  isMaximized.value = false;
  
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

onUnmounted(() => {
  // 组件卸载时重置全屏状态
  isMaximized.value = false;
});

/**
 * 表单提交处理函数
 */
const onSubmit = (ev: Event) => {
  ev.preventDefault();
  handleSubmit((values: Record<string, any>) => {
    // 发射 submit 事件，传递表单值给父组件
    emit('submit', values);

    // 优先执行配置中的 handleSubmit 回调
    if (renderPropsState && typeof renderPropsState.handleSubmit === 'function') {
      renderPropsState.handleSubmit(values);
    }
  })();
};

/**
 * 处理折叠状态更新
 * 
 * 触发场景：用户点击操作栏的“展开/收起”按钮
 * @param val 新的折叠状态 (true: 收起, false: 展开)
 */
const handleCollapsedUpdate = (val: boolean) => {
  // 1. 更新本地响应式状态
  if (renderPropsState) {
    renderPropsState.collapsed = val;
    
    // 2. 触发外部回调 (如果有)
    renderPropsState.handleCollapsedChange?.(val);
  }
  
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
  const { compact, gridProps } = renderPropsState || {};
  const defaultGap = compact ? 8 : 16;
  
  // 兼容 xGap/x-gap 两种写法
  const xGap = gridProps?.xGap ?? gridProps?.['x-gap'] ?? defaultGap;
  const yGap = gridProps?.yGap ?? gridProps?.['y-gap'] ?? defaultGap;
  
  // console.log('[SunnyForm Debug] computedGap:', { xGap, yGap, gridProps });
  
  return { x: xGap, y: yGap };
});
</script>

<template>
  <!-- 外层容器添加鼠标事件监听 -->
<div 
  :class="[
    'flex flex-col w-full relative group',
    (renderPropsState?.useFieldSettings !== false) ? 'hover:outline-1 hover:outline-dashed hover:outline-[rgb(var(--primary-6))] hover:rounded-lg' : '',
    isMaximized ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''
  ]"
  :style="{
    position: isMaximized ? 'fixed' : 'relative',
    top: isMaximized ? '0' : 'auto',
    left: isMaximized ? '0' : 'auto',
    width: isMaximized ? '100vw' : '100%',
    height: isMaximized ? '100vh' : 'auto',
    zIndex: isMaximized ? '1000' : 'auto',
    margin: isMaximized ? '0' : '0'
  }"
>
    <!-- 控制按钮组：绝对定位，仅在悬停时显示 -->
  <div 
    v-if="(renderPropsState?.useFieldSettings !== false)"
    :class="[isMaximized ? '' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200']"
    style="display: flex; gap: 8px; position: absolute; top: 0; right: 0; z-index: 100;"
  >
      <!-- 全屏/还原按钮 -->
      <button 
        style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: white; border: 1px solid #d9d9d9; cursor: pointer;"
        :title="isMaximized ? '还原' : '全屏'"
        type="button"
        @click="toggleMaximize"
      >
        <i v-if="!isMaximized" class="vxe-button--item vxe-button--prefix-icon vxe-table-icon-fullscreen"></i>
        <i v-else class="vxe-button--item vxe-button--prefix-icon vxe-table-icon-minimize"></i>
      </button>
      
      <!-- 字段设置按钮 -->
      <button 
        style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: white; border: 1px solid #d9d9d9; cursor: pointer;"
        title="字段设置"
        type="button"
        @click="openFieldSettings"
      >
        <i class="vxe-button--item vxe-button--prefix-icon vxe-table-icon-custom-column"></i>
      </button>
    </div>

    <!-- 其余表单内容保持不变 -->
    <div class="w-full">
      <a-form
  :model="{}" 
  :layout="(formProps?.value?.layout || 'horizontal')"
  :size="(formProps?.value?.size || 'small')"
  class="arco-form"
  @submit="onSubmit"
>
        <!-- 
          核心布局容器：使用 a-row 和 a-col 替代 a-grid
          a-row 的 gutter 能更稳健地处理左右(xGap)和上下(yGap)间距，且不会撑破布局。
        -->
        <a-row
  :gutter="[computedGap.x, computedGap.y]"
  :class="(renderPropsState || {}).wrapperClass"
  :align="((renderPropsState || {}).layout || 'horizontal') === 'vertical' ? 'stretch' : undefined"
>
          <a-col
  v-for="(item, index) in computedSchema" 
  :key="item.fieldName || index"
  :span="(spans && item.fieldName ? spans[item.fieldName] : undefined) ?? (isInline ? undefined : 24)"
>
  <FormField v-if="item && !item.hidden && (!((renderPropsState || {}).collapsed) || index < (24 / ((spans && item.fieldName ? spans[item.fieldName] : 24) ?? 24)) * (((renderPropsState || {}).collapsedRows) ?? 1) - 1)" :schema="item" />
</a-col>
          
          <!-- 操作栏区域 -->

          <a-col
  v-if="((renderPropsState || {}).showDefaultActions) || slots['actions']"
  :span="actionSpan"
  :style="isInline ? { marginLeft: '16px' } : { flex: 1, textAlign: 'right' }"
>
  <div class="h-full flex flex-col justify-end">
    <!-- 自定义操作栏插槽：完全替换默认操作栏 -->
    <slot v-if="slots['actions']" name="actions" :collapsed="(renderPropsState || {}).collapsed" :form-api="props.formApi"></slot>
    <!-- 默认操作栏 -->
    <FormActions
  v-else
  :model-value="(renderPropsState || {}).collapsed"
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
    </div>
    
    <!-- 字段设置弹窗 -->
    <Modal
      v-model:visible="fieldSettingsVisible"
      title="字段设置"
      width="600px"
    >
      <div class="p-4">
        <vxe-grid
          ref="fieldSettingsGridRef"
          v-bind="fieldSettingsGridOptions"
          v-on="fieldSettingsGridEvents"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 border border-[var(--color-border-2)] rounded bg-white text-sm transition-colors hover:border-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))]"
            @click="closeFieldSettings"
          >
            取消
          </button>
          <button
            class="px-4 py-2 bg-[rgb(var(--primary-6))] border border-[rgb(var(--primary-6))] text-white text-sm rounded hover:bg-[rgb(var(--primary-7))] transition-colors"
            @click="saveFieldSettings"
          >
            保存
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>


