<script setup lang="ts">
import { ref, watch } from 'vue';
import { SunnyBusinessSearch } from '@sunny-base-web/ui';
import { Input } from '@arco-design/web-vue';
import axios from 'axios';

const value = ref([]);
const cNum = ref('MACHINE_SBBH');
const token = ref('');

// 监听 Token 变化并设置到全局 axios header
watch(token, (newVal) => {
  if (newVal) {
    axios.defaults.headers.common['Authorization'] = newVal.startsWith('Bearer ') ? newVal : `Bearer ${newVal}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4 mb-4">
      <div class="flex-1">
        <label class="block text-sm font-medium mb-1">C-Num (配置编码)</label>
        <Input v-model="cNum" placeholder="请输入配置编码" />
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium mb-1">Token (Authorization)</label>
        <Input v-model="token" placeholder="请输入 Token" />
      </div>
    </div>

    <SunnyBusinessSearch
      v-model="value"
      :c-num="cNum"
      placeholder="请选择 (动态配置)"
    />
    
    <div class="mt-4 text-gray-500 text-sm">
      <p>当前值: {{ value }}</p>
      <p>注：此示例会请求 /core/assDialog/openInit，已配置代理转发至测试环境。</p>
    </div>
  </div>
</template>
