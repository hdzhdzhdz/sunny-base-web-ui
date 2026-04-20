<script setup lang="ts">
import { ref } from 'vue';
import { SunnyQrcodeReader } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';
import type { DetectedBarcode } from '@sunny-base-web/ui';

const lastResult = ref('');

function onDetect(barcodes: DetectedBarcode[]) {
  if (barcodes.length > 0) {
    lastResult.value = barcodes[0].rawValue;
    Message.success(`识别结果: ${lastResult.value}`);
  }
}

function onError(error: Error) {
  Message.error(`识别错误: ${error.message}`);
}

function trackFn(barcodes: DetectedBarcode[], ctx: CanvasRenderingContext2D) {
  for (const barcode of barcodes) {
    const {
      boundingBox: { x, y, width, height },
    } = barcode;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#e74c3c';
    ctx.strokeRect(x, y, width, height);
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-500">通过 track 属性自定义识别结果的高亮样式（红色边框）。</p>
    <div class="w-[400px] overflow-hidden rounded-lg border">
      <SunnyQrcodeReader
        mode="stream"
        :track="trackFn"
        @detect="onDetect"
        @error="onError"
      />
    </div>
    <div v-if="lastResult" class="text-sm">
      <span class="text-gray-500">识别结果：</span>
      <span class="font-mono text-blue-600">{{ lastResult }}</span>
    </div>
  </div>
</template>
