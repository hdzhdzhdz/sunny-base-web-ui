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
    <p class="text-sm text-gray-500">将包含二维码的图片拖拽到下方区域即可识别。</p>
    <SunnyQrcodeReader
      mode="drop-zone"
      @detect="onDetect"
      @error="onError"
    >
      <template #drop-zone>
        <div class="flex h-[200px] w-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-blue-400 hover:bg-blue-50">
          <span>将图片拖拽到此处</span>
        </div>
      </template>
    </SunnyQrcodeReader>
    <div v-if="lastResult" class="text-sm">
      <span class="text-gray-500">识别结果：</span>
      <span class="font-mono text-blue-600">{{ lastResult }}</span>
    </div>
  </div>
</template>
