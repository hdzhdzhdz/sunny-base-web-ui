<script setup lang="ts">
import { useSunnyForm } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';

const [Form] = useSunnyForm({
  layout: 'horizontal',
  compact: false,
  // 基础数据
  values: {
    username: 'Admin',
    nickname: '管理员',
  },
  schema: [
    { 
      fieldName: 'username', 
      label: '用户名', 
      component: 'Input',
      componentProps: {
        placeholder: '请输入用户名'
      }
    },
    { 
      fieldName: 'nickname', 
      label: '昵称', 
      component: 'Input',
      componentProps: {
        placeholder: '请输入昵称'
      }
    },
    { 
      fieldName: 'role', 
      label: '角色', 
      component: 'Select',
      componentProps: {
        options: [
          { label: '管理员', value: 'admin' },
          { label: '普通用户', value: 'user' },
        ]
      }
    },
  ],
  handleSubmit: (values) => {
    Message.success('提交: ' + JSON.stringify(values));
  },
});
</script>

<template>
  <Form />
</template>
