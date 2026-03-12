<script setup lang="ts">
import { ref } from 'vue'
import { ErrorBoundary } from '@sunny-base-web/ui'

// 模拟一个会抛出错误的组件
const ChildComponent = {
  setup() {
    // 在 setup 中抛出错误
    const obj: any = {}
    obj.nonexistent.property = 'test'
    return () => null
  }
}

const key = ref(0)

// 刷新组件以重新触发错误
function handleRefresh() {
  key.value++
}
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <button class="px-3 py-1.5 bg-blue-500 text-white rounded text-sm" @click="handleRefresh">
        刷新触发错误
      </button>
    </div>
    <ErrorBoundary :key="key">
      <ChildComponent />
    </ErrorBoundary>
  </div>
</template>
