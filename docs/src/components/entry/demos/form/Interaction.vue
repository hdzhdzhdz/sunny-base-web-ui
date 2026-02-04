<script setup lang="ts">
import { useKunkkaForm } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';

const [Form] = useKunkkaForm({
  // 开启回车提交
  submitOnEnter: true,
  // 开启变更自动提交
  submitOnChange: true,
  
  schema: [
    { 
      fieldName: 'auto_submit', 
      label: '自动提交', 
      component: 'Select',
      componentProps: {
        placeholder: '选择即提交',
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ]
      }
    },
    { 
      fieldName: 'enter_submit', 
      label: '回车提交', 
      component: 'Input',
      componentProps: {
        placeholder: '输入后回车'
      }
    },
  ],
  // 值变化回调
  handleValuesChange: (values, changedFields) => {
    console.log('Values changed:', values, changedFields);
  },
  handleSubmit: (values) => {
    Message.success('提交触发: ' + JSON.stringify(values));
  },
});
</script>

<template>
  <Form />
</template>
