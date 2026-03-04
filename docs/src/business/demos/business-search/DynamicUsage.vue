<script setup lang="ts">
import { ref } from 'vue';
import { SunnyBusinessSearch } from '@sunny-base-web/ui';
import { Input } from '@arco-design/web-vue';

const value = ref([]);
const cNum = ref('INNER_WORK_OPT');
</script>

<template>
  <div class="space-y-4">
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">C-Num (配置编码)</label>
      <Input v-model="cNum" placeholder="请输入配置编码" />
    </div>

    <SunnyBusinessSearch
      v-model="value"
      :c-num="cNum"
      :modalProps = "{
          multiple: true,
          fieldNames: {
            label: 'LASTNAME',
            value: 'WORKCODE'
          }
        }"
      placeholder="请选择 (动态配置)"
    />

    <div class="mt-4 text-gray-500 text-sm">
      <p>当前值: {{ value }}</p>
      <p>注：此示例会请求 /core/assDialog/openInit，已配置代理转发至测试环境。</p>
    </div>
  </div>
</template>
