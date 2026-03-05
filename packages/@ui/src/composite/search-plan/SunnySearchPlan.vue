<template>
  <div class="inline-block">
    <slot name="trigger" :open="customHandleOpen" :disabled="disabled">
      <button
        class="px-3 py-1.5 border border-[var(--color-border-2)] rounded bg-white text-sm transition-all hover:border-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="disabled"
        @click="customHandleOpen"
      >
        {{ $t('common.searchPlan.title') }}
      </button>
    </slot>

    <Modal
      v-model:visible="visible"
      :title="title"
      :width="width"
      :top="'50px'"
      :close-on-click-modal="false"
      v-bind="modalProps"
      @cancel="handleClose"
      @close="handleClose"
    >
      <div class="p-5 relative">
        <!-- 加载遮罩 -->
        <div v-if="props.loading" class="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 rounded">
          <div class="w-7 h-7 border-3 border-[var(--color-border-2)] border-t-[rgb(var(--primary-6))] rounded-full animate-spin mb-2.5"></div>
          <div class="text-sm text-[var(--color-text-2)]">{{ $t('common.searchPlan.loading') }}</div>
        </div>
        
        <div :class="{ 'opacity-60': props.loading }" class="flex gap-5">
          <!-- 左侧表单区域 -->
          <div class="flex-1 min-w-0">
            <SunnyUseForm
              :form-api="formApi"
              :schema="formConfig"
              :show-default-actions="false"
              :show-message="false"
              v-bind="formProps"
              @mounted="onFormMounted"
            />
          </div>

          <!-- 右侧查询方案管理区域 -->
          <div class="w-60">
            <h3 class="text-sm font-semibold mb-4 text-[var(--color-text-1)]">{{ $t('common.searchPlan.newPlan') }}</h3>

            <div class="mb-5">
              <div class="mb-3">
                <label class="block text-xs text-[var(--color-text-2)] mb-1">{{ $t('common.searchPlan.planName') }}</label>
                <input
                  v-model="inputValue"
                  type="text"
                  :placeholder="$t('common.searchPlan.planNamePlaceholder')"
                  class="w-full px-2 py-1.5 border border-[var(--color-border-2)] rounded text-xs focus:outline-none focus:border-[rgb(var(--primary-6))] focus:ring-2 focus:ring-[rgb(var(--primary-1))]"
                  :disabled="props.loading"
                />
                <div v-if="!inputValue.trim() && showNameError" class="text-xs text-red-500 mt-1">
                  {{ $t('common.searchPlan.planNameRequired') }}
                </div>
              </div>
              <div class="flex gap-2 mt-3">
                <button
                  class="px-3 py-1 bg-[rgb(var(--primary-6))] border border-[rgb(var(--primary-6))] text-white text-xs rounded hover:bg-[rgb(var(--primary-7))] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  @click="handleAdd"
                  :disabled="props.loading"
                >
                  {{ $t('common.searchPlan.add') }}
                </button>
                <button
                  class="px-3 py-1 border border-[var(--color-border-2)] text-[var(--color-text-1)] text-xs rounded hover:bg-[var(--color-fill-1)] hover:border-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="!currentSearchPlan || props.loading"
                  @click="handleUpdate"
                >
                  {{ $t('common.searchPlan.update') }}
                </button>
              </div>
            </div>

            <div class="h-px bg-[var(--color-border-2)] my-5"></div>

            <h3 class="text-sm font-semibold mb-4 text-[var(--color-text-1)]">{{ $t('common.searchPlan.savedPlans') }}</h3>

            <div class="max-h-44 overflow-y-auto border border-[var(--color-border-2)] rounded p-2">
              <div
                v-for="(plan, index) in searchPlanList"
                :key="plan.ID"
                class="flex items-center p-2 mb-1 rounded cursor-pointer transition-all hover:bg-[var(--color-fill-1)] border border-transparent"
                :class="{ 'bg-[rgb(var(--primary-1))] border-[rgb(var(--primary-6))]': currentSearchPlan && (currentSearchPlan.ID == plan.ID || currentSearchPlan.ID === plan.ID) }"
                @click="handleSelect(plan)"
                :style="{ cursor: props.loading ? 'not-allowed' : 'pointer' }"
              >
                <div
                  class="w-5 h-5 flex items-center justify-center rounded text-xs mr-2 text-[var(--color-text-2)]"
                  :class="currentSearchPlan && (currentSearchPlan.ID == plan.ID || currentSearchPlan.ID === plan.ID) ? 'bg-[rgb(var(--primary-6))] text-white' : 'bg-[var(--color-fill-2)]'"
                >
                  {{ String(index + 1).padStart(2, '0') }}
                </div>
                <div class="flex-1 text-xs truncate" :class="currentSearchPlan && (currentSearchPlan.ID == plan.ID || currentSearchPlan.ID === plan.ID) ? 'text-[rgb(var(--primary-6))] font-medium' : 'text-[var(--color-text-1)]'">
                  {{ plan.CSEARCHPLANNAME }}
                </div>
                <button
                  class="w-4 h-4 flex items-center justify-center border-none bg-transparent cursor-pointer text-sm text-[var(--color-text-3)] transition-colors rounded hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                  @click.stop="handleDelete(plan)"
                  :disabled="props.loading"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮区域 -->
      <template #footer>
        <div class="flex justify-end gap-3 pt-5 border-t border-[var(--color-border-2)]">
          <button
            class="px-3 py-1.5 border border-[var(--color-border-2)] rounded bg-white text-sm transition-colors hover:border-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))] disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleReset"
            :disabled="props.loading"
          >
            {{ $t('common.searchPlan.reset') }}
          </button>
          <button
            class="px-3 py-1.5 bg-[rgb(var(--primary-6))] border border-[rgb(var(--primary-6))] text-white text-sm rounded hover:bg-[rgb(var(--primary-7))] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleSearch"
            :disabled="props.loading"
          >
            {{ $t('common.searchPlan.search') }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { SunnyUseForm, useSunnyForm } from '../../entry/form';
import { Modal } from '../../feedback/modal';
// @ts-ignore
import { Message } from '@arco-design/web-vue';
import { useSunnySearchPlan } from './use-sunny-search-plan';
import type { SunnySearchPlanProps, SunnySearchPlanEmits, SearchPlanItem } from './types';
import type { SearchPlanApi } from './api';
import { defaultSearchPlanApi } from './api';
import { $t } from '@sunny-base-web/locales';

defineOptions({
  name: 'SunnySearchPlan',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SunnySearchPlanProps & {
  /**
   * 查询方案API实现
   */
  api?: SearchPlanApi;
}>(), {
  disabled: false,
  modalProps: () => ({}),
  formProps: () => ({}),
  formConfig: () => [],
  model: () => ({}),
  modelValue: () => ({}),
  title: () => $t('common.searchPlan.title'),
  width: 900,
  searchPlanList: () => [],
  loading: false,
  api: () => defaultSearchPlanApi,
});

const emit = defineEmits<SunnySearchPlanEmits & {
  (e: 'update:model', value: Record<string, any>): void;
  (e: 'update:modelValue', value: Record<string, any>): void;
  (e: 'update:currentSearchPlan', value: SearchPlanItem | undefined): void;
  (e: 'update:searchPlanList', value: SearchPlanItem[]): void;
  (e: 'error', error: any): void;
}>();

// 使用useSunnyForm hook创建表单实例
const [, formApi] = useSunnyForm({
  schema: props.formConfig,
  model: props.modelValue || props.model
});

// 本地表单模型，用于双向绑定
const localModel = ref<Record<string, any>>({ ...(props.modelValue || props.model) });

const {
  visible,
  inputValue,
  showNameError,
  handleAdd,
  handleUpdate,
  handleDelete,
  handleSelect,
  handleReset,
  handleSearch,
  handleClose,
  handleOpen,
  loadSearchPlans,
  loadDefaultSearchPlan
} = useSunnySearchPlan(props, emit, localModel, formApi, props.api);

// 组件挂载时加载查询方案列表和默认查询方案
import { onMounted } from 'vue';
onMounted(async () => {
  if (props.resourceId) {
    try {
      // 加载查询方案列表
      const plans = await loadSearchPlans(props.resourceId);
      emit('update:searchPlanList', plans);
      
      // 加载默认查询方案
      await loadDefaultSearchPlan();
    } catch (error) {
      console.error('Failed to initialize search plan:', error);
    }
  } else {
    // 即使没有resourceId，也尝试加载默认查询方案（可能使用nResourceid）
    try {
      await loadDefaultSearchPlan();
    } catch (error) {
      console.error('Failed to load default search plan:', error);
    }
  }
});

// 自定义 handleOpen 函数，确保打开弹窗时清空表单数据
const customHandleOpen = async () => {
  // 调用原始的 handleOpen 函数，清空表单数据并加载查询方案
  await handleOpen();
};

// 表单挂载完成后的处理
const onFormMounted = () => {
  console.log('SunnyUseForm mounted');
  // 表单挂载完成后，设置初始值
  if (formApi && (props.modelValue || props.model)) {
    formApi.setValues(props.modelValue || props.model).catch(err => {
      console.error('setValues error:', err);
    });
  }
};

// 监听外部model变化，同步到本地
watch(
  () => [props.model, props.modelValue],
  ([newModel, newModelValue]) => {
    const modelToUse = newModelValue || newModel;
    if (modelToUse) {
      localModel.value = { ...modelToUse };
      // 使用formApi更新表单的实际值
      if (formApi) {
        formApi.setValues(modelToUse).catch(err => {
          console.error('setValues error:', err);
        });
      }
    }
  },
  { deep: true }
);

// 监听本地model变化，同步到外部
watch(
  () => localModel.value,
  (newModel) => {
    emit('update:model', newModel);
    emit('update:modelValue', newModel);
  },
  { deep: true }
);

// 计算属性
const modalProps = computed(() => ({
  ...props.modalProps,
}));

const formConfig = computed(() => {
  // 对表单配置进行处理，将一行六列的配置改成一行三列，并添加 labelWidth: 80
  return props.formConfig.map(field => ({
    ...field,
    labelWidth: 80,
    colProps: {
      ...field.colProps,
      span: 8 // 一行三列
    }
  }));
});
const searchPlanList = computed(() => props.searchPlanList);
const currentSearchPlan = computed(() => props.currentSearchPlan);
const disabled = computed(() => props.disabled);
const formProps = computed(() => props.formProps);
const title = computed(() => props.title);
const width = computed(() => props.width);
</script>
