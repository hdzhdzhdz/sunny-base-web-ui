<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { SunnySearchModal } from '@sunny-base-web/ui';
import axios from 'axios';

const visible = ref(false);
const selected = ref([]);

// 静态配置定义
const staticConfig = {
  title: '静态配置示例',
  rowKey: 'id',
  formSchema: [
    { 
      fieldName: 'keyword', 
      label: '搜索', 
      component: 'Input', 
      componentProps: { placeholder: '静态配置搜索...' } 
    }
  ],
  tableColumns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '名称', minWidth: 150 },
    { field: 'role', title: '角色', width: 120 }
  ],
  searchApi: '/api/demo/static-users' // 仍然需要一个数据接口
};

// 模拟数据
const mockUsers = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  role: i % 2 === 0 ? '管理员' : '普通用户'
}));

const originalPost = axios.post;

onMounted(() => {
  // @ts-ignore
  axios.post = async (url: string, data: any) => {
    if (url === '/api/demo/static-users') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const { pageNo = 1, pageSize = 20, conditions } = data;
      let list = mockUsers;
      
      if (conditions?.keyword) {
        list = list.filter(u => u.name.includes(conditions.keyword));
      }

      const start = (pageNo - 1) * pageSize;
      return {
        data: {
          list: list.slice(start, start + pageSize),
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
</script>

<template>
  <div class="p-4">
    <a-button @click="visible = true">打开静态配置弹窗</a-button>
    
    <div class="mt-4" v-if="selected.length">
      已选: {{ selected.map(i => i.name).join(', ') }}
    </div>

    <SunnySearchModal
      v-model:visible="visible"
      v-model="selected"
      sql-num="STATIC_DEMO" 
      :static-config="staticConfig"
      :row-key="staticConfig.rowKey"
      :field-names="{ label: 'name', desc: 'role' }"
    />
  </div>
</template>
