<script setup lang="ts">
import { ref } from 'vue';
import { SunnySearchModal } from '@sunny-base-web/ui';

const visible = ref(false);
const selected = ref<any[]>([]);

const formSchema = [
  {
    fieldName: 'keyword',
    label: '关键字',
    component: 'Input',
    componentProps: { placeholder: '请输入关键字' }
  },
  {
    fieldName: 'customField',
    label: '自定义字段',
    component: 'Slot', // 设置为 Slot 模式
  },
  {
    fieldName: 'type',
    label: '类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '类型A', value: 'A' },
        { label: '类型B', value: 'B' }
      ]
    }
  }
];

const tableColumns = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  { field: 'id', title: 'ID', width: 80 },
  { field: 'name', title: '名称', minWidth: 150 },
  { field: 'customValue', title: '自定义值', width: 120 },
  { field: 'type', title: '类型', width: 100 }
];

// Mock Data
const mockData = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  name: `项目 ${i + 1}`,
  customValue: `CV-${1000 + i}`,
  type: i % 2 === 0 ? 'A' : 'B'
}));

const searchApi = async (params: any) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const { pageNo = 1, pageSize = 20, ...conditions } = params;
  let list = mockData;

  if (conditions?.keyword) {
    const kw = conditions.keyword.toLowerCase();
    list = list.filter(item =>
      item.name.toLowerCase().includes(kw)
    );
  }

  if (conditions?.customField) {
    list = list.filter(item =>
      item.customValue.includes(conditions.customField)
    );
  }

  if (conditions?.type) {
    list = list.filter(item => item.type === conditions.type);
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
    <a-button type="primary" @click="visible = true">打开查询弹窗 (含自定义 Slot)</a-button>

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
      title="自定义 Slot 查询"
      :form-schema="formSchema"
      :table-columns="tableColumns"
      :search-api="searchApi"
      :field-names="{ label: 'name', desc: 'customValue' }"
    >
      <!-- 自定义表单字段 Slot: slot 名称为 fieldName -->
      <template #customField="{ value, setValue, disabled }">
        <a-input-number
          :value="value"
          :disabled="disabled"
          placeholder="请输入数字"
          @change="setValue"
          style="width: 100%"
        />
      </template>
    </SunnySearchModal>
  </div>
</template>
