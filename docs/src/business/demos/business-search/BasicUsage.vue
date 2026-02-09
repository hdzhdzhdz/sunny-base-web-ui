<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SunnyBusinessSearch, registerBusinessConfig } from '@sunny-base-web/ui';

const value = ref([]);

// 注册一个测试配置
onMounted(() => {
  registerBusinessConfig('test-user', async () => ({
    title: '用户选择',
    width: 800,
    fieldNames: { label: 'name', value: 'id' },
    formSchema: [
      { label: '姓名', fieldName: 'name', component: 'Input', colProps: { span: 6 } },
      { label: '部门', fieldName: 'dept', component: 'Input', colProps: { span: 6 } }
    ],
    tableColumns: [
      { type: 'checkbox', width: 50 },
      { title: 'ID', field: 'id', width: 100 },
      { title: '姓名', field: 'name', width: 150 },
      { title: '部门', field: 'dept' }
    ],
    searchApi: async (params) => {
      console.log('Search params:', params);
      // 模拟请求
      return new Promise(resolve => setTimeout(() => {
        resolve({
          total: 2,
          records: [
            { id: 1, name: '张三', dept: '研发部' },
            { id: 2, name: '李四', dept: '市场部' }
          ]
        });
      }, 500));
    }
  }));
});
</script>

<template>
  <SunnyBusinessSearch
    v-model="value"
    type="test-user"
    placeholder="请选择用户 (静态配置)"
  />
  <div class="mt-4">Selected: {{ value }}</div>
</template>
