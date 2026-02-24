<script setup lang="ts">
import { useSunnyForm } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';
import { IconDownload, IconQuestionCircle, IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';

const baseSchema = [
  { fieldName: 'keyword', label: '关键词', component: 'Input' },
  { fieldName: 'status', label: '状态', component: 'Select' },
  { fieldName: 'category', label: '分类', component: 'Select' },
  { fieldName: 'dateRange', label: '日期范围', component: 'RangePicker' },
];

// 表单1: 使用默认操作栏 + 插槽扩展
const [Form1] = useSunnyForm({
  showCollapseButton: true,
  collapsedRows: 1,
  commonConfig: {
    colProps: { span: 24, md: 12, lg: 8 },
  },
  schema: baseSchema,
  handleSubmit: (values) => {
    Message.success('表单1 提交: ' + JSON.stringify(values));
  },
});

// 表单2: 使用 actions 插槽完全自定义
const [Form2, formApi2] = useSunnyForm({
  showDefaultActions: false,
  commonConfig: {
    colProps: { span: 24, md: 12, lg: 8 },
  },
  schema: baseSchema,
  handleSubmit: (values) => {
    Message.success('表单2 提交: ' + JSON.stringify(values));
  },
});

function handleExport() {
  Message.info('导出按钮被点击');
}

function handleCustomSubmit() {
  formApi2.submitForm();
}

function handleCustomReset() {
  formApi2.resetForm();
  Message.info('已重置');
}
</script>

<template>
  <div class="space-y-6">
    <!-- 示例1: 在默认按钮前后添加内容 -->
    <div>
      <div class="text-sm font-medium text-gray-700 mb-3">示例1: 使用 submit-before / expand-after 插槽扩展</div>
      <Form1>
        <template #submit-before>
          <a-button type="outline" size="small" @click="handleExport">
            <template #icon>
              <IconDownload />
            </template>
            导出
          </a-button>
        </template>

        <template #expand-after>
          <a-tooltip content="展开查看更多查询条件">
            <IconQuestionCircle class="ml-2 text-gray-400 cursor-help" />
          </a-tooltip>
        </template>
      </Form1>
    </div>

    <a-divider />

    <!-- 示例2: 完全自定义操作栏 -->
    <div>
      <div class="text-sm font-medium text-gray-700 mb-3">示例2: 使用 actions 插槽完全自定义操作栏</div>
      <Form2>
        <template #actions>
          <div class="flex items-center gap-2">
            <a-button type="primary" size="small" @click="handleCustomSubmit">
              <template #icon>
                <IconSearch />
              </template>
              查询
            </a-button>
            <a-button size="small" @click="handleCustomReset">
              <template #icon>
                <IconRefresh />
              </template>
              重置
            </a-button>
            <a-button type="outline" size="small" @click="handleExport">
              <template #icon>
                <IconDownload />
              </template>
              导出
            </a-button>
          </div>
        </template>
      </Form2>
    </div>
  </div>
</template>
