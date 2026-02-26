<template>
  <div class="sunny-search-plan">
    <slot name="trigger" :open="customHandleOpen" :disabled="disabled">
      <button
        class="sunny-search-plan-trigger"
        :disabled="disabled"
        @click="customHandleOpen"
      >
        查询方案
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
      <div class="sunny-search-plan-content">
        <!-- 加载遮罩 -->
        <div v-if="props.loading" class="sunny-search-plan-loading">
          <div class="sunny-search-plan-loading-spinner"></div>
          <div class="sunny-search-plan-loading-text">加载中...</div>
        </div>
        
        <div class="sunny-search-plan-main" :class="{ 'sunny-search-plan-main-loading': props.loading }">
          <!-- 左侧表单区域 -->
          <div class="sunny-search-plan-form">
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
          <div class="sunny-search-plan-view">
            <h3>新建查询方案</h3>

            <div class="sunny-search-plan-create">
              <div class="sunny-search-plan-form-item">
                <label>查询方案名称</label>
                <input
                  v-model="inputValue"
                  type="text"
                  placeholder="请输入"
                  class="sunny-search-plan-input"
                  :disabled="props.loading"
                />
                <div v-if="!inputValue.trim() && showNameError" class="sunny-search-plan-error">
                  请输入查询方案名称
                </div>
              </div>
              <div class="sunny-search-plan-actions">
                <button
                  class="sunny-search-plan-btn sunny-search-plan-btn-primary"
                  @click="handleAdd"
                  :disabled="props.loading"
                >
                  新增
                </button>
                <button
                  class="sunny-search-plan-btn sunny-search-plan-btn-danger"
                  :disabled="!currentSearchPlan || props.loading"
                  @click="handleUpdate"
                >
                  覆盖
                </button>
              </div>
            </div>

            <div class="sunny-search-plan-divider"></div>

            <h3>已保存的查询方案</h3>

            <div class="sunny-search-plan-list">
              <div
                v-for="(plan, index) in searchPlanList"
                :key="plan.ID"
                class="sunny-search-plan-item"
                :class="{ 'active': currentSearchPlan?.ID === plan.ID }"
                @click="handleSelect(plan)"
                :style="{ cursor: props.loading ? 'not-allowed' : 'pointer' }"
              >
                <div
                  class="sunny-search-plan-item-index"
                  :class="{ 'active': currentSearchPlan?.ID === plan.ID }"
                >
                  {{ String(index + 1).padStart(2, '0') }}
                </div>
                <div class="sunny-search-plan-item-name">{{ plan.CSEARCHPLANNAME }}</div>
                <button
                  class="sunny-search-plan-item-delete"
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
        <div class="sunny-search-plan-footer">
          <button
            class="sunny-search-plan-btn"
            @click="handleReset"
            :disabled="props.loading"
          >
            重置
          </button>
          <button
            class="sunny-search-plan-btn sunny-search-plan-btn-primary"
            @click="handleSearch"
            :disabled="props.loading"
          >
            查询
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
import { useSunnySearchPlan } from './use-sunny-search-plan';
import type { SunnySearchPlanProps, SunnySearchPlanEmits } from './types';

defineOptions({
  name: 'SunnySearchPlan',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SunnySearchPlanProps>(), {
  disabled: false,
  modalProps: () => ({}),
  formProps: () => ({}),
  formConfig: () => [],
  model: () => ({}),
  modelValue: () => ({}),
  title: '查询方案',
  width: 900,
  searchPlanList: () => [],
  loading: false,
});

const emit = defineEmits<SunnySearchPlanEmits & {
  (e: 'update:model', value: Record<string, any>): void;
  (e: 'update:modelValue', value: Record<string, any>): void;
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
  handleOpen
} = useSunnySearchPlan(props, emit, localModel, formApi);

// 自定义 handleOpen 函数，确保打开弹窗时清空表单数据和清除查询方案选中状态
const customHandleOpen = async () => {
  // 调用原始的 handleOpen 函数，清空表单数据
  await handleOpen();
  // 清除查询方案选中状态
  if (props.currentSearchPlan) {
    // 触发一个事件，通知父组件清除选中状态
    emit('update:currentSearchPlan', undefined);
  }
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

const formConfig = computed(() => props.formConfig);
const searchPlanList = computed(() => props.searchPlanList);
const currentSearchPlan = computed(() => props.currentSearchPlan);
const disabled = computed(() => props.disabled);
const formProps = computed(() => props.formProps);
const title = computed(() => props.title);
const width = computed(() => props.width);
</script>

<style scoped>
.sunny-search-plan {
  display: inline-block;
}

.sunny-search-plan-trigger {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.sunny-search-plan-trigger:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.sunny-search-plan-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.sunny-search-plan-content {
  padding: 20px;
  position: relative;
}

.sunny-search-plan-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 4px;
}

.sunny-search-plan-loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.sunny-search-plan-loading-text {
  font-size: 14px;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sunny-search-plan-main-loading {
  opacity: 0.6;
}

.sunny-search-plan-main {
  display: flex;
  gap: 20px;
}

.sunny-search-plan-form {
  flex: 1;
  min-width: 0;
}

.sunny-search-plan-view {
  width: 240px;
}

.sunny-search-plan-view h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
}

.sunny-search-plan-create {
  margin-bottom: 20px;
}

.sunny-search-plan-form-item {
  margin-bottom: 12px;
}

.sunny-search-plan-form-item label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.sunny-search-plan-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
}

.sunny-search-plan-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.sunny-search-plan-error {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 4px;
  line-height: 1;
}

.sunny-search-plan-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.sunny-search-plan-btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.sunny-search-plan-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.sunny-search-plan-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  border-color: #d9d9d9;
  color: #999;
}

.sunny-search-plan-btn:disabled:hover {
  border-color: #d9d9d9;
  color: #999;
}

.sunny-search-plan-btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.sunny-search-plan-btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.sunny-search-plan-btn-danger {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.sunny-search-plan-btn-danger:hover:not(:disabled) {
  background-color: #fff2f0;
}

.sunny-search-plan-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 20px 0;
}

.sunny-search-plan-list {
  max-height: 166px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 8px;
}

.sunny-search-plan-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.sunny-search-plan-item:hover {
  background-color: #f5f5f5;
}

.sunny-search-plan-item.active {
  background-color: #e6f7ff;
}

.sunny-search-plan-item-index {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  background-color: #f0f0f0;
  color: #666;
}

.sunny-search-plan-item.active .sunny-search-plan-item-index {
  background-color: #1890ff;
  color: #fff;
}

.sunny-search-plan-item-name {
  flex: 1;
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sunny-search-plan-item-delete {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  transition: color 0.3s;
  border-radius: 2px;
}

.sunny-search-plan-item-delete:hover {
  color: #ff4d4f;
  background-color: #fff2f0;
}

.sunny-search-plan-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .sunny-search-plan-main {
    flex-direction: column;
  }

  .sunny-search-plan-view {
    width: 100%;
    margin-top: 20px;
  }
}
</style>
