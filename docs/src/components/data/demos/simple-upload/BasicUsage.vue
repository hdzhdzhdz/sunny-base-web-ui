<script setup lang="ts">
import { SunnySimpleUpload } from '@sunny-base-web/ui'
import { ref } from 'vue'

const fileList = ref('')
const action = ref('https://basetest.pcloud.sunnyoptical.cn/base/test/upload/commonFileUpload')
const delAction = ref('https://basetest.pcloud.sunnyoptical.cn/base/test/upload/commonFileDelete')

const handleChange = (val: string) => {
  console.log('File list updated:', val)
}
</script>

<template>
  <div class="p-4 border rounded-lg">
    <div class="flex items-center mb-3">
      action：<a-input v-model="action" />
    </div>
    <div class="flex items-center mb-3">
      delAction：<a-input v-model="delAction" />
    </div>
    <SunnySimpleUpload
      v-model="fileList"
      :action="action"
      :delAction="delAction"
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
