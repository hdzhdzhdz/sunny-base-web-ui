<script setup lang="ts">
import { useSunnyForm } from '@sunny-base-web/ui';
import { ref } from 'vue';

// 记录变化日志
const changeLog = ref<string[]>([]);
const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString();
  changeLog.value.unshift(`[${time}] ${msg}`);
  // 只保留最近 10 条
  if (changeLog.value.length > 10) {
    changeLog.value.pop();
  }
};

const [Form] = useSunnyForm({
  schema: [
    {
      fieldName: 'name',
      label: '名称',
      component: 'Input',
      componentProps: {
        placeholder: '输入触发 onInput',
        // 字段级别：监听单个字段
        onInput: (value: string) => {
          addLog(`字段级别 [name.onInput]: "${value}"`);
        },
      },
    },
    {
      fieldName: 'type',
      label: '类型',
      component: 'Select',
      componentProps: {
        placeholder: '选择触发 onChange',
        options: [
          { label: '类型 A', value: 'a' },
          { label: '类型 B', value: 'b' },
          { label: '类型 C', value: 'c' },
        ],
        // 字段级别：监听单个字段
        onChange: (value: string) => {
          addLog(`字段级别 [type.onChange]: "${value}"`);
        },
      },
    },
    {
      fieldName: 'enabled',
      label: '启用',
      component: 'Switch',
      defaultValue: false,
      componentProps: {
        // 字段级别：监听开关变化
        onChange: (value: boolean) => {
          addLog(`字段级别 [enabled.onChange]: ${value}`);
        },
      },
    },
  ],
  // 全局级别：监听整个表单变化
  handleValuesChange: (values, changedFields) => {
    addLog(`全局监听 [handleValuesChange]: ${JSON.stringify(changedFields)}`);
  },
  handleSubmit: (values) => {
    addLog(`提交: ${JSON.stringify(values)}`);
  },
});

// 清空日志
const clearLog = () => {
  changeLog.value = [];
};
</script>

<template>
  <div class="space-y-4">
    <!-- 表单 -->
    <Form />

    <!-- 变化日志 -->
    <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-gray-700 dark:text-gray-200">事件日志</span>
        <a-button size="small" @click="clearLog">清空</a-button>
      </div>
      <div class="space-y-1 text-sm font-mono">
        <div
          v-for="(log, index) in changeLog"
          :key="index"
          class="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
        >
          {{ log }}
        </div>
        <div v-if="changeLog.length === 0" class="text-gray-400 text-center py-4">
          暂无事件，请操作表单
        </div>
      </div>
    </div>
  </div>
</template>
