<template>
  <Login @login="handleLogin" />
</template>

<script setup lang="ts">
import { Login } from '@sunny-base-web/effects';
import { Notification } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogin = (data: any) => {
  Notification.success({
    title: '登录成功',
    content: '欢迎回来',
  });
  router.push('/');
};
</script>
