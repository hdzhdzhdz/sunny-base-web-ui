<script setup lang="ts">
import { ref } from 'vue';
import { SunnyQrcodeReader } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';

const lastResult = ref('');

function onDetect(barcodes: any[]) {
  if (barcodes.length > 0) {
    lastResult.value = barcodes[0].rawValue;
    Message.success(`识别结果: ${lastResult.value}`);
  }
}

function onError(error: Error) {
  Message.error(`识别错误: ${error.message}`);
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-500">选择图片文件后自动识别其中的二维码。</p>
    <SunnyQrcodeReader
      mode="capture"
      @detect="onDetect"
      @error="onError"
    />
    <div v-if="lastResult" class="text-sm">
      <span class="text-gray-500">识别结果：</span>
      <span class="font-mono text-blue-600">{{ lastResult }}</span>
    </div>
  </div>
</template>
