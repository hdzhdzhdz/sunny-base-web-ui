<template>
  <Login @login="handleLogin" />
</template>

<script setup lang="ts">
import { Login } from '@sunny-base-web/effects';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogin = (formData: any) => {
  console.log('Login form data received:', formData);
  // Implement actual login logic here
  // For now, just simulate success
  Message.success('登录成功 (Logic from Web App)');
  router.push('/');
};
</script>
