<script setup lang="ts">
import { useKunkkaForm } from '@kunkka/ui';
import { Message } from '@arco-design/web-vue';

const [Form] = useKunkkaForm({
  // 操作按钮位置
  actionPosition: 'right', // 'left' | 'center' | 'right'
  // 操作按钮布局
  actionLayout: 'inline', // 'inline' | 'newLine' | 'rowEnd'
  // 操作栏栅格配置
  actionColProps: {
    span: 8,
  },
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
    Message.success('Search: ' + JSON.stringify(values));
  },
  handleReset: () => {
    Message.info('Reset triggered');
  },
});
</script>

<template>
  <Form />
</template>
