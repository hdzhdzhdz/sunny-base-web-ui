<script setup lang="ts">
import { ref } from 'vue'
import { useExportModal } from '@sunny-base-web/ui'
import { Message } from '@arco-design/web-vue'

// 导出参数
const nmodid = ref(88)
const nButtonid = ref(541)

// 初始化导出弹窗
const [exportModal, exportModalApi] = useExportModal({
  onExportSuccess: (response: any) => {
    Message.success('导出成功')
  },
  onExportError: (error: any) => {
    Message.error('导出失败')
  }
})

// 在需要导出时调用
const handleExport = async () => {

  // 打开导出弹窗并传入参数
  exportModalApi.open({
    exportUrl: '',
    nmodid: 88,
    nButtonid: 541,
    conditionMap: {}
  })
}
</script>

<template>
  <div>
    <div class="flex space-around">
      <div>
        <span>模块ID：</span>
        <a-input v-model="nmodid" />
      </div>
      <div>
        <span>按钮ID：</span>
        <a-input v-model="nButtonid" />
      </div>
    </div>
    <a-button type="primary" @click="handleExport">导出数据</a-button>

    <exportModal />
  </div>
</template>