<script setup lang="ts">
import { computed } from 'vue';
import { QrcodeStream, QrcodeCapture, QrcodeDropZone } from 'vue-qrcode-reader';
import type { SunnyQrcodeReaderProps, DetectedBarcode } from './types';

defineOptions({ name: 'SunnyQrcodeReader', inheritAttrs: false });

const props = withDefaults(defineProps<SunnyQrcodeReaderProps>(), {
  mode: 'stream',
  paused: false,
  torch: false,
  formats: () => ['qr_code'],
});

const emit = defineEmits<{
  detect: [barcodes: DetectedBarcode[]];
  error: [error: Error];
  'camera-on': [capabilities: MediaTrackCapabilities];
  'camera-off': [];
}>();

const isStreamMode = computed(() => props.mode === 'stream');
const isCaptureMode = computed(() => props.mode === 'capture');
const isDropZoneMode = computed(() => props.mode === 'drop-zone');

function handleDetect(barcodes: DetectedBarcode[]) {
  emit('detect', barcodes);
}

function handleError(error: Error) {
  emit('error', error);
}

function handleCameraOn(capabilities: MediaTrackCapabilities) {
  emit('camera-on', capabilities);
}

function handleCameraOff() {
  emit('camera-off');
}
</script>

<template>
  <div class="sunny-qrcode-reader" v-bind="$attrs">
    <QrcodeStream
      v-if="isStreamMode"
      :paused="paused"
      :constraints="constraints"
      :torch="torch"
      :formats="formats"
      :track="track"
      @detect="handleDetect"
      @error="handleError"
      @camera-on="handleCameraOn"
      @camera-off="handleCameraOff"
    >
      <template #default>
        <slot name="default" />
      </template>
      <template v-if="$slots.loading" #loading>
        <slot name="loading" />
      </template>
    </QrcodeStream>

    <QrcodeCapture
      v-if="isCaptureMode"
      :formats="formats"
      @detect="handleDetect"
      @error="handleError"
    />

    <QrcodeDropZone
      v-if="isDropZoneMode"
      :formats="formats"
      @detect="handleDetect"
      @error="handleError"
    >
      <template v-if="$slots['drop-zone']" #default>
        <slot name="drop-zone" />
      </template>
    </QrcodeDropZone>
  </div>
</template>
