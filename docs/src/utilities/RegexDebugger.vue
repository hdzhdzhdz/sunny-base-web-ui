<template>
  <div class="regex-debugger p-5 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] my-4">
    <div class="mb-4">
      <h3 class="text-lg font-bold mb-2 !mt-0">正则调试器</h3>
      <p class="text-sm text-[var(--vp-c-text-2)] mb-0">选择一个预设规则，输入内容测试效果。Input 会自动应用过滤规则。</p>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <label class="w-20 font-medium text-sm">选择规则:</label>
        <a-select v-model="selectedKey" placeholder="请选择规则" allow-search class="flex-1">
          <a-option v-for="(val, key) in patterns" :key="key" :value="key">
            {{ patternNames[key] ? `${key} (${patternNames[key]})` : key }}
          </a-option>
        </a-select>
      </div>

      <div class="flex items-center gap-4" v-if="selectedKey">
        <label class="w-20 font-medium text-sm">测试输入:</label>
        <Input
          v-model="testValue"
          :rule="selectedKey"
          :placeholder="currentPattern?.placeholder || '尝试输入...'"
          class="flex-1"
          allow-clear
        />
      </div>

      <div v-if="selectedKey && currentPattern" class="mt-2 p-4 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)]">
        <div class="grid grid-cols-[70px_1fr] gap-y-2 text-sm">
          <div class="text-[var(--vp-c-text-2)]">正则:</div>
          <div class="font-mono text-blue-600 dark:text-blue-400 break-all select-all">
            {{ currentPattern.pattern.toString() }}
          </div>
          
          <div class="text-[var(--vp-c-text-2)]">提示:</div>
          <div>{{ currentPattern.message }}</div>
          
          <div class="text-[var(--vp-c-text-2)]">过滤:</div>
          <div :class="currentPattern.filter ? 'text-green-600 dark:text-green-400' : 'text-[var(--vp-c-text-3)]'">
            {{ currentPattern.filter ? '✅ 已启用输入过滤 (不符合规则的字符将被自动移除)' : '❌ 无过滤 (仅验证)' }}
          </div>

           <div class="text-[var(--vp-c-text-2)]">当前值:</div>
          <div class="font-mono">{{ testValue }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { patterns } from '@sunny-base-web/utils';

const selectedKey = ref<string | undefined>(undefined);
const testValue = ref('');

const patternNames: Record<string, string> = {
  nonEmpty: '非空字符串',
  letters: '仅字母（大小写）',
  alphanumeric: '字母+数字',
  username: '用户名',
  internationalPhone: '国际电话',
  idCard15: '身份证号 (15位)',
  percentage: '百分比',
  passwordStrong: '强密码',
  passwordMedium: '中等强度密码',
  time: '时间',
  phone: '手机号',
  email: '电子邮件',
  idCard: '身份证号 (18位)',
  creditCode: '统一社会信用代码',
  postalCode: '邮政编码',
  chinese: '中文字符',
  integer: '整数',
  positiveInteger: '正整数',
  float2: '浮点数 (最多两位小数)',
  url: 'URL 网址',
  passwordSimple: '简单密码',
  ipv4: 'IPv4 地址',
  ipv4Port: 'IPv4+端口',
  htmlTags: 'HTML 标签',
  emoji: 'Emoji 表情',
  landline: '座机号码',
  bankCard: '银行卡号',
  passport: '中国护照',
  licensePlate: '车牌号',
  qq: 'QQ 号码',
  wechat: '微信号',
  english: '纯英文字符',
  number: '纯数字',
  money: '金额',
  date: '日期',
  hexColor: '16进制颜色',
  macAddress: 'MAC 地址',
  ipv6: 'IPv6 地址'
};

const currentPattern = computed(() => {
  if (!selectedKey.value) return null;
  return patterns[selectedKey.value as keyof typeof patterns];
});

watch(selectedKey, () => {
  testValue.value = '';
});
</script>

<style scoped>
.regex-debugger :deep(.arco-select-view-single) {
  background-color: var(--vp-c-bg);
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}
.regex-debugger :deep(.arco-select-view-single:hover) {
  border-color: var(--vp-c-brand);
}
</style>
