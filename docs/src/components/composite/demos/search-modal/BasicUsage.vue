<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { SunnySearchModal } from '@sunny-base-web/ui';
import axios from 'axios';

const visible = ref(false);
const selected = ref([]);

// Mock Data
const mockConfig = {
  title: '设备查询 (Demo)',
  rowKey: 'id',
  formSchema: [
    { field: 'keyword', label: '关键字', component: 'Input', componentProps: { placeholder: '请输入设备名称/编码' } },
    { field: 'type', label: '类型', component: 'Select', componentProps: { options: [{ label: '类型A', value: 'A' }, { label: '类型B', value: 'B' }] } }
  ],
  tableColumns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '设备名称', minWidth: 150 },
    { field: 'code', title: '设备编码', width: 120 },
    { field: 'type', title: '类型', width: 100 },
    { field: 'status', title: '状态', width: 100 }
  ],
  searchApi: '/api/demo/devices'
};

const mockData = Array.from({ length: 200 }).map((_, i) => ({
  id: i + 1,
  name: `设备 ${i + 1}`,
  code: `DEV-${1000 + i}`,
  type: i % 2 === 0 ? 'A' : 'B',
  status: i % 3 === 0 ? '运行中' : '停机'
}));

// Save original methods
const originalGet = axios.get;
const originalPost = axios.post;

onMounted(() => {
  // Mock Axios
  // @ts-ignore
  axios.post = async (url: string, data: any) => {
    if (url === '/api/demo/devices') {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { pageNo = 1, pageSize = 20, conditions } = data;
      let list = mockData;
      
      // Filter by keyword
      if (conditions?.keyword) {
        list = list.filter(item => item.name.includes(conditions.keyword) || item.code.includes(conditions.keyword));
      }
       // Filter by type
      if (conditions?.type) {
        list = list.filter(item => item.type === conditions.type);
      }

      const start = (pageNo - 1) * pageSize;
      const end = start + pageSize;
      const pageList = list.slice(start, end);
      
      return { 
        data: { 
          list: pageList, 
          total: list.length 
        }, 
        status: 200 
      };
    }
    return originalPost(url, data);
  };
});

onUnmounted(() => {
  axios.post = originalPost;
});

const handleConfirm = (rows: any[]) => {
  console.log('Confirmed:', rows);
};
</script>

<template>
  <div class="p-4">
    <a-button type="primary" @click="visible = true">打开查询弹窗 (Demo)</a-button>
    
    <div class="mt-4" v-if="selected.length">
      <div class="font-bold mb-2">已选数据 ({{ selected.length }}):</div>
      <div class="flex flex-wrap gap-2">
        <a-tag v-for="item in selected" :key="item.id" closable @close="selected = selected.filter(i => i.id !== item.id)">
          {{ item.name }}
        </a-tag>
      </div>
    </div>

    <SunnySearchModal
      v-model:visible="visible"
      v-model="selected"
      sql-num="DEMO_DEVICE"
      :static-config="mockConfig"
      help-message="支持关键字、类型搜索；双击行可直接选中并关闭；支持跨页多选。"
      :field-names="{ label: 'name', desc: 'code' }"
      @confirm="handleConfirm"
    />
  </div>
</template>
