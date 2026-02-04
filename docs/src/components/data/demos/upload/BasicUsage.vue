<script setup lang="ts">
import { SunnyUpload } from '@sunny-base-web/ui'
import { ref } from 'vue'

const fileList = ref('')

const handleChange = (val: string) => {
  console.log('File list updated:', val)
}
</script>

<template>
  <div class="p-4 border rounded-lg">
    <SunnyUpload
      v-model="fileList"
      :limit="5"
      :max-size="10"
      @change="handleChange"
    />
    
    <div class="mt-4">
      <h4 class="text-sm font-bold mb-2">Model Value:</h4>
      <pre class="bg-gray-100 p-2 rounded text-xs overflow-auto">{{ fileList }}</pre>
    </div>
  </div>
</template>
