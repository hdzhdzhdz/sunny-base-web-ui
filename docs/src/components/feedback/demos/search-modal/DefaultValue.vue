<script setup lang="ts">
import { ref } from 'vue';
import { SunnySearchModal } from '@sunny-base-web/ui';

const visible = ref(false);
const selected = ref<any[]>([]);

// 表单配置：包含默认值
const formSchema = [
  {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    defaultValue: 'active', // 设置默认值
    componentProps: {
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
        { label: '全部', value: '' }
      ]
    }
  },
  {
    fieldName: 'type',
    label: '类型',
    component: 'Select',
    defaultValue: 'A', // 设置默认值
    componentProps: {
      options: [
        { label: '类型A', value: 'A' },
        { label: '类型B', value: 'B' },
        { label: '全部', value: '' }
      ]
    }
  },
  {
    fieldName: 'keyword',
    label: '关键字',
    component: 'Input',
    rules: 'required', // 必填校验
    componentProps: { placeholder: '请输入关键字' }
  }
];

const tableColumns = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  { field: 'id', title: 'ID', width: 80 },
  { field: 'name', title: '名称', minWidth: 150 },
  { field: 'status', title: '状态', width: 100 },
  { field: 'type', title: '类型', width: 100 }
];

// Mock Data
const mockData = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  name: `项目 ${i + 1}`,
  status: i % 3 === 0 ? 'inactive' : 'active',
  type: i % 2 === 0 ? 'A' : 'B'
}));

const searchApi = async (params: any) => {
  console.log('查询参数:', params); // 可以看到默认值已包含在参数中

  await new Promise(resolve => setTimeout(resolve, 300));

  const { pageNo = 1, pageSize = 20, ...conditions } = params;
  let list = mockData;

  // 根据状态筛选
  if (conditions?.status) {
    list = list.filter(item => item.status === conditions.status);
  }

  // 根据类型筛选
  if (conditions?.type) {
    list = list.filter(item => item.type === conditions.type);
  }

  // 根据关键字筛选
  if (conditions?.keyword) {
    const kw = conditions.keyword.toLowerCase();
    list = list.filter(item =>
      item.name.toLowerCase().includes(kw)
    );
  }

  const start = (pageNo - 1) * pageSize;
  const end = start + pageSize;

  return {
    list: list.slice(start, end),
    total: list.length
  };
};
</script>

<template>
  <div class="p-4">
    <a-button type="primary" @click="visible = true">打开查询弹窗 (含默认值)</a-button>

    <div class="mt-4 p-3 bg-gray-50 rounded">
      <div class="text-gray-500 text-sm mb-2">说明：</div>
      <ul class="text-gray-600 text-sm list-disc pl-5">
        <li>状态默认值：<code class="bg-gray-200 px-1">active</code>（启用）</li>
        <li>类型默认值：<code class="bg-gray-200 px-1">A</code>（类型A）</li>
        <li>弹窗打开时会自动带上默认值进行查询</li>
      </ul>
    </div>

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
      title="默认值查询示例"
      :form-schema="formSchema"
      :table-columns="tableColumns"
      :search-api="searchApi"
      :field-names="{ label: 'name' }"
    />
  </div>
</template>
