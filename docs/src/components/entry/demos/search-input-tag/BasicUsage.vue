<template>
  <div class="p-4 space-y-4">
    <div class="text-sm text-gray-500 mb-2">
      点击右侧搜索按钮模拟选择数据
    </div>
    
    <kunkka-search-input-tag
      v-model="selectedItems"
      :field-names="{ label: 'name', value: 'id' }"
      placeholder="请点击右侧按钮选择人员"
      style="width: 400px"
      @search="handleSearch"
    />

    <div class="bg-gray-50 p-3 rounded text-sm">
      <div class="font-bold mb-1">Model Value:</div>
      <pre>{{ selectedItems }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { KunkkaSearchInputTag } from '@kunkka/ui';
import { Message } from '@arco-design/web-vue';

// 模拟的数据结构
interface User {
  id: number;
  name: string;
  role: string;
}

const selectedItems = ref<User[]>([
  { id: 1, name: 'Admin User', role: 'admin' }
]);

const handleSearch = () => {
  Message.info('触发搜索事件，此处应打开选择弹窗');
  
  // 模拟选择后添加数据
  const nextId = selectedItems.value.length + 1;
  const newItem = {
    id: nextId,
    name: `User ${nextId}`,
    role: 'user'
  };
  
  selectedItems.value.push(newItem);
  Message.success(`已添加: ${newItem.name}`);
};
</script>
