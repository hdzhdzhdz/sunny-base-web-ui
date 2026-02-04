<script setup lang="ts">
import { useKunkkaForm } from '@sunny-base-web/ui';
import { Message, Button, Space } from '@arco-design/web-vue';

const [Form, formApi] = useKunkkaForm({
  // 1. 开启折叠按钮
  showCollapseButton: true,
  // 2. 默认折叠
  collapsed: true,
  // 3. 折叠时只显示一行
  collapsedRows: 1,
  
  // 表单字段配置
  commonConfig: {
    // 统一设置每个字段占 8 格 (一行 3 个)
    colProps: { span: 8 },
  },
  // 操作栏配置
  // 此时无需再显式配置 actionColProps，它会自动继承 commonConfig.colProps
  // actionColProps: { span: 8 },
  schema: [
    { fieldName: 'field1', label: '字1', component: 'Input', defaultValue: '默认值1' },
    { fieldName: 'field2', label: '字2', component: 'Input' },
    { fieldName: 'field3', label: '字3', component: 'Input' },
    { fieldName: 'field4', label: '字4', component: 'Input' },
    { fieldName: 'field5', label: '字5', component: 'Input' },
  ],
  handleSubmit: (values) => {
    Message.success('提交成功: ' + JSON.stringify(values));
  },
});

function handleToggle() {
  const { collapsed } = formApi.getState();
  formApi.setState({ collapsed: !collapsed });
}
</script>

<template>
  <Space style="margin-bottom: 16px">
    <Button @click="formApi.setState({ collapsed: false })">全部展开</Button>
    <Button @click="formApi.setState({ collapsed: true })">全部收起</Button>
    <Button type="primary" @click="handleToggle">切换状态</Button>
  </Space>
  <Form />
</template>
