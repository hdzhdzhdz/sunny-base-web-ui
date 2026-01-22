<template>
  <div class="space-y-4 p-4 border rounded">
    <div class="space-y-2">
      <div class="font-bold">1. 基础用法 (无提示)</div>
      <kunkka-input v-model="val1" placeholder="普通输入框" />
    </div>

    <div class="space-y-2">
      <div class="font-bold">2. 使用预设规则 (Phone)</div>
      <kunkka-input 
        v-model="val2" 
        rule="phone" 
        placeholder="请输入手机号" 
      />
    </div>

    <div class="space-y-2">
      <div class="font-bold">3. 使用预设规则 (Email) + 自定义提示</div>
      <kunkka-input 
        v-model="val3" 
        rule="email" 
        tip="我们不会发送垃圾邮件，仅用于通知"
        placeholder="请输入邮箱" 
      />
    </div>

    <div class="space-y-2">
      <div class="font-bold">4. 自定义正则</div>
      <kunkka-input 
        v-model="val4" 
        :regex="/^[A-Z]{3}$/" 
        tip="请输入3个大写字母"
        placeholder="例如: ABC" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const val1 = ref('');
const val2 = ref('');
const val3 = ref('');
const val4 = ref('');
</script>
