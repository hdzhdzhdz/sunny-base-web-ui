<template>
  <div class="flex flex-col gap-4">
    <a-alert>
      在此处修改 fieldNames 配置，观察下方组件如何适配不同的数据结构。
    </a-alert>

    <!-- 配置区域 -->
    <a-form layout="inline" :model="fieldConfig">
      <a-form-item label="Label 字段名">
        <a-input v-model="fieldConfig.label" placeholder="例如: name" />
      </a-form-item>
      <a-form-item label="Value 字段名">
        <a-input v-model="fieldConfig.value" placeholder="例如: id" />
      </a-form-item>
    </a-form>

    <a-divider />

    <!-- 模拟添加数据 -->
    <div class="flex gap-2 items-end">
      <a-form layout="inline" :model="newItem">
        <a-form-item :label="`${fieldConfig.label} (显示文本)`">
          <a-input v-model="newItem.label" placeholder="输入标签名" />
        </a-form-item>
        <a-form-item :label="`${fieldConfig.value} (值)`">
        <a-input v-model="newItem.value" placeholder="输入ID/Key" />
      </a-form-item>
    </a-form>
    </div>
    
    <div class="text-xs text-[var(--color-text-3)] -mt-2">
      * 填写上方数据后，点击下方组件右侧的搜索图标即可添加数据
    </div>

    <!-- 组件展示 -->
    <div class="border p-4 rounded bg-[var(--color-fill-1)]">
      <sunny-search-input-tag
        v-model="dataList"
        :field-names="fieldConfig"
        placeholder="点击右侧搜索图标添加数据..."
        @search="handleSearch"
      />
    </div>

    <!-- 数据展示 -->
    <div class="border p-4 rounded bg-[var(--color-fill-1)]">
      <div class="mb-2 text-sm text-[var(--color-text-2)]">当前绑定的数据结构 (modelValue)：</div>
      <pre class="text-xs bg-[var(--color-bg-2)] p-2 rounded">{{ dataList }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';

// 字段配置
const fieldConfig = reactive({
  label: 'username',
  value: 'userId'
});

// 模拟添加的新项
const newItem = reactive({
  label: 'Sunny',
  value: '1001'
});

// 绑定的数据列表
const dataList = ref([
  { userId: '1', username: 'Admin' },
  { userId: '2', username: 'Tester' }
]);

const addItem = () => {
  // 动态构建对象
  const item = {
    [fieldConfig.label]: newItem.label,
    [fieldConfig.value]: newItem.value
  };
  
  dataList.value.push(item);
  Message.success('添加成功');
  
  // 重置输入
  newItem.label = '';
  newItem.value = '';
};

const handleSearch = () => {
  if (!newItem.label || !newItem.value) {
    Message.warning('请先填写Label和Value');
    return;
  }
  addItem();
};
</script>
