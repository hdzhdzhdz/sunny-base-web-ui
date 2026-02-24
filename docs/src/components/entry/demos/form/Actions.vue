<script setup lang="ts">
import { ref } from 'vue';
import { useSunnyForm } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';

// 控制面板状态
const hideAll = ref(false);
const hideSubmit = ref(false);
const hideReset = ref(false);

// 注意：需要解构出 formApi 来动态更新配置
const [Form, formApi] = useSunnyForm({
  // 操作按钮位置
  actionPosition: 'right',
  // 提交按钮配置
  submitButtonOptions: {
    status: 'warning',
    content: '搜索',
  },
  // 重置按钮配置
  resetButtonOptions: {
    content: '清空',
  },

  schema: [
    { fieldName: 'keyword', label: '关键词', component: 'Input' },
    { fieldName: 'status', label: '状态', component: 'Select' },
  ],
  handleSubmit: (values) => {
    Message.success('搜索: ' + JSON.stringify(values));
  },
  handleReset: () => {
    Message.info('重置触发');
  },
});

// 动态更新配置的函数
function updateFormConfig() {
  formApi.setState({
    showDefaultActions: !hideAll.value,
    submitButtonOptions: {
      status: 'warning',
      content: '搜索',
      show: !hideSubmit.value,
    },
    resetButtonOptions: {
      content: '清空',
      show: !hideReset.value,
    },
  });
}

function handleHideAllChange(val: boolean) {
  hideAll.value = val;
  if (val) {
    hideSubmit.value = true;
    hideReset.value = true;
  }
  updateFormConfig();
}

function handleHideSubmitChange(val: boolean) {
  hideSubmit.value = val;
  hideAll.value = false;
  updateFormConfig();
}

function handleHideResetChange(val: boolean) {
  hideReset.value = val;
  hideAll.value = false;
  updateFormConfig();
}
</script>

<template>
  <div class="space-y-4">
    <!-- 控制面板 -->
    <div class="p-4 bg-gray-50 rounded-lg space-y-2">
      <div class="text-sm font-medium text-gray-700 mb-2">操作栏控制面板</div>
      <div class="flex flex-wrap gap-4">
        <a-checkbox :model-value="hideAll" @change="handleHideAllChange">
          隐藏整个操作栏
        </a-checkbox>
        <a-checkbox :model-value="hideSubmit" :disabled="hideAll" @change="handleHideSubmitChange">
          隐藏提交按钮
        </a-checkbox>
        <a-checkbox :model-value="hideReset" :disabled="hideAll" @change="handleHideResetChange">
          隐藏重置按钮
        </a-checkbox>
      </div>
    </div>

    <!-- 表单 -->
    <Form />
  </div>
</template>
