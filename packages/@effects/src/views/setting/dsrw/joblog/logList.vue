<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Modal, Button } from '@arco-design/web-vue'
import {
  IconClose,
  IconFullscreen,
  IconToTop,
  IconToBottom
} from '@arco-design/web-vue/es/icon'
import { requestClient } from '@sunny-base-web/effects'

// Props
const props = defineProps<{
  visible: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

// 状态
const fullscreen = ref(false)
const logList = ref<string[]>([])
const logID = ref('')
const loading = ref(false)
const logboxRef = ref<HTMLElement | null>(null)

// 显示日志
const show = async (id: string) => {
  logID.value = id
  logList.value = []
  
  try {
    const response = await requestClient.post('/schedule/joblog/logDetail', {
      fromLineNum: 0,
      id: id
    })
    
    if (response.success && response.data) {
      logList.value = response.data.content?.logContentList || []
      emit('update:visible', true)
      
      nextTick(() => {
        if (logboxRef.value) {
          logboxRef.value.scrollTop = logboxRef.value.scrollHeight
        }
      })
    }
  } catch (error) {
    console.error('获取日志失败:', error)
  }
}

// 滚动到顶部
const top = () => {
  if (logboxRef.value) {
    logboxRef.value.scrollTop = 0
  }
}

// 滚动到底部并加载更多
const bottom = async () => {
  loading.value = true
  
  try {
    const response = await requestClient.post('/schedule/joblog/logDetail', {
      fromLineNum: logList.value.length + 1,
      id: logID.value
    })
    
    if (response.success && response.data) {
      const newLogs = response.data.content?.logContentList || []
      logList.value = logList.value.concat(newLogs)
      
      nextTick(() => {
        if (logboxRef.value) {
          logboxRef.value.scrollTop = logboxRef.value.scrollHeight
        }
      })
    }
  } catch (error) {
    console.error('加载更多日志失败:', error)
  } finally {
    loading.value = false
  }
}

// 关闭弹窗
const close = () => {
  emit('update:visible', false)
}

// 暴露方法给父组件
defineExpose({
  show
})
</script>

<template>
  <a-modal
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :footer="false"
    :mask-closable="false"
    :closable="false"
    :fullscreen="fullscreen"
    width="50%"
    height="100%"
    :modal-style="{
      background: '#222'
    }"
    :body-style="{
      background: '#222',
      padding: 0
    }"
    :header-style="{
      background: '#222',
      padding: 0
    }"
  >
    <div 
      ref="logboxRef" 
      class="overflow-y-auto scroll-smooth bg-[#222]" 
      :style="{ height: fullscreen ? '100vh' : '60vh' }"
    >
      <div
        v-for="(item, index) in logList"
        :key="index"
        class="bg-[#222] leading-[28px] text-xs text-[#ccc] whitespace-nowrap hover:bg-[#2b2b2b]"
      >
        <div class="bg-[#2b2b2b] inline-block text-center w-[40px] mr-2.5 select-none">{{ index + 1 }}</div>
        <div class="inline-block whitespace-nowrap mr-2.5">{{ item }}</div>
      </div>
    </div>
    
    <div class="absolute right-2.5 bottom-2.5 flex items-end flex-wrap flex-col h-[160px] justify-evenly">
      <a-button 
        type="primary" 
        status="danger" 
        shape="circle" 
        @click="close"
      >
        <template #icon>
          <icon-close />
        </template>
      </a-button>
      <a-button 
        type="primary" 
        status="danger" 
        shape="circle" 
        @click="fullscreen = !fullscreen"
      >
        <template #icon>
          <icon-fullscreen />
        </template>
      </a-button>
      <a-button 
        type="primary" 
        status="danger" 
        shape="circle" 
        @click="top"
      >
        <template #icon>
          <icon-to-top />
        </template>
      </a-button>
      <a-button 
        type="primary" 
        status="danger" 
        shape="circle" 
        :loading="loading" 
        @click="bottom"
      >
        <template #icon>
          <icon-to-bottom />
        </template>
      </a-button>
    </div>
  </a-modal>
</template>


