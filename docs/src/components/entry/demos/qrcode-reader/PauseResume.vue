<script setup lang="ts">
import { ref } from 'vue';
import { SunnyQrcodeReader } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';

const paused = ref(false);
const lastResult = ref('');

function onDetect(barcodes: any[]) {
  if (barcodes.length > 0) {
    lastResult.value = barcodes[0].rawValue;
    Message.success(`识别结果: ${lastResult.value}`);
    paused.value = true;
    setTimeout(() => {
      paused.value = false;
    }, 2000);
  }
}

function onError(error: Error) {
  Message.error(`识别错误: ${error.message}`);
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-500">识别到二维码后自动暂停 2 秒，然后恢复扫描。</p>
    <a-button type="primary" @click="paused = !paused">
      {{ paused ? '恢复扫描' : '暂停扫描' }}
    </a-button>
    <div class="w-[400px] overflow-hidden rounded-lg border">
      <SunnyQrcodeReader
        mode="stream"
        :paused="paused"
        @detect="onDetect"
        @error="onError"
      />
    </div>
    <div v-if="lastResult" class="text-sm">
      <span class="text-gray-500">识别结果：</span>
      <span class="font-mono text-blue-600">{{ lastResult }}</span>
    </div>
    <div class="text-sm text-gray-400">
      当前状态：{{ paused ? '已暂停' : '扫描中' }}
    </div>
  </div>
</template>
