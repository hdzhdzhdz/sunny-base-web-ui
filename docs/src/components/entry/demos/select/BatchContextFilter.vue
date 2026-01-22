<template>
  <div class="space-y-4">
    <a-alert>
      BatchSelect 继承了 Select 的上下文过滤能力。当上下文变化导致选项不可见时，全选/粘贴等操作也会自动忽略这些选项，且已选中的失效值会被自动清除。
    </a-alert>

    <!-- 模拟表单上下文 -->
    <div class="p-4 border rounded bg-gray-50">
      <div class="font-bold mb-3">当前表单上下文 (filterModel)</div>
      <a-form :model="formModel" layout="inline">
        <a-form-item label="公司ID (company)">
          <a-input-number v-model="formModel.company" placeholder="例如: 1400" />
        </a-form-item>
      </a-form>
      <div class="mt-2 text-xs text-gray-500">
        * 只有 company 为 1400 时，"公司1400 专用" 选项才会显示。
      </div>
    </div>

    <!-- 组件展示 -->
    <div class="p-4 border rounded">
      <div class="font-bold mb-3">KunkkaBatchSelect 组件</div>
      <kunkka-batch-select
        v-model="value"
        :options="options"
        :filter-model="formModel"
        placeholder="请选择 (支持批量操作)"
        style="width: 100%"
      />
      <div class="mt-2 text-xs text-gray-400">
        当前选中值: {{ value }}
      </div>
    </div>

    <!-- 选项数据展示 -->
    <div class="p-4 border rounded bg-gray-50">
      <div class="font-bold mb-2">测试用例</div>
      <ul class="list-disc pl-5 text-sm text-gray-600">
        <li>
          <strong>自动清理：</strong> 选中 "公司1400 专用"，然后将公司ID改为 1500。预期：该选项被选中值中移除。
        </li>
        <li>
          <strong>批量粘贴：</strong> 复制以下内容：<br/>
          <code class="bg-gray-200 px-1 rounded">company_1400</code><br/>
          在公司ID为 1500 时粘贴。预期：不会选中任何项（因为该选项不可见）。
        </li>
        <li>
          <strong>全选：</strong> 在公司ID为 1500 时点击全选。预期：不会选中 "公司1400 专用"。
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
// 实际使用时请从 @kunkka/ui 引入
// import { KunkkaBatchSelect } from '@kunkka/ui';

const value = ref([]);

// 模拟表单上下文
const formModel = reactive({
  company: 1400,
});

// 定义选项，包含 cMeta 限制条件
const options = [
  { 
    label: '通用选项 A', 
    value: 'common_a' 
  },
  { 
    label: '通用选项 B', 
    value: 'common_b' 
  },
  { 
    label: '公司1400 专用', 
    value: 'company_1400',
    cMeta: { company: 1400 } // 只有当 formModel.company == 1400 时显示
  },
  { 
    label: '公司1500 专用', 
    value: 'company_1500',
    cMeta: { company: 1500 } // 只有当 formModel.company == 1500 时显示
  }
];
</script>
